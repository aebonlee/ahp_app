#!/usr/bin/env python
"""
Simple deployment test script for Render.com
"""

import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')

try:
    import django
    django.setup()
    
    print("✅ Django setup successful")
    
    # Test database connection
    from django.db import connection
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        print("✅ Database connection successful")
    
    # Test social auth configuration
    from django.conf import settings
    
    print(f"\n📋 Social Auth Configuration:")
    print(f"   INSTALLED_APPS contains allauth: {'allauth' in settings.INSTALLED_APPS}")
    print(f"   INSTALLED_APPS contains rest_framework.authtoken: {'rest_framework.authtoken' in settings.INSTALLED_APPS}")
    print(f"   MIDDLEWARE contains AccountMiddleware: {'allauth.account.middleware.AccountMiddleware' in settings.MIDDLEWARE}")
    
    if hasattr(settings, 'SOCIALACCOUNT_PROVIDERS'):
        providers = list(settings.SOCIALACCOUNT_PROVIDERS.keys())
        print(f"   Social providers configured: {', '.join(providers)}")
    
    print(f"\n🎯 Deployment Status: READY")
    
except Exception as e:
    print(f"❌ Deployment test failed: {e}")
    sys.exit(1)