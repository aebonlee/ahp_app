from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_nested import routers
from .views import ProjectViewSet, CriteriaViewSet, AlternativeViewSet, ComparisonViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'criteria', CriteriaViewSet)
router.register(r'alternatives', AlternativeViewSet)
router.register(r'comparisons', ComparisonViewSet)

# Nested routes for project-specific resources
projects_router = routers.NestedDefaultRouter(router, r'projects', lookup='project')
projects_router.register(r'criteria', CriteriaViewSet, basename='project-criteria')
projects_router.register(r'alternatives', AlternativeViewSet, basename='project-alternatives')
projects_router.register(r'comparisons', ComparisonViewSet, basename='project-comparisons')

urlpatterns = [
    path('', include(router.urls)),
    path('', include(projects_router.urls)),
]