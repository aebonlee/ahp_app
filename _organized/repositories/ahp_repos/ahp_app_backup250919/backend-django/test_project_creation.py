#!/usr/bin/env python
"""
프로젝트 생성 테스트 스크립트
Django API 엔드포인트를 직접 테스트
"""
import os
import sys
import django
import json

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth.models import AnonymousUser
from simple_service.views import SimpleProjectViewSet
from simple_service.models import SimpleProject
from django.contrib.auth import get_user_model

def test_project_creation():
    print("🧪 프로젝트 생성 API 테스트 시작...")
    
    # 테스트 데이터
    test_data = {
        'title': 'Test Project - ' + str(os.urandom(4).hex()),
        'description': 'Test description',
        'objective': 'Test objective',
        'visibility': 'private'
    }
    
    print(f"📝 테스트 데이터: {json.dumps(test_data, ensure_ascii=False, indent=2)}")
    
    # 요청 팩토리 생성
    factory = RequestFactory()
    request = factory.post('/api/service/projects/', 
                          data=json.dumps(test_data),
                          content_type='application/json')
    
    # 익명 사용자 설정
    request.user = AnonymousUser()
    print("👤 익명 사용자로 요청 생성")
    
    # ViewSet 인스턴스 생성
    view = SimpleProjectViewSet()
    view.request = request
    
    try:
        # 프로젝트 생성 전 개수 확인
        before_count = SimpleProject.objects.count()
        print(f"📊 생성 전 프로젝트 수: {before_count}")
        
        # 프로젝트 생성 시도
        print("🚀 프로젝트 생성 시도...")
        response = view.create(request)
        
        # 프로젝트 생성 후 개수 확인
        after_count = SimpleProject.objects.count()
        print(f"📊 생성 후 프로젝트 수: {after_count}")
        
        if response.status_code == 201:
            print("✅ 프로젝트 생성 성공!")
            print(f"📋 응답 데이터: {json.dumps(response.data, ensure_ascii=False, indent=2)}")
            print(f"🆔 생성된 프로젝트 ID: {response.data.get('id')}")
            
            # 데이터베이스에서 실제로 저장되었는지 확인
            project = SimpleProject.objects.get(id=response.data['id'])
            print(f"🗄️ 데이터베이스 확인:")
            print(f"   - 제목: {project.title}")
            print(f"   - 목표: {project.objective}")
            print(f"   - 설명: {project.description}")
            print(f"   - 생성자: {project.created_by.username}")
            print(f"   - 가시성: {project.visibility}")
            
            return True
            
        else:
            print(f"❌ 프로젝트 생성 실패: {response.status_code}")
            print(f"📄 오류 내용: {response.data}")
            return False
            
    except Exception as e:
        print(f"❌ 테스트 실행 오류: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_anonymous_user_creation():
    print("👤 익명 사용자 확인 및 생성...")
    User = get_user_model()
    
    try:
        anonymous_user = User.objects.get(username='anonymous')
        print(f"✅ 익명 사용자 이미 존재: {anonymous_user.email}")
    except User.DoesNotExist:
        print("➕ 익명 사용자 생성 중...")
        anonymous_user = User.objects.create_user(
            username='anonymous',
            email='anonymous@ahp.com',
            first_name='익명',
            last_name='사용자'
        )
        print(f"✅ 익명 사용자 생성 완료: {anonymous_user.email}")
    
    return anonymous_user

if __name__ == '__main__':
    print("=" * 50)
    print("🧪 AHP 프로젝트 생성 API 테스트")
    print("=" * 50)
    
    # 1. 익명 사용자 확인
    test_anonymous_user_creation()
    print()
    
    # 2. 프로젝트 생성 테스트
    success = test_project_creation()
    print()
    
    if success:
        print("🎉 모든 테스트 통과!")
    else:
        print("💥 테스트 실패!")
        sys.exit(1)