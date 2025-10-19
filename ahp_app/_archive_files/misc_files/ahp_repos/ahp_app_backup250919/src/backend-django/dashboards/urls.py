"""
Dashboard URL Configuration
Role-based dashboard routing
"""
from django.urls import path
from . import views

app_name = 'dashboards'

urlpatterns = [
    # Personal Service Dashboard
    path('', views.personal_dashboard, name='personal_dashboard'),
    path('projects/', views.personal_dashboard, name='personal_projects'),
    path('create/', views.personal_dashboard, name='personal_create'),
    path('help/', views.personal_dashboard, name='personal_help'),
    path('examples/', views.personal_dashboard, name='personal_examples'),
    path('project/<int:project_id>/', views.personal_dashboard, name='personal_project_detail'),
    
    # Evaluator Dashboard
    path('evaluations/', views.evaluator_dashboard, name='evaluator_evaluations'),
    path('pending/', views.evaluator_dashboard, name='evaluator_pending'),
    path('reports/', views.evaluator_dashboard, name='evaluator_reports'),
    path('evaluate/<int:evaluation_id>/', views.evaluator_dashboard, name='evaluator_evaluate'),
    path('evaluation/<int:project_id>/', views.evaluator_dashboard, name='evaluator_evaluation_detail'),
    path('tools/consistency/', views.evaluator_dashboard, name='evaluator_tools_consistency'),
    path('tools/weights/', views.evaluator_dashboard, name='evaluator_tools_weights'),
    path('tools/sensitivity/', views.evaluator_dashboard, name='evaluator_tools_sensitivity'),
    
    # Enterprise Dashboard
    path('projects/', views.enterprise_dashboard, name='enterprise_projects'),
    path('members/', views.enterprise_dashboard, name='enterprise_members'),
    path('analytics/', views.enterprise_dashboard, name='enterprise_analytics'),
    path('projects/create/', views.enterprise_dashboard, name='enterprise_create_project'),
    path('members/invite/', views.enterprise_dashboard, name='enterprise_invite_member'),
    path('project/<int:project_id>/', views.enterprise_dashboard, name='enterprise_project_detail'),
    path('settings/', views.enterprise_dashboard, name='enterprise_settings'),
    
    # Generic Dashboard Redirect
    path('redirect/', views.dashboard_redirect, name='dashboard_redirect'),
    
    # API for dashboard info
    path('api/info/', views.api_dashboard_info, name='api_dashboard_info'),
]