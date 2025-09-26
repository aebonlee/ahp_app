from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProjectViewSet, CriteriaViewSet, AlternativeViewSet, ComparisonViewSet

router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'criteria', CriteriaViewSet)
router.register(r'alternatives', AlternativeViewSet)
router.register(r'comparisons', ComparisonViewSet)

urlpatterns = [
    path('', include(router.urls)),
]