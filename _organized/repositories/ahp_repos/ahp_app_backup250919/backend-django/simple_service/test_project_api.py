"""
Simple Test Project Creation API
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection, transaction
from django.contrib.auth import get_user_model
import json
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def test_create_project(request):
    """간단한 테스트 프로젝트 생성"""
    if request.method != 'POST':
        return JsonResponse({'message': 'POST only'})
    
    try:
        # 요청 데이터 파싱
        data = json.loads(request.body) if request.body else {}
        title = data.get('title', f'테스트 프로젝트 {int(__import__("time").time())}')
        description = data.get('description', '데이터베이스 테스트용 프로젝트')
        
        User = get_user_model()
        
        with transaction.atomic():
            # 1. 사용자 확인/생성
            try:
                user = User.objects.get(username='system')
            except User.DoesNotExist:
                user = User.objects.create_user(
                    username='system',
                    email='system@ahp.com',
                    password='system123',
                    is_staff=True,
                    is_active=True
                )
                logger.info("Created system user")
            
            # 2. Django ORM으로 프로젝트 생성 시도
            try:
                from .models import SimpleProject
                
                project = SimpleProject.objects.create(
                    title=title,
                    description=description,
                    objective='테스트 목적의 프로젝트',
                    visibility='private',
                    status='draft',
                    is_public=False,
                    created_by=user
                )
                
                return JsonResponse({
                    'success': True,
                    'message': '✅ 테스트 프로젝트가 PostgreSQL에 저장되었습니다!',
                    'project': {
                        'id': project.id,
                        'title': project.title,
                        'description': project.description,
                        'created_by': user.username,
                        'created_at': project.created_at.isoformat()
                    },
                    'database_method': 'Django ORM'
                })
                
            except Exception as orm_error:
                logger.error(f"Django ORM failed: {orm_error}")
                
                # 3. Raw SQL로 직접 생성
                with connection.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO simple_projects 
                        (title, description, objective, visibility, status, is_public, created_by_id, created_at, updated_at)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                        RETURNING id, created_at
                    """, [title, description, '테스트 목적', 'private', 'draft', False, user.id])
                    
                    result = cursor.fetchone()
                    project_id, created_at = result
                    
                    return JsonResponse({
                        'success': True,
                        'message': '✅ 테스트 프로젝트가 Raw SQL로 PostgreSQL에 저장되었습니다!',
                        'project': {
                            'id': project_id,
                            'title': title,
                            'description': description,
                            'created_by': user.username,
                            'created_at': created_at.isoformat()
                        },
                        'database_method': 'Raw SQL',
                        'orm_error': str(orm_error)
                    })
                    
    except Exception as e:
        logger.error(f"Test project creation failed: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e),
            'message': '❌ 테스트 프로젝트 생성 실패'
        }, status=500)

@csrf_exempt
def test_list_projects(request):
    """테스트 프로젝트 목록 조회"""
    try:
        # Django ORM 시도
        try:
            from .models import SimpleProject
            projects = SimpleProject.objects.all()[:5]
            
            project_list = []
            for project in projects:
                project_list.append({
                    'id': project.id,
                    'title': project.title,
                    'description': project.description,
                    'status': project.status,
                    'created_at': project.created_at.isoformat()
                })
            
            return JsonResponse({
                'success': True,
                'count': len(project_list),
                'projects': project_list,
                'method': 'Django ORM'
            })
            
        except Exception as orm_error:
            # Raw SQL로 조회
            with connection.cursor() as cursor:
                cursor.execute("""
                    SELECT id, title, description, status, created_at
                    FROM simple_projects 
                    ORDER BY created_at DESC 
                    LIMIT 5
                """)
                
                rows = cursor.fetchall()
                project_list = []
                
                for row in rows:
                    project_list.append({
                        'id': row[0],
                        'title': row[1],
                        'description': row[2],
                        'status': row[3],
                        'created_at': row[4].isoformat() if row[4] else None
                    })
                
                return JsonResponse({
                    'success': True,
                    'count': len(project_list),
                    'projects': project_list,
                    'method': 'Raw SQL',
                    'orm_error': str(orm_error)
                })
                
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e),
            'message': '프로젝트 목록 조회 실패'
        }, status=500)