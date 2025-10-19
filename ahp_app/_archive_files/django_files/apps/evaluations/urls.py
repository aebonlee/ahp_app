"""
URLs for Evaluation API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from . import views_assignment

# Create router and register viewsets
router = DefaultRouter()
router.register(r'evaluations', views.EvaluationViewSet, basename='evaluation')
router.register(r'comparisons', views.PairwiseComparisonViewSet, basename='comparison')
router.register(r'invitations', views.EvaluationInvitationViewSet, basename='invitation')
router.register(r'demographic-surveys', views.DemographicSurveyViewSet, basename='demographic-survey')

# Assignment system viewsets
router.register(r'bulk-invitations', views_assignment.BulkInvitationViewSet, basename='bulk-invitation')
router.register(r'templates', views_assignment.EvaluationTemplateViewSet, basename='evaluation-template')
router.register(r'progress', views_assignment.EvaluatorProgressViewSet, basename='evaluator-progress')

# Custom URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Additional custom endpoints
    path('dashboard/', views.evaluator_dashboard, name='evaluator-dashboard'),
    path('statistics/', views.evaluation_statistics, name='evaluation-statistics'),
]