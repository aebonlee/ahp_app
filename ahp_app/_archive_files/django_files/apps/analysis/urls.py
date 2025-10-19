"""
Analysis URLs - AHP 분석 API 엔드포인트 라우팅
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalysisViewSet
from .views_advanced import AdvancedAnalysisViewSet

app_name = 'analysis'

# DRF Router 설정
router = DefaultRouter()
router.register(r'analysis', AnalysisViewSet, basename='analysis')
router.register(r'advanced', AdvancedAnalysisViewSet, basename='advanced-analysis')

urlpatterns = [
    # DRF Router URLs
    path('', include(router.urls)),
    
    # Custom analysis endpoints
    path('calculate/individual/', 
         AnalysisViewSet.as_view({'post': 'calculate_individual'}), 
         name='calculate-individual'),
    
    path('calculate/group/', 
         AnalysisViewSet.as_view({'post': 'calculate_group'}), 
         name='calculate-group'),
    
    path('sensitivity/', 
         AnalysisViewSet.as_view({'post': 'sensitivity_analysis'}), 
         name='sensitivity-analysis'),
    
    path('final-priorities/', 
         AnalysisViewSet.as_view({'post': 'calculate_final_priorities'}), 
         name='final-priorities'),
    
    path('project-summary/', 
         AnalysisViewSet.as_view({'get': 'project_summary'}), 
         name='project-summary'),
]