"""
Views for Export API
"""
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from django.db import models
import json
import csv
import io

from .models import ExportJob, ExportTemplate
from apps.projects.models import Project


class ExportViewSet(viewsets.ModelViewSet):
    """ViewSet for managing exports"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter exports based on user permissions"""
        user = self.request.user
        return ExportJob.objects.filter(
            created_by=user
        ).order_by('-created_at')
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        from .serializers import ExportJobSerializer
        return ExportJobSerializer
    
    def perform_create(self, serializer):
        """Set export creator"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def project_data(self, request):
        """Export project data in various formats"""
        project_id = request.data.get('project_id')
        export_format = request.data.get('format', 'json')
        
        if not project_id:
            return Response(
                {'error': 'project_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            project = Project.objects.get(
                id=project_id,
                owner=request.user
            )
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Prepare export data
        export_data = {
            'project': {
                'id': str(project.id),
                'title': project.title,
                'description': project.description,
                'objective': project.objective,
                'created_at': project.created_at.isoformat(),
                'updated_at': project.updated_at.isoformat(),
            },
            'criteria': [],
            'evaluations': [],
            'results': []
        }
        
        # Add criteria
        for criteria in project.criteria.filter(is_active=True):
            export_data['criteria'].append({
                'id': str(criteria.id),
                'name': criteria.name,
                'description': criteria.description,
                'type': criteria.type,
                'level': criteria.level,
                'order': criteria.order
            })
        
        # Add evaluations
        for evaluation in project.evaluations.all():
            eval_data = {
                'id': str(evaluation.id),
                'evaluator': evaluation.evaluator.username,
                'status': evaluation.status,
                'progress': evaluation.progress,
                'consistency_ratio': evaluation.consistency_ratio,
                'created_at': evaluation.created_at.isoformat(),
                'comparisons': []
            }
            
            # Add comparisons
            for comparison in evaluation.pairwise_comparisons.all():
                eval_data['comparisons'].append({
                    'criteria_a': comparison.criteria_a.name,
                    'criteria_b': comparison.criteria_b.name,
                    'value': comparison.value,
                    'confidence': comparison.confidence
                })
            
            export_data['evaluations'].append(eval_data)
        
        # Create export job
        export_job = ExportJob.objects.create(
            project=project,
            export_type='project_data',
            format=export_format,
            status='processing',
            created_by=request.user
        )
        
        # Generate file based on format
        if export_format == 'json':
            response = HttpResponse(
                json.dumps(export_data, indent=2),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="project_{project.id}_data.json"'
        
        elif export_format == 'csv':
            output = io.StringIO()
            
            # Write criteria
            output.write("=== CRITERIA ===\n")
            writer = csv.writer(output)
            writer.writerow(['ID', 'Name', 'Description', 'Type', 'Level', 'Order'])
            for criteria in export_data['criteria']:
                writer.writerow([
                    criteria['id'], criteria['name'], criteria['description'],
                    criteria['type'], criteria['level'], criteria['order']
                ])
            
            output.write("\n=== EVALUATIONS ===\n")
            writer.writerow(['Evaluation ID', 'Evaluator', 'Status', 'Progress', 'Consistency Ratio'])
            for evaluation in export_data['evaluations']:
                writer.writerow([
                    evaluation['id'], evaluation['evaluator'], evaluation['status'],
                    evaluation['progress'], evaluation['consistency_ratio']
                ])
            
            output.write("\n=== COMPARISONS ===\n")
            writer.writerow(['Evaluation ID', 'Criteria A', 'Criteria B', 'Value', 'Confidence'])
            for evaluation in export_data['evaluations']:
                for comparison in evaluation['comparisons']:
                    writer.writerow([
                        evaluation['id'], comparison['criteria_a'], comparison['criteria_b'],
                        comparison['value'], comparison['confidence']
                    ])
            
            response = HttpResponse(
                output.getvalue(),
                content_type='text/csv'
            )
            response['Content-Disposition'] = f'attachment; filename="project_{project.id}_data.csv"'
        
        else:
            return Response(
                {'error': 'Unsupported format'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update export job
        export_job.status = 'completed'
        export_job.save()
        
        return response
    
    @action(detail=False, methods=['post'])
    def results_report(self, request):
        """Export analysis results as a report"""
        project_id = request.data.get('project_id')
        report_format = request.data.get('format', 'json')
        
        if not project_id:
            return Response(
                {'error': 'project_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            project = Project.objects.get(
                id=project_id,
                owner=request.user
            )
        except Project.DoesNotExist:
            return Response(
                {'error': 'Project not found or access denied'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Get analysis results
        from apps.analysis.models import WeightVector, AnalysisResult
        
        weights = WeightVector.objects.filter(
            project=project,
            is_final=True
        ).select_related('criteria').order_by('-normalized_weight')
        
        analysis_results = AnalysisResult.objects.filter(
            project=project,
            status='completed'
        ).order_by('-created_at')
        
        report_data = {
            'project': {
                'title': project.title,
                'description': project.description,
                'objective': project.objective
            },
            'final_weights': [
                {
                    'criteria': w.criteria.name,
                    'weight': w.normalized_weight,
                    'rank': w.rank
                }
                for w in weights
            ],
            'analysis_summary': {
                'total_evaluations': project.evaluations.count(),
                'completed_evaluations': project.evaluations.filter(status='completed').count(),
                'average_consistency': project.evaluations.filter(
                    consistency_ratio__isnull=False
                ).aggregate(avg=models.Avg('consistency_ratio'))['avg'] or 0
            }
        }
        
        # Create export job
        export_job = ExportJob.objects.create(
            project=project,
            export_type='results_report',
            format=report_format,
            status='completed',
            created_by=request.user
        )
        
        if report_format == 'json':
            response = HttpResponse(
                json.dumps(report_data, indent=2),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="project_{project.id}_report.json"'
        else:
            return Response(
                {'error': 'Only JSON format supported for reports'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return response


class ExportTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for managing export templates"""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get user's export templates"""
        user = self.request.user
        return ExportTemplate.objects.filter(
            models.Q(created_by=user) | models.Q(is_public=True)
        ).order_by('-created_at')
    
    def get_serializer_class(self):
        """Return appropriate serializer"""
        from .serializers import ExportTemplateSerializer
        return ExportTemplateSerializer
    
    def perform_create(self, serializer):
        """Set template creator"""
        serializer.save(created_by=self.request.user)