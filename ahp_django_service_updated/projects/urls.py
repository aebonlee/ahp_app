from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProjectViewSet, CriteriaViewSet, AlternativeViewSet,
    EvaluatorViewSet, ComparisonViewSet, ComparisonMatrixViewSet,
    ResultViewSet, SensitivityAnalysisViewSet, ProjectCriteriaView
)

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'criteria', CriteriaViewSet)
router.register(r'alternatives', AlternativeViewSet)
router.register(r'evaluators', EvaluatorViewSet)
router.register(r'comparisons', ComparisonViewSet)
router.register(r'matrices', ComparisonMatrixViewSet)
router.register(r'results', ResultViewSet)
router.register(r'sensitivity', SensitivityAnalysisViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('projects/<int:project_pk>/criteria/', ProjectCriteriaView.as_view(), name='project-criteria'),
]