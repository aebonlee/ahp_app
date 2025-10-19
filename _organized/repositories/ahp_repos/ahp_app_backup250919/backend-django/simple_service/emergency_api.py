"""
긴급 상황을 위한 API - PostgreSQL 문제 해결
"""
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import connection
import logging

logger = logging.getLogger(__name__)

@csrf_exempt
def emergency_fix_database(request):
    """긴급 데이터베이스 수정 API"""
    if request.method == 'POST':
        try:
            with connection.cursor() as cursor:
                # 1. 시스템 사용자 생성
                cursor.execute("""
                    INSERT INTO auth_user (
                        id, password, last_login, is_superuser, username, 
                        first_name, last_name, email, is_staff, is_active, date_joined
                    )
                    VALUES (
                        1, '', NULL, true, 'system', 
                        'System', 'User', 'system@ahp.com', true, true, NOW()
                    )
                    ON CONFLICT (id) DO UPDATE SET
                        is_active = true,
                        is_staff = true,
                        is_superuser = true
                """)
                
                # 2. created_by_id 제약조건 완화
                try:
                    cursor.execute("ALTER TABLE simple_projects ALTER COLUMN created_by_id DROP NOT NULL")
                    cursor.execute("ALTER TABLE simple_projects ALTER COLUMN created_by_id SET DEFAULT 1")
                except:
                    pass  # 이미 변경되었을 수 있음
                
                # 3. 누락된 컬럼 추가
                try:
                    cursor.execute("ALTER TABLE simple_projects ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
                    cursor.execute("ALTER TABLE simple_projects ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()")
                except:
                    pass
                
                # 4. NULL 값 수정
                cursor.execute("UPDATE simple_projects SET created_by_id = 1 WHERE created_by_id IS NULL")
                cursor.execute("UPDATE simple_projects SET created_at = NOW() WHERE created_at IS NULL")
                cursor.execute("UPDATE simple_projects SET updated_at = NOW() WHERE updated_at IS NULL")
                
                # 5. 테스트 프로젝트 생성
                cursor.execute("""
                    INSERT INTO simple_projects (title, description, created_by_id, created_at, updated_at)
                    VALUES ('긴급 수정 테스트', '데이터베이스 수정 후 테스트 프로젝트', 1, NOW(), NOW())
                    ON CONFLICT DO NOTHING
                """)
                
                # 6. 상태 확인
                cursor.execute("SELECT COUNT(*) FROM simple_projects")
                project_count = cursor.fetchone()[0]
                
                cursor.execute("SELECT COUNT(*) FROM auth_user WHERE id = 1")
                system_user_exists = cursor.fetchone()[0] > 0
                
                return JsonResponse({
                    'success': True,
                    'message': '데이터베이스 긴급 수정 완료',
                    'system_user_created': system_user_exists,
                    'project_count': project_count,
                    'timestamp': 'NOW()'
                })
                
        except Exception as e:
            logger.error(f"Emergency fix failed: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e),
                'message': '긴급 수정 실패'
            }, status=500)
    
    return JsonResponse({
        'message': 'Emergency Database Fix API',
        'method': 'POST',
        'description': 'Fixes PostgreSQL constraints and creates system user'
    })

@csrf_exempt 
def emergency_create_project(request):
    """긴급 프로젝트 생성 API"""
    if request.method == 'POST':
        try:
            import json
            data = json.loads(request.body) if request.body else {}
            
            title = data.get('title', f'Emergency Project {int(__import__("time").time())}')
            description = data.get('description', 'Created via emergency API')
            
            with connection.cursor() as cursor:
                # 시스템 사용자 확인
                cursor.execute("SELECT COUNT(*) FROM auth_user WHERE id = 1")
                if cursor.fetchone()[0] == 0:
                    cursor.execute("""
                        INSERT INTO auth_user (id, username, email, password, is_staff, is_active, date_joined)
                        VALUES (1, 'system', 'system@ahp.com', '', true, true, NOW())
                    """)
                
                # 프로젝트 생성
                cursor.execute("""
                    INSERT INTO simple_projects (title, description, created_by_id, created_at, updated_at)
                    VALUES (%s, %s, 1, NOW(), NOW())
                    RETURNING id
                """, [title, description])
                
                project_id = cursor.fetchone()[0]
                
                return JsonResponse({
                    'success': True,
                    'project': {
                        'id': project_id,
                        'title': title,
                        'description': description,
                        'created_by': 1,
                        'created_by_username': 'system',
                        'criteria_count': 0,
                        'comparisons_count': 0
                    }
                })
                
        except Exception as e:
            logger.error(f"Emergency project creation failed: {e}")
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=500)
    
    return JsonResponse({
        'message': 'Emergency Project Creation API',
        'method': 'POST',
        'format': {
            'title': 'Project title (optional)',
            'description': 'Project description (optional)'
        }
    })

@csrf_exempt
def emergency_list_projects(request):
    """긴급 프로젝트 목록 조회 API"""
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, title, description, created_at, 
                       COALESCE(created_by_id, 1) as created_by_id
                FROM simple_projects 
                ORDER BY id DESC 
                LIMIT 20
            """)
            
            rows = cursor.fetchall()
            projects = []
            
            for row in rows:
                projects.append({
                    'id': row[0],
                    'title': row[1] or 'Untitled',
                    'description': row[2] or '',
                    'created_at': str(row[3]) if row[3] else None,
                    'created_by': row[4],
                    'created_by_username': 'system',
                    'criteria_count': 0,
                    'comparisons_count': 0
                })
            
            return JsonResponse({
                'success': True,
                'count': len(projects),
                'results': projects
            })
            
    except Exception as e:
        logger.error(f"Emergency list failed: {e}")
        return JsonResponse({
            'success': False,
            'error': str(e),
            'results': []
        }, status=500)