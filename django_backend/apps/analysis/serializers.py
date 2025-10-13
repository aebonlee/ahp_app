"""
Analysis Serializers for AHP Platform
"""

from rest_framework import serializers
from .models import (
    AnalysisResult, 
    WeightVector, 
    ConsensusMetrics, 
    SensitivityAnalysis, 
    ComparisonMatrix,
    ReportTemplate
)


class AnalysisResultSerializer(serializers.ModelSerializer):
    """Serializer for AnalysisResult model"""
    
    project_title = serializers.CharField(source='project.title', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = AnalysisResult
        fields = [
            'id', 'project', 'project_title', 'type', 'title', 'description',
            'parameters', 'status', 'results', 'summary', 'created_by',
            'created_by_username', 'created_at', 'completed_at'
        ]
        read_only_fields = ['id', 'created_at', 'completed_at']


class WeightVectorSerializer(serializers.ModelSerializer):
    """Serializer for WeightVector model"""
    
    criteria_name = serializers.CharField(source='criteria.name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = WeightVector
        fields = [
            'id', 'project', 'project_title', 'criteria', 'criteria_name',
            'evaluation', 'weight', 'normalized_weight', 'rank', 'method',
            'calculated_at', 'is_final'
        ]
        read_only_fields = ['id', 'calculated_at']


class ConsensusMetricsSerializer(serializers.ModelSerializer):
    """Serializer for ConsensusMetrics model"""
    
    project_title = serializers.CharField(source='project.title', read_only=True)
    consensus_level_display = serializers.CharField(source='get_consensus_level_display', read_only=True)
    
    class Meta:
        model = ConsensusMetrics
        fields = [
            'id', 'project', 'project_title', 'kendall_w', 'spearman_rho',
            'consensus_index', 'total_evaluators', 'completed_evaluations',
            'average_consistency', 'high_disagreement_criteria', 'outlier_evaluators',
            'consensus_level', 'consensus_level_display', 'calculated_at'
        ]
        read_only_fields = ['id', 'calculated_at']


class SensitivityAnalysisSerializer(serializers.ModelSerializer):
    """Serializer for SensitivityAnalysis model"""
    
    criteria_name = serializers.CharField(source='criteria.name', read_only=True)
    project_title = serializers.CharField(source='project.title', read_only=True)
    
    class Meta:
        model = SensitivityAnalysis
        fields = [
            'id', 'project', 'project_title', 'criteria', 'criteria_name',
            'perturbation_range', 'steps', 'sensitivity_coefficient',
            'rank_reversals', 'critical_values', 'chart_data', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ComparisonMatrixSerializer(serializers.ModelSerializer):
    """Serializer for ComparisonMatrix model"""
    
    evaluation_title = serializers.CharField(source='evaluation.title', read_only=True)
    parent_criteria_name = serializers.CharField(source='parent_criteria.name', read_only=True)
    
    class Meta:
        model = ComparisonMatrix
        fields = [
            'id', 'evaluation', 'evaluation_title', 'parent_criteria',
            'parent_criteria_name', 'matrix_data', 'criteria_order',
            'dimension', 'consistency_ratio', 'eigenvalue_max', 
            'priority_vector', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ReportTemplateSerializer(serializers.ModelSerializer):
    """Serializer for ReportTemplate model"""
    
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    template_type_display = serializers.CharField(source='get_template_type_display', read_only=True)
    
    class Meta:
        model = ReportTemplate
        fields = [
            'id', 'name', 'description', 'template_type', 'template_type_display',
            'template_content', 'is_default', 'is_active', 'created_by',
            'created_by_username', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


# Request/Response Serializers for API endpoints

class IndividualAnalysisRequestSerializer(serializers.Serializer):
    """Request serializer for individual analysis"""
    
    project_id = serializers.UUIDField()
    evaluator_id = serializers.UUIDField()
    comparisons = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )
    
    def validate_comparisons(self, value):
        """Validate comparison data structure"""
        required_fields = ['criteria_1', 'criteria_2', 'value']
        
        for comparison in value:
            for field in required_fields:
                if field not in comparison:
                    raise serializers.ValidationError(
                        f"Missing required field '{field}' in comparison"
                    )
            
            # Validate comparison value
            try:
                comp_value = float(comparison['value'])
                if not (1/9 <= comp_value <= 9):
                    raise serializers.ValidationError(
                        "Comparison value must be between 1/9 and 9"
                    )
            except (ValueError, TypeError):
                raise serializers.ValidationError(
                    "Comparison value must be a valid number"
                )
        
        return value


class GroupAnalysisRequestSerializer(serializers.Serializer):
    """Request serializer for group analysis"""
    
    project_id = serializers.UUIDField()
    method = serializers.ChoiceField(
        choices=['geometric_mean', 'arithmetic_mean', 'weighted_geometric_mean'],
        default='geometric_mean'
    )
    evaluator_weights = serializers.ListField(
        child=serializers.FloatField(),
        required=False,
        allow_null=True
    )


class SensitivityAnalysisRequestSerializer(serializers.Serializer):
    """Request serializer for sensitivity analysis"""
    
    project_id = serializers.UUIDField()
    target_criterion = serializers.CharField()
    perturbation_range = serializers.FloatField(default=0.1, min_value=0.01, max_value=0.5)
    steps = serializers.IntegerField(default=20, min_value=10, max_value=100)


class FinalPrioritiesRequestSerializer(serializers.Serializer):
    """Request serializer for final priorities calculation"""
    
    project_id = serializers.UUIDField()
    criteria_weights = serializers.DictField(
        child=serializers.FloatField(min_value=0, max_value=1)
    )
    alternative_comparisons = serializers.DictField(
        child=serializers.ListField(
            child=serializers.DictField(
                child=serializers.CharField()
            )
        )
    )
    
    def validate_criteria_weights(self, value):
        """Validate that criteria weights sum to approximately 1"""
        total = sum(value.values())
        if not (0.95 <= total <= 1.05):  # Allow small rounding errors
            raise serializers.ValidationError(
                "Criteria weights must sum to approximately 1.0"
            )
        return value


# Response Serializers

class AnalysisResultResponseSerializer(serializers.Serializer):
    """Response serializer for analysis results"""
    
    success = serializers.BooleanField()
    analysis_id = serializers.UUIDField(required=False)
    results = serializers.DictField(required=False)
    error = serializers.CharField(required=False)


class WeightCalculationResponseSerializer(serializers.Serializer):
    """Response serializer for weight calculations"""
    
    weights = serializers.DictField(child=serializers.FloatField())
    consistency_ratio = serializers.FloatField()
    lambda_max = serializers.FloatField()
    rank = serializers.ListField(child=serializers.ListField())
    is_consistent = serializers.BooleanField()


class GroupAnalysisResponseSerializer(serializers.Serializer):
    """Response serializer for group analysis"""
    
    weights = serializers.DictField(child=serializers.FloatField())
    consistency_ratio = serializers.FloatField()
    rank = serializers.ListField(child=serializers.ListField())
    is_consistent = serializers.BooleanField()
    consensus_metrics = serializers.DictField()
    evaluator_count = serializers.IntegerField()


class SensitivityResultSerializer(serializers.Serializer):
    """Response serializer for sensitivity analysis results"""
    
    criterion = serializers.CharField()
    sensitivity_coefficient = serializers.FloatField()
    rank_reversals = serializers.ListField(child=serializers.DictField())
    critical_values = serializers.DictField()
    chart_data = serializers.DictField()


class ConsensusMetricsResponseSerializer(serializers.Serializer):
    """Response serializer for consensus metrics"""
    
    kendall_w = serializers.FloatField()
    spearman_rho = serializers.FloatField()
    consensus_index = serializers.FloatField()
    consensus_level = serializers.CharField()
    disagreement_criteria = serializers.ListField(child=serializers.CharField())
    outlier_evaluators = serializers.ListField(child=serializers.IntegerField())


class ProjectSummaryResponseSerializer(serializers.Serializer):
    """Response serializer for project analysis summary"""
    
    project = serializers.DictField()
    analyses = serializers.DictField()
    latest_results = serializers.DictField()
    
    def to_representation(self, instance):
        """Custom representation to include computed fields"""
        data = super().to_representation(instance)
        
        # Add computed statistics
        if 'latest_results' in data and 'group' in data['latest_results']:
            group_result = data['latest_results']['group']
            
            # Add rank stability indicator
            cr = group_result.get('consistency_ratio', 0)
            data['rank_stability'] = 'high' if cr < 0.1 else 'medium' if cr < 0.2 else 'low'
            
            # Add consensus quality
            consensus = group_result.get('consensus_metrics', {})
            consensus_index = consensus.get('consensus_index', 0)
            data['consensus_quality'] = (
                'high' if consensus_index > 0.7 else 
                'medium' if consensus_index > 0.4 else 
                'low'
            )
        
        return data


# Validation Helpers

def validate_matrix_consistency(matrix_data, tolerance=0.1):
    """Validate that a comparison matrix has acceptable consistency"""
    import numpy as np
    
    try:
        matrix = np.array(matrix_data)
        n = matrix.shape[0]
        
        # Calculate eigenvalues
        eigenvalues = np.linalg.eigvals(matrix)
        lambda_max = max(eigenvalues.real)
        
        # Calculate consistency ratio
        ci = (lambda_max - n) / (n - 1) if n > 1 else 0
        ri_values = {2: 0, 3: 0.52, 4: 0.89, 5: 1.11, 6: 1.25, 7: 1.35, 8: 1.40, 9: 1.45}
        ri = ri_values.get(n, 1.49)
        cr = ci / ri if ri > 0 else 0
        
        return cr <= tolerance
        
    except Exception:
        return False


def validate_comparison_completeness(comparisons, criteria):
    """Validate that all pairwise comparisons are provided"""
    required_pairs = set()
    provided_pairs = set()
    
    # Generate all required pairs
    for i, crit1 in enumerate(criteria):
        for j, crit2 in enumerate(criteria):
            if i < j:  # Upper triangular only
                required_pairs.add((crit1, crit2))
    
    # Check provided pairs
    for comp in comparisons:
        crit1, crit2 = comp['criteria_1'], comp['criteria_2']
        pair = (crit1, crit2) if crit1 < crit2 else (crit2, crit1)
        provided_pairs.add(pair)
    
    missing_pairs = required_pairs - provided_pairs
    return len(missing_pairs) == 0, list(missing_pairs)