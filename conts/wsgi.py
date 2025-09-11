import os
import sys
from django.core.wsgi import get_wsgi_application

# Django 백엔드 디렉토리를 Python 경로에 추가
backend_dir = os.path.join(os.path.dirname(__file__), 'backend-django')
sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')

application = get_wsgi_application()