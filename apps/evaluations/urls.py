"""
URLs for Evaluation API
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create router and register viewsets
router = DefaultRouter()
router.register(r'evaluations', views.EvaluationViewSet, basename='evaluation')
router.register(r'comparisons', views.PairwiseComparisonViewSet, basename='comparison')
router.register(r'invitations', views.EvaluationInvitationViewSet, basename='invitation')
router.register(r'demographic-surveys', views.DemographicSurveyViewSet, basename='demographic-survey')

# Custom URL patterns
urlpatterns = [
    # Include router URLs
    path('', include(router.urls)),
    
    # Additional custom endpoints
    path('dashboard/', views.evaluator_dashboard, name='evaluator-dashboard'),
    path('statistics/', views.evaluation_statistics, name='evaluation-statistics'),
]