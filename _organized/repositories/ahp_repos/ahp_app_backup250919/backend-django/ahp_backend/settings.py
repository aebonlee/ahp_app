"""
Django settings for ahp_backend project.

Generated for AHP (Analytic Hierarchy Process) Platform
Optimized for academic research and decision support systems.
"""

import os
from pathlib import Path
# 의존성 제거

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ.get('SECRET_KEY', 'django-insecure-simple-deploy-key-for-success')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.environ.get('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    'ahp-app-vuzk.onrender.com',
    'ahp-django-backend.onrender.com',
    'ahp-django-backend-new.onrender.com',
    '.onrender.com',
    'aebonlee.github.io'
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
    'corsheaders',  # 프론트엔드 연동
]

# Django 총 관리자 시스템 (회원관리, 결제시스템, PostgreSQL 연동)
LOCAL_APPS = [
    # 'super_admin',         # ❌ CustomUser 모델 충돌로 임시 비활성화
    'simple_service',      # ✅ 간단한 AHP 서비스만 활성화
    'dashboards',          # ✅ 권한별 대시보드 시스템
    # 'apps.accounts',       # ❌ 일시 비활성화 - User 모델 충돌 방지
    'apps.projects',       # ✅ 프로젝트 관리
    'apps.evaluations',    # ✅ 평가 관리
    'apps.analysis',       # ✅ 분석 결과 관리
    'apps.exports',        # ✅ 내보내기 관리
    'apps.common',         # ✅ 공통 기능
    'apps.system',         # ✅ 시스템 관리
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # CORS 첫 번째
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'ahp_backend.middleware.CSRFExemptMiddleware',  # CSRF 예외 처리
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'ahp_backend.middleware.SessionManagementMiddleware',  # 세션 관리
    'ahp_backend.middleware.APIAuthenticationMiddleware',  # API 인증
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

# Database configuration - PostgreSQL for production
if os.environ.get('DATABASE_URL'):
    # Render.com PostgreSQL using DATABASE_URL (1차 개발 방식)
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(os.environ.get('DATABASE_URL'))
    }
    # 추가 PostgreSQL 최적화 설정
    DATABASES['default'].update({
        'CONN_MAX_AGE': 600,
        'OPTIONS': {
            'connect_timeout': 60,
        }
    })
elif os.environ.get('DATABASE_HOST'):
    # 개별 환경 변수 방식 (백업)
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.environ.get('DATABASE_NAME', 'ahp_app'),
            'USER': os.environ.get('DATABASE_USER', 'ahp_app_user'),
            'PASSWORD': os.environ.get('DATABASE_PASSWORD', ''),
            'HOST': os.environ.get('DATABASE_HOST', 'localhost'),
            'PORT': os.environ.get('DATABASE_PORT', '5432'),
            'CONN_MAX_AGE': 600,
            'OPTIONS': {
                'connect_timeout': 60,
            }
        }
    }
else:
    # SQLite configuration for development/fallback
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

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

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Custom User Model - using super_admin's CustomUser model
# PostgreSQL 호환성을 위해 기본 Django User 사용
# CustomUser는 UUID를 사용하여 PostgreSQL foreign key 제약과 충돌
# AUTH_USER_MODEL = 'super_admin.CustomUser'  # 비활성화

# Production Security Settings
if not DEBUG:
    # Security Headers
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # CSRF Protection
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_HTTPONLY = True
    CSRF_COOKIE_SAMESITE = 'None'  # 크로스 도메인 허용
    CSRF_COOKIE_NAME = 'ahp_csrftoken'  # 고유한 CSRF 쿠키 이름
    CSRF_TRUSTED_ORIGINS = [
        'https://aebonlee.github.io',
        'https://ahp-django-backend.onrender.com',
    ]
    
    # CSRF 예외 URL 패턴
    CSRF_EXEMPT_URLS = [
        r'^api/ultra/',
        r'^api/migrate/',
        r'^api/emergency/',
    ]
    
    # Session Security - 사용자 요구사항에 맞춘 세션 설정
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_AGE = 30 * 60  # 30분 기본, 역할별 세션은 middleware에서 관리
    SESSION_COOKIE_SAMESITE = 'None'  # 크로스 도메인 허용 (GitHub Pages와 Render 간)
    SESSION_COOKIE_NAME = 'ahp_sessionid'  # 고유한 세션 쿠키 이름
    
    # SSL Settings
    SECURE_SSL_REDIRECT = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# Logging Configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG' if DEBUG else 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'simple_service': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# Rate Limiting (기본 설정)
RATELIMIT_ENABLE = True

# Super Admin 커스텀 사용자 모델 활성화
# PostgreSQL 호환성을 위해 기본 Django User 사용
# CustomUser는 UUID를 사용하여 PostgreSQL foreign key 제약과 충돌
# AUTH_USER_MODEL = 'super_admin.CustomUser'  # 비활성화

# 커스텀 인증 백엔드 - 이메일과 사용자명 모두 지원 (Django 기본 User 모델 호환)
AUTHENTICATION_BACKENDS = [
    'ahp_backend.auth_backends.EmailOrUsernameModelBackend',
    'django.contrib.auth.backends.ModelBackend',
]

# DRF 완전한 설정 - 프로젝트 생성 지원을 위해 AllowAny 설정
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        # 'rest_framework.authentication.SessionAuthentication',  # CSRF 문제로 임시 비활성화
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # 모든 API에 대해 익명 접근 허용
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PARSER_CLASSES': [
        'rest_framework.parsers.JSONParser',
    ]
}


# CORS 설정 (프론트엔드 연동)
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://aebonlee.github.io",
    "https://ahp-platform.vercel.app",
]
CORS_ALLOW_ALL_ORIGINS = False  # 보안을 위해 특정 도메인만 허용
CORS_ALLOW_CREDENTIALS = True
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