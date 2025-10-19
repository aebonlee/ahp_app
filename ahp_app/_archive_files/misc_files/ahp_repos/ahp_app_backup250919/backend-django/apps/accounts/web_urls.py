"""
Web Frontend specific URLs
"""
from django.urls import path
from . import web_views, evaluator_views

urlpatterns = [
    # Web Authentication
    path('web/login/', web_views.web_login, name='web-login'),
    path('web/register/', web_views.web_register, name='web-register'),
    path('web/logout/', web_views.web_logout, name='web-logout'),
    
    # Web Profile Management
    path('web/profile/', web_views.web_profile, name='web-profile'),
    path('web/profile/update/', web_views.web_profile_update, name='web-profile-update'),
    
    # Evaluator Management (for evaluator-management tab)
    path('web/evaluators/', evaluator_views.evaluator_list, name='web-evaluator-list'),
    path('web/evaluators/create/', evaluator_views.create_evaluator, name='web-create-evaluator'),
    path('web/evaluators/<int:evaluator_id>/', evaluator_views.update_evaluator, name='web-update-evaluator'),
    path('web/evaluators/<int:evaluator_id>/delete/', evaluator_views.delete_evaluator, name='web-delete-evaluator'),
    path('web/evaluators/statistics/', evaluator_views.evaluator_statistics, name='web-evaluator-statistics'),
    path('web/evaluators/bulk-create/', evaluator_views.bulk_create_evaluators, name='web-bulk-create-evaluators'),
    
    # Development/Testing
    path('web/create-sample-users/', web_views.create_sample_users, name='create-sample-users'),
]