"""
Django settings for ahp_backend project.

Generated for AHP (Analytic Hierarchy Process) Platform
Optimized for academic research and decision support systems.
"""

import os
from pathlib import Path
from decouple import config
import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config('SECRET_KEY', default='django-insecure-change-me-in-production')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config('DEBUG', default=True, cast=bool)

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'ahp-app-vuzk.onrender.com',
    'ahp-django-backend.onrender.com',
    '.onrender.com'
]

# Application definition
DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'corsheaders',
    'django_extensions',
    'django_filters',
    'rest_framework_simplejwt',
]

LOCAL_APPS = [
    'apps.accounts',
    'apps.projects',
    'apps.evaluations',
    'apps.analysis',
    'apps.common',
    'apps.workshops',
    'apps.exports',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'ahp_backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'ahp_backend.wsgi.application'

# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

# PostgreSQL 전용 데이터베이스 설정 (SQLite 완전 제거)
# 로컬 DB 설치 없이 Render.com PostgreSQL만 사용

# Render.com PostgreSQL 연결 설정
database_url = config('DATABASE_URL', default=None)

# 환경변수가 없을 경우 기본값으로 직접 연결 시도
if not database_url:
    # Render.com PostgreSQL 직접 연결 정보
    database_url = 'postgresql://ahp_app_user:xEcCdn2WB32sxLYIPAncc9cHARXf1t6d@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com/ahp_app'
    print("⚠️ Using default DATABASE_URL - Please set environment variable for production")

# 개별 환경변수 (선택사항)
postgres_db = config('POSTGRES_DB', default='ahp_app')
postgres_user = config('POSTGRES_USER', default='ahp_app_user')
postgres_password = config('POSTGRES_PASSWORD', default='xEcCdn2WB32sxLYIPAncc9cHARXf1t6d')
postgres_host = config('POSTGRES_HOST', default='dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com')
postgres_port = config('POSTGRES_PORT', default='5432')

# PostgreSQL 연결 (DATABASE_URL 우선)
if database_url:
    try:
        DATABASES = {
            'default': dj_database_url.parse(database_url)
        }
        print(f"✅ PostgreSQL connected via DATABASE_URL")
        print(f"📊 Database: {DATABASES['default']['NAME']}")
        print(f"🏠 Host: {DATABASES['default']['HOST']}")
    except Exception as e:
        print(f"❌ DATABASE_URL parsing failed: {e}")
        # 수동으로 설정
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': 'ahp_app',
                'USER': 'ahp_app_user',
                'PASSWORD': 'xEcCdn2WB32sxLYIPAncc9cHARXf1t6d',
                'HOST': 'dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com',
                'PORT': '5432',
                'OPTIONS': {
                    'sslmode': 'require',
                },
            }
        }
        print("✅ PostgreSQL connected via manual config")

# PostgreSQL 개별 환경변수 사용 (기본값으로 시도)
elif postgres_host:
    try:
        # 기본 Render.com PostgreSQL 연결 시도
        db_name = postgres_db or 'railway'
        db_user = postgres_user or 'postgres'
        
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': db_name,
                'USER': db_user,
                'PASSWORD': postgres_password,
                'HOST': postgres_host,
                'PORT': postgres_port,
                'OPTIONS': {
                    'sslmode': 'require',
                    'connect_timeout': 60,
                },
                'CONN_MAX_AGE': 600,
            }
        }
        print(f"✅ PostgreSQL 기본 설정 연결: {postgres_host}/{db_name}")
    except Exception as e:
        print(f"❌ PostgreSQL 기본 연결 실패: {e}")
        # 환경변수 안내 후 에러
        pass

# PostgreSQL 환경변수 없으면 에러 발생 (SQLite 사용 안함)
else:
    error_msg = """
    ❌ PostgreSQL 환경변수가 설정되지 않았습니다.
    
    Render.com 서비스 설정에서 다음 중 하나를 설정하세요:
    
    방법 1 (권장): DATABASE_URL
    DATABASE_URL=postgresql://user:password@dpg-d2vgtg3uibrs738jk4i0-a.oregon-postgres.render.com:5432/database
    
    방법 2: 개별 환경변수
    POSTGRES_DB=your_database_name
    POSTGRES_USER=your_username  
    POSTGRES_PASSWORD=your_password
    
    SQLite는 재배포 시 데이터 삭제로 인해 사용하지 않습니다.
    로컬 DB 설치 없이 클라우드 전용으로 운영합니다.
    """
    print(error_msg)
    raise Exception("PostgreSQL 환경변수 설정 필요. 로컬 DB 설치 없이 클라우드 전용 사용.")

print(f"📊 Database engine: {DATABASES['default']['ENGINE']}")

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'ko-kr'
TIME_ZONE = 'Asia/Seoul'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

# Media files with persistent storage
MEDIA_URL = '/media/'
MEDIA_ROOT = '/opt/render/project/src/persistent_data/media'

# Ensure media directory exists
import os
os.makedirs(MEDIA_ROOT, exist_ok=True)

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model
AUTH_USER_MODEL = 'accounts.User'

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
}

# JWT Settings
from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS Settings - Updated for GitHub Pages deployment
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",
    "https://aebonlee.github.io",  # GitHub Pages root
    "https://aebonlee.github.io/ahp_app",  # GitHub Pages app
    "null",  # Local HTML file testing
]

CORS_ALLOW_CREDENTIALS = True

# Additional CORS settings for production
CORS_ALLOW_ALL_ORIGINS = config('CORS_ALLOW_ALL_ORIGINS', default=False, cast=bool)

# Allow null origin for local file testing in development
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^file://.*$",  # Allow file:// protocol for local testing
]
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

# Email Configuration
EMAIL_BACKEND = config('EMAIL_BACKEND', default='django.core.mail.backends.console.EmailBackend')

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['file', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}

# Create logs directory
os.makedirs(BASE_DIR / 'logs', exist_ok=True)