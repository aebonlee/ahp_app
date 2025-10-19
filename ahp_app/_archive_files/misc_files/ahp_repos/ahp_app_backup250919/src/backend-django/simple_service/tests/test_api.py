"""
AHP Platform API Tests
프로덕션 환경을 위한 포괄적인 테스트 스위트
"""
from django.test import TestCase, Client
from django.contrib.auth.models import User
from django.urls import reverse
from django.core.cache import cache
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
import json
import time
from simple_service.models import SimpleProject, SimpleCriteria, SimpleComparison


class AuthenticationAPITest(APITestCase):
    """인증 API 테스트"""
    
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/register/'
        self.login_url = '/api/login/'
        self.logout_url = '/api/logout/'
        self.user_url = '/api/user/'
        
    def test_user_registration_success(self):
        """사용자 등록 성공 테스트"""
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'TestPassword123!',
            'first_name': 'Test',
            'last_name': 'User'
        }
        response = self.client.post(self.register_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user']['username'], 'testuser')
        
        # 사용자가 실제로 생성되었는지 확인
        self.assertTrue(User.objects.filter(username='testuser').exists())
    
    def test_user_registration_validation(self):
        """사용자 등록 입력 검증 테스트"""
        # 잘못된 이메일
        data = {
            'username': 'testuser',
            'email': 'invalid-email',
            'password': 'TestPassword123!'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(response.data['success'])
        
        # 짧은 사용자명
        data = {
            'username': 'ab',
            'email': 'test@example.com',
            'password': 'TestPassword123!'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # 약한 비밀번호
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': '123'
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
    
    def test_user_login_success(self):
        """로그인 성공 테스트"""
        # 사용자 생성
        User.objects.create_user(username='testuser', email='test@example.com', password='TestPassword123!')
        
        data = {
            'username': 'testuser',
            'password': 'TestPassword123!'
        }
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user']['username'], 'testuser')
    
    def test_user_login_with_email(self):
        """이메일로 로그인 테스트"""
        User.objects.create_user(username='testuser', email='test@example.com', password='TestPassword123!')
        
        data = {
            'username': 'test@example.com',  # 이메일 사용
            'password': 'TestPassword123!'
        }
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])
    
    def test_user_login_failure(self):
        """로그인 실패 테스트"""
        data = {
            'username': 'nonexistent',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertFalse(response.data['success'])
    
    def test_logout_api(self):
        """로그아웃 API 테스트"""
        user = User.objects.create_user(username='testuser', password='TestPassword123!')
        self.client.force_authenticate(user=user)
        
        response = self.client.post(self.logout_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['success'])


class ProjectAPITest(APITestCase):
    """프로젝트 API 테스트"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='TestPassword123!')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.projects_url = '/api/service/projects/'
    
    def test_create_project(self):
        """프로젝트 생성 테스트"""
        data = {
            'title': 'Test Project',
            'description': 'Test Description',
            'status': 'draft'
        }
        response = self.client.post(self.projects_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Test Project')
        
        # 데이터베이스 확인
        project = SimpleProject.objects.get(title='Test Project')
        self.assertEqual(project.created_by, self.user)
    
    def test_list_projects(self):
        """프로젝트 목록 테스트"""
        SimpleProject.objects.create(
            title='Test Project 1', 
            created_by=self.user
        )
        SimpleProject.objects.create(
            title='Test Project 2', 
            created_by=self.user
        )
        
        response = self.client.get(self.projects_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['count'], 2)
    
    def test_project_pagination(self):
        """프로젝트 페이지네이션 테스트"""
        # 25개 프로젝트 생성 (기본 페이지 크기 20 초과)
        for i in range(25):
            SimpleProject.objects.create(
                title=f'Test Project {i}',
                created_by=self.user
            )
        
        response = self.client.get(self.projects_url + '?page=1')
        self.assertEqual(len(response.data['results']), 20)
        self.assertIsNotNone(response.data['next'])
        
        response = self.client.get(self.projects_url + '?page=2')
        self.assertEqual(len(response.data['results']), 5)
    
    def test_project_search(self):
        """프로젝트 검색 테스트"""
        SimpleProject.objects.create(title='Python Project', created_by=self.user)
        SimpleProject.objects.create(title='Java Application', created_by=self.user)
        
        response = self.client.get(self.projects_url + '?search=Python')
        
        self.assertEqual(response.data['count'], 1)
        self.assertEqual(response.data['results'][0]['title'], 'Python Project')
    
    def test_project_stats(self):
        """프로젝트 통계 API 테스트"""
        project = SimpleProject.objects.create(title='Test Project', created_by=self.user)
        
        # 평가기준 추가
        SimpleCriteria.objects.create(
            project=project,
            name='Criteria 1',
            type='criteria'
        )
        
        response = self.client.get(f'{self.projects_url}{project.id}/stats/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['criteria_count'], 1)
        self.assertIn('completion_rate', response.data)


class HealthCheckAPITest(TestCase):
    """헬스체크 API 테스트"""
    
    def setUp(self):
        self.client = Client()
    
    def test_basic_health_check(self):
        """기본 헬스체크 테스트"""
        response = self.client.get('/health/')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        self.assertEqual(data['status'], 'healthy')
    
    def test_detailed_health_check(self):
        """상세 헬스체크 테스트"""
        response = self.client.get('/api/health/')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        # 필수 필드 확인
        self.assertIn('status', data)
        self.assertIn('database', data)
        self.assertIn('cache', data)
        self.assertIn('response_time_ms', data)
        
        # 데이터베이스 상태 확인
        self.assertEqual(data['database']['status'], 'connected')
    
    def test_service_status(self):
        """서비스 상태 API 테스트"""
        response = self.client.get('/api/service/status/')
        
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.content)
        
        self.assertEqual(data['status'], 'SUCCESS')
        self.assertIn('features', data)
        self.assertIn('stats', data)
        self.assertIn('endpoints', data)


class PerformanceTest(APITestCase):
    """성능 테스트"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='TestPassword123!')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_api_response_time(self):
        """API 응답 시간 테스트"""
        start_time = time.time()
        response = self.client.get('/api/service/status/')
        end_time = time.time()
        
        response_time = (end_time - start_time) * 1000  # ms
        
        self.assertEqual(response.status_code, 200)
        self.assertLess(response_time, 1000, "API 응답 시간이 1초를 초과합니다")
    
    def test_cache_functionality(self):
        """캐시 기능 테스트"""
        cache.clear()
        
        # 캐시 설정
        cache.set('test_key', 'test_value', 60)
        self.assertEqual(cache.get('test_key'), 'test_value')
        
        # 캐시 삭제
        cache.delete('test_key')
        self.assertIsNone(cache.get('test_key'))
    
    def test_database_query_optimization(self):
        """데이터베이스 쿼리 최적화 테스트"""
        # 프로젝트와 관련 데이터 생성
        project = SimpleProject.objects.create(title='Test Project', created_by=self.user)
        
        for i in range(5):
            SimpleCriteria.objects.create(
                project=project,
                name=f'Criteria {i}',
                type='criteria'
            )
        
        # 쿼리 수 측정을 위한 테스트
        with self.assertNumQueries(3):  # 최적화된 쿼리 수
            response = self.client.get('/api/service/projects/')
            self.assertEqual(response.status_code, 200)


class SecurityTest(APITestCase):
    """보안 테스트"""
    
    def test_rate_limiting_login(self):
        """로그인 Rate Limiting 테스트"""
        login_data = {'username': 'nonexistent', 'password': 'wrong'}
        
        # 5회 시도 (제한: 5회/분)
        for i in range(5):
            response = self.client.post('/api/login/', login_data)
            self.assertEqual(response.status_code, 401)
        
        # 6번째 시도는 차단되어야 함
        response = self.client.post('/api/login/', login_data)
        self.assertEqual(response.status_code, 429)  # Too Many Requests
    
    def test_input_validation(self):
        """입력값 검증 테스트"""
        # SQL Injection 시도
        malicious_data = {
            'username': "'; DROP TABLE users; --",
            'email': 'test@example.com',
            'password': 'TestPassword123!'
        }
        
        response = self.client.post('/api/register/', malicious_data)
        
        # 입력 검증으로 차단되어야 함
        self.assertEqual(response.status_code, 400)
        self.assertFalse(response.data['success'])
    
    def test_authentication_required(self):
        """인증 필요 엔드포인트 테스트"""
        # 비인증 상태에서 프로젝트 생성 시도
        response = self.client.post('/api/service/projects/', {
            'title': 'Test Project'
        })
        
        # 인증이 필요한 경우 401 또는 403 반환
        self.assertIn(response.status_code, [401, 403])


class BackupRestoreTest(TestCase):
    """백업/복구 테스트"""
    
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='TestPassword123!')
        
    def test_backup_command(self):
        """백업 명령어 테스트"""
        from django.core.management import call_command
        from io import StringIO
        import os
        
        # 테스트 데이터 생성
        project = SimpleProject.objects.create(title='Test Project', created_by=self.user)
        
        # 백업 실행
        out = StringIO()
        call_command('backup_data', '--output', 'test_backup.json', stdout=out)
        
        # 백업 파일 존재 확인
        self.assertTrue(os.path.exists('test_backup.json'))
        
        # 정리
        os.remove('test_backup.json')
    
    def test_restore_dry_run(self):
        """복구 dry-run 테스트"""
        from django.core.management import call_command
        from io import StringIO
        import json
        
        # 테스트 백업 데이터 생성
        backup_data = {
            'users': [],
            'projects': [],
            'criteria': [],
            'comparisons': [],
            'results': [],
            'data': [],
            'metadata': {
                'backup_timestamp': '20250109_120000',
                'total_records': 0
            }
        }
        
        with open('test_backup.json', 'w') as f:
            json.dump(backup_data, f)
        
        # dry-run 실행
        out = StringIO()
        call_command('restore_data', 'test_backup.json', '--dry-run', stdout=out)
        
        # 성공적으로 완료되어야 함
        output = out.getvalue()
        self.assertIn('백업 파일 검증 완료', output)
        
        # 정리
        os.remove('test_backup.json')


if __name__ == '__main__':
    import django
    django.setup()
    from django.test.utils import get_runner
    from django.conf import settings
    
    TestRunner = get_runner(settings)
    test_runner = TestRunner()
    failures = test_runner.run_tests(["simple_service.tests"])