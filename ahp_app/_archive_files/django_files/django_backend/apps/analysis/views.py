"""
Views for Analysis API including Sensitivity Analysis
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import transaction, models as db_models
import numpy as np
from scipy import stats

from .models import (
    AnalysisResult, WeightVector, ConsensusMetrics, 
    SensitivityAnalysis, ComparisonMatrix
)
from apps.projects.models import Project, Criteria
from apps.evaluations.models import Evaluation, PairwiseComparison


class AnalysisViewSet(viewsets.ViewSet):
    """ViewSet for AHP analysis operations"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=True, methods=['post'])
    def calculate_weights(self, request, pk=None):
        """Calculate weight vectors for a project"""
        project = Project.objects.get(pk=pk)
        evaluations = project.evaluations.filter(status='completed')
        
        if not evaluations:
            return Response(
                {'error': 'No completed evaluations found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        with transaction.atomic():
            # Create analysis result
            analysis = AnalysisResult.objects.create(
                project=project,
                type='individual' if evaluations.count() == 1 else 'group',
                title=f"Weight calculation for {project.title}",
                created_by=request.user
            )
            
            # Calculate weights for each evaluation
            all_weights = []
            for evaluation in evaluations:
                weights = self._calculate_evaluation_weights(evaluation)
                all_weights.append(weights)
                
                # Store individual weights
                for criteria_id, weight in weights.items():
                    criteria = Criteria.objects.get(id=criteria_id)
                    WeightVector.objects.create(
                        project=project,
                        criteria=criteria,
                        evaluation=evaluation,
                        weight=weight['weight'],
                        normalized_weight=weight['normalized'],
                        rank=weight['rank']
                    )
            
            # Calculate group weights if multiple evaluations
            if len(all_weights) > 1:
                group_weights = self._aggregate_weights(all_weights)
                
                # Store final weights
                for criteria_id, weight in group_weights.items():
                    criteria = Criteria.objects.get(id=criteria_id)
                    WeightVector.objects.create(
                        project=project,
                        criteria=criteria,
                        weight=weight['weight'],
                        normalized_weight=weight['normalized'],
                        rank=weight['rank'],
                        is_final=True
                    )
            
            analysis.status = 'completed'
            analysis.mark_completed()
            
        return Response({
            'message': 'Weights calculated successfully',
            'analysis_id': analysis.id
        })
    
    @action(detail=True, methods=['post'])
    def sensitivity_analysis(self, request, pk=None):
        """Perform sensitivity analysis on project results"""
        project = Project.objects.get(pk=pk)
        criteria_id = request.data.get('criteria_id')
        
        if not criteria_id:
            return Response(
                {'error': 'criteria_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        criteria = Criteria.objects.get(id=criteria_id, project=project)
        
        # Get current weights
        weights = WeightVector.objects.filter(
            project=project,
            is_final=True
        ).values('criteria_id', 'weight')
        
        if not weights:
            return Response(
                {'error': 'No final weights found. Calculate weights first.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Perform sensitivity analysis
        perturbation_range = request.data.get('range', 0.1)  # ±10% default
        steps = request.data.get('steps', 20)
        
        sensitivity_data = self._perform_sensitivity_analysis(
            project, criteria, weights, perturbation_range, steps
        )
        
        # Store results
        sensitivity = SensitivityAnalysis.objects.create(
            project=project,
            criteria=criteria,
            perturbation_range=perturbation_range,
            steps=steps,
            sensitivity_coefficient=sensitivity_data['coefficient'],
            rank_reversals=sensitivity_data['reversals'],
            critical_values=sensitivity_data['critical_values'],
            chart_data=sensitivity_data['chart_data']
        )
        
        return Response({
            'message': 'Sensitivity analysis completed',
            'sensitivity_id': sensitivity.id,
            'data': sensitivity_data
        })
    
    @action(detail=True, methods=['get'])
    def consensus_metrics(self, request, pk=None):
        """Calculate consensus metrics for group evaluations"""
        project = Project.objects.get(pk=pk)
        evaluations = project.evaluations.filter(status='completed')
        
        if evaluations.count() < 2:
            return Response(
                {'error': 'At least 2 evaluations required for consensus analysis'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get individual weight vectors
        weight_vectors = []
        for evaluation in evaluations:
            weights = WeightVector.objects.filter(
                project=project,
                evaluation=evaluation
            ).values_list('criteria_id', 'normalized_weight')
            weight_vectors.append(dict(weights))
        
        # Calculate consensus metrics
        consensus_data = self._calculate_consensus_metrics(weight_vectors)
        
        # Store results
        metrics = ConsensusMetrics.objects.create(
            project=project,
            kendall_w=consensus_data['kendall_w'],
            spearman_rho=consensus_data['spearman_rho'],
            consensus_index=consensus_data['consensus_index'],
            total_evaluators=evaluations.count(),
            completed_evaluations=evaluations.count(),
            average_consistency=evaluations.aggregate(
                avg=db_models.Avg('consistency_ratio')
            )['avg'],
            high_disagreement_criteria=consensus_data['disagreements'],
            outlier_evaluators=consensus_data['outliers'],
            consensus_level=consensus_data['level']
        )
        
        return Response({
            'message': 'Consensus analysis completed',
            'metrics': consensus_data
        })
    
    def _calculate_evaluation_weights(self, evaluation):
        """Calculate weights from pairwise comparisons"""
        comparisons = evaluation.pairwise_comparisons.all()
        
        # Group by parent criteria for hierarchical analysis
        criteria_groups = {}
        for comp in comparisons:
            parent = comp.criteria_a.parent_id or 'root'
            if parent not in criteria_groups:
                criteria_groups[parent] = []
            criteria_groups[parent].append(comp)
        
        weights = {}
        for parent, group_comps in criteria_groups.items():
            group_weights = self._calculate_group_weights(group_comps)
            weights.update(group_weights)
        
        return weights
    
    def _calculate_group_weights(self, comparisons):
        """Calculate weights for a group of comparisons using eigenvector method"""
        if not comparisons:
            return {}
        
        # Get unique criteria
        criteria_set = set()
        for comp in comparisons:
            criteria_set.add(comp.criteria_a)
            criteria_set.add(comp.criteria_b)
        criteria_list = list(criteria_set)
        n = len(criteria_list)
        
        # Build comparison matrix
        matrix = np.ones((n, n))
        for comp in comparisons:
            i = criteria_list.index(comp.criteria_a)
            j = criteria_list.index(comp.criteria_b)
            matrix[i][j] = comp.value
            matrix[j][i] = 1.0 / comp.value
        
        # Calculate eigenvector
        eigenvalues, eigenvectors = np.linalg.eig(matrix)
        max_idx = np.argmax(eigenvalues.real)
        eigenvector = eigenvectors[:, max_idx].real
        eigenvector = eigenvector / np.sum(eigenvector)
        
        # Create weight dictionary
        weights = {}
        sorted_indices = np.argsort(eigenvector)[::-1]
        for rank, idx in enumerate(sorted_indices, 1):
            criteria = criteria_list[idx]
            weights[criteria.id] = {
                'weight': float(eigenvector[idx]),
                'normalized': float(eigenvector[idx]),
                'rank': rank
            }
        
        return weights
    
    def _aggregate_weights(self, all_weights):
        """Aggregate weights using geometric mean"""
        if not all_weights:
            return {}
        
        # Get all criteria IDs
        all_criteria = set()
        for weights in all_weights:
            all_criteria.update(weights.keys())
        
        # Calculate geometric mean for each criteria
        aggregated = {}
        for criteria_id in all_criteria:
            values = []
            for weights in all_weights:
                if criteria_id in weights:
                    values.append(weights[criteria_id]['weight'])
            
            if values:
                # Geometric mean
                geo_mean = np.exp(np.mean(np.log(values)))
                aggregated[criteria_id] = {
                    'weight': float(geo_mean),
                    'normalized': 0,  # Will normalize after
                    'rank': 0
                }
        
        # Normalize weights
        total = sum(w['weight'] for w in aggregated.values())
        for criteria_id in aggregated:
            aggregated[criteria_id]['normalized'] = aggregated[criteria_id]['weight'] / total
        
        # Assign ranks
        sorted_criteria = sorted(
            aggregated.items(),
            key=lambda x: x[1]['weight'],
            reverse=True
        )
        for rank, (criteria_id, _) in enumerate(sorted_criteria, 1):
            aggregated[criteria_id]['rank'] = rank
        
        return aggregated
    
    def _perform_sensitivity_analysis(self, project, criteria, weights, perturbation_range, steps):
        """Perform sensitivity analysis by varying criteria weight"""
        base_weight = next(
            (w['weight'] for w in weights if w['criteria_id'] == criteria.id),
            0
        )
        
        if base_weight == 0:
            return {
                'coefficient': 0,
                'reversals': [],
                'critical_values': {},
                'chart_data': []
            }
        
        # Generate perturbation values
        perturbations = np.linspace(
            base_weight * (1 - perturbation_range),
            base_weight * (1 + perturbation_range),
            steps
        )
        
        chart_data = []
        rank_reversals = []
        
        for perturbed_weight in perturbations:
            # Adjust weights
            adjusted_weights = weights.copy()
            for w in adjusted_weights:
                if w['criteria_id'] == criteria.id:
                    w['weight'] = perturbed_weight
            
            # Recalculate rankings
            rankings = self._calculate_rankings(adjusted_weights)
            
            # Check for rank reversals
            if len(chart_data) > 0:
                prev_rankings = chart_data[-1]['rankings']
                for alt_id in rankings:
                    if rankings[alt_id] != prev_rankings.get(alt_id):
                        rank_reversals.append({
                            'weight': perturbed_weight,
                            'alternative': alt_id,
                            'old_rank': prev_rankings.get(alt_id),
                            'new_rank': rankings[alt_id]
                        })
            
            chart_data.append({
                'weight': perturbed_weight,
                'rankings': rankings
            })
        
        # Calculate sensitivity coefficient
        sensitivity_coefficient = len(rank_reversals) / steps if steps > 0 else 0
        
        return {
            'coefficient': sensitivity_coefficient,
            'reversals': rank_reversals,
            'critical_values': {
                'min_stable': perturbations[0],
                'max_stable': perturbations[-1]
            },
            'chart_data': chart_data
        }
    
    def _calculate_rankings(self, weights):
        """Calculate alternative rankings based on weights"""
        # Simplified ranking calculation
        # In real implementation, would calculate based on full hierarchy
        rankings = {}
        sorted_weights = sorted(weights, key=lambda x: x['weight'], reverse=True)
        for rank, w in enumerate(sorted_weights, 1):
            rankings[w['criteria_id']] = rank
        return rankings
    
    def _calculate_consensus_metrics(self, weight_vectors):
        """Calculate various consensus metrics"""
        n_evaluators = len(weight_vectors)
        n_criteria = len(weight_vectors[0]) if weight_vectors else 0
        
        if n_evaluators < 2 or n_criteria == 0:
            return {
                'kendall_w': 0,
                'spearman_rho': 0,
                'consensus_index': 0,
                'disagreements': [],
                'outliers': [],
                'level': 'low'
            }
        
        # Convert to matrix form
        matrix = []
        criteria_ids = list(weight_vectors[0].keys())
        for weights in weight_vectors:
            row = [weights.get(cid, 0) for cid in criteria_ids]
            matrix.append(row)
        matrix = np.array(matrix)
        
        # Calculate Kendall's W
        rankings = np.array([stats.rankdata(row) for row in matrix])
        mean_rank = np.mean(rankings, axis=0)
        ss_total = np.sum((rankings - mean_rank) ** 2)
        kendall_w = (12 * ss_total) / (n_evaluators ** 2 * (n_criteria ** 3 - n_criteria))
        
        # Calculate average Spearman correlation
        correlations = []
        for i in range(n_evaluators):
            for j in range(i + 1, n_evaluators):
                rho, _ = stats.spearmanr(matrix[i], matrix[j])
                correlations.append(rho)
        spearman_rho = np.mean(correlations) if correlations else 0
        
        # Calculate consensus index (custom metric)
        consensus_index = (kendall_w + spearman_rho) / 2
        
        # Identify high disagreement criteria
        std_devs = np.std(matrix, axis=0)
        threshold = np.percentile(std_devs, 75)
        disagreements = [
            criteria_ids[i] for i, std in enumerate(std_devs)
            if std > threshold
        ]
        
        # Identify outlier evaluators
        mean_weights = np.mean(matrix, axis=0)
        distances = [np.linalg.norm(row - mean_weights) for row in matrix]
        outlier_threshold = np.percentile(distances, 90)
        outliers = [i for i, d in enumerate(distances) if d > outlier_threshold]
        
        # Determine consensus level
        if consensus_index > 0.7:
            level = 'high'
        elif consensus_index > 0.4:
            level = 'medium'
        else:
            level = 'low'
        
        return {
            'kendall_w': float(kendall_w),
            'spearman_rho': float(spearman_rho),
            'consensus_index': float(consensus_index),
            'disagreements': disagreements,
            'outliers': outliers,
            'level': level
        }


class SensitivityAnalysisViewSet(viewsets.ViewSet):
    """ViewSet for sensitivity analysis operations"""
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def tornado_chart(self, request):
        """Generate tornado chart data for sensitivity analysis"""
        project_id = request.data.get('project_id')
        
        if not project_id:
            return Response(
                {'error': 'project_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        project = Project.objects.get(pk=project_id)
        criteria = project.criteria.filter(type='criteria', is_active=True)
        
        tornado_data = []
        for criterion in criteria:
            # Get sensitivity analysis if exists
            sensitivity = SensitivityAnalysis.objects.filter(
                project=project,
                criteria=criterion
            ).first()
            
            if sensitivity:
                tornado_data.append({
                    'criteria': criterion.name,
                    'sensitivity': sensitivity.sensitivity_coefficient,
                    'min_impact': sensitivity.critical_values.get('min_stable', 0),
                    'max_impact': sensitivity.critical_values.get('max_stable', 1)
                })
        
        # Sort by sensitivity coefficient
        tornado_data.sort(key=lambda x: x['sensitivity'], reverse=True)
        
        return Response({
            'tornado_chart': tornado_data,
            'most_sensitive': tornado_data[0] if tornado_data else None
        })
    
    @action(detail=False, methods=['post'])
    def pareto_analysis(self, request):
        """Perform Pareto analysis on criteria weights"""
        project_id = request.data.get('project_id')
        
        if not project_id:
            return Response(
                {'error': 'project_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        weights = WeightVector.objects.filter(
            project_id=project_id,
            is_final=True
        ).order_by('-normalized_weight')
        
        if not weights:
            return Response(
                {'error': 'No final weights found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate cumulative percentages
        total = sum(w.normalized_weight for w in weights)
        cumulative = 0
        pareto_data = []
        vital_few = []
        
        for weight in weights:
            percentage = (weight.normalized_weight / total) * 100
            cumulative += percentage
            
            pareto_data.append({
                'criteria': weight.criteria.name,
                'weight': weight.normalized_weight,
                'percentage': percentage,
                'cumulative': cumulative
            })
            
            # 80/20 rule
            if cumulative <= 80:
                vital_few.append(weight.criteria.name)
        
        return Response({
            'pareto_data': pareto_data,
            'vital_few': vital_few,
            'trivial_many': len(weights) - len(vital_few)
        })