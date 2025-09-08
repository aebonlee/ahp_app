#!/usr/bin/env python3
"""
Stage 2: Enable Common and Projects Apps
Run this after Stage 1 (accounts app) has been successfully deployed
"""

STAGE2_SETTINGS = """
# 🔧 Stage 2: Enable common and projects apps
LOCAL_APPS = [
    'apps.accounts',       # ✅ Stage 1 - Custom User model established
    'apps.common',         # ✅ Stage 2 - Common utilities
    'apps.projects',       # ✅ Stage 2 - Project management
    # Still disabled for gradual deployment:
    # 'apps.evaluations',    
    # 'apps.analysis',       
    # 'apps.workshops',      
    # 'apps.exports',        
]
"""

STAGE2_URLS = """
    # App URLs - 🔧 Stage 2: accounts + common + projects
    path('accounts/', include('apps.accounts.urls')),   # ✅ Stage 1
    path('common/', include('apps.common.urls')),       # ✅ Stage 2
    path('projects/', include('apps.projects.urls')),   # ✅ Stage 2
    # Still disabled for gradual deployment:
    # path('evaluations/', include('apps.evaluations.urls')),  
    # path('analysis/', include('apps.analysis.urls')),   
    # path('workshops/', include('apps.workshops.urls')), 
    # path('exports/', include('apps.exports.urls')),
"""

def update_for_stage2():
    """Update settings and URLs for Stage 2 deployment"""
    print("🔄 Preparing Stage 2 deployment...")
    print("📝 Enable apps: common, projects")
    print("⚠️  Manual update required in:")
    print("   - backend-django/ahp_backend/settings.py")
    print("   - backend-django/ahp_backend/urls.py")
    print("\nUse the code blocks above to update the files.")

if __name__ == '__main__':
    update_for_stage2()