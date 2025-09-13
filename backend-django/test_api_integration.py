#!/usr/bin/env python3
"""
AHP Platform API Integration Test
완전한 사용자 시나리오 테스트
"""
import requests
import json

# API Base URL
BASE_URL = "http://localhost:8000"  # 로컬 테스트용
# BASE_URL = "https://ahp-django-backend-new.onrender.com"  # 배포된 서비스

def test_service_status():
    """서비스 상태 확인"""
    print("🔍 서비스 상태 확인...")
    try:
        response = requests.get(f"{BASE_URL}/api/service/status/")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 서비스 정상 작동: {data['message']}")
            print(f"버전: {data['version']}")
            print(f"기능: {list(data['features'].keys())}")
            print(f"통계: {data['stats']}")
            return True
        return False
    except Exception as e:
        print(f"❌ 서비스 상태 확인 실패: {e}")
        return False

def test_user_registration():
    """사용자 등록 테스트"""
    print("\n👤 사용자 등록 테스트...")
    try:
        user_data = {
            "username": "testuser",
            "email": "test@ahp-platform.com",
            "password": "testpass123"
        }
        response = requests.post(f"{BASE_URL}/api/register/", json=user_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if data['success']:
                print(f"✅ 회원가입 성공: {data['user']['username']}")
                return data['user']
            else:
                print(f"❌ 회원가입 실패: {data['message']}")
        return None
    except Exception as e:
        print(f"❌ 회원가입 테스트 실패: {e}")
        return None

def test_jwt_login(username, password):
    """JWT 토큰 로그인 테스트"""
    print("\n🔐 JWT 로그인 테스트...")
    try:
        login_data = {
            "username": username,
            "password": password
        }
        response = requests.post(f"{BASE_URL}/api/token/", json=login_data)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ JWT 로그인 성공")
            print(f"Access Token: {data['access'][:50]}...")
            return data['access']
        else:
            print(f"❌ JWT 로그인 실패: {response.text}")
        return None
    except Exception as e:
        print(f"❌ JWT 로그인 테스트 실패: {e}")
        return None

def test_project_creation(token):
    """프로젝트 생성 테스트"""
    print("\n📁 프로젝트 생성 테스트...")
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        project_data = {
            "title": "테스트 AHP 프로젝트",
            "description": "자동화 테스트용 프로젝트",
            "status": "draft"
        }
        response = requests.post(f"{BASE_URL}/api/service/projects/", 
                               json=project_data, headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"✅ 프로젝트 생성 성공: {data['title']} (ID: {data['id']})")
            return data['id']
        else:
            print(f"❌ 프로젝트 생성 실패: {response.text}")
        return None
    except Exception as e:
        print(f"❌ 프로젝트 생성 테스트 실패: {e}")
        return None

def test_criteria_creation(token, project_id):
    """평가기준 생성 테스트"""
    print("\n📊 평가기준 생성 테스트...")
    criteria_list = ["비용", "품질", "일정", "리스크"]
    created_criteria = []
    
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        for i, name in enumerate(criteria_list):
            criteria_data = {
                "project": project_id,
                "name": name,
                "description": f"{name} 평가기준",
                "type": "criteria",
                "order": i + 1
            }
            response = requests.post(f"{BASE_URL}/api/service/criteria/", 
                                   json=criteria_data, headers=headers)
            print(f"  {name}: {response.status_code}")
            if response.status_code == 201:
                data = response.json()
                created_criteria.append(data)
                print(f"    ✅ 생성 완료 (ID: {data['id']})")
            else:
                print(f"    ❌ 생성 실패: {response.text}")
        
        print(f"✅ 총 {len(created_criteria)}개 평가기준 생성 완료")
        return created_criteria
    except Exception as e:
        print(f"❌ 평가기준 생성 테스트 실패: {e}")
        return []

def test_pairwise_comparisons(token, project_id, criteria):
    """쌍대비교 테스트"""
    print("\n⚖️ 쌍대비교 테스트...")
    if len(criteria) < 2:
        print("❌ 비교할 기준이 부족합니다")
        return []
    
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # 샘플 비교값 (비용 > 품질 > 일정 > 리스크)
        comparison_values = [
            (0, 1, 2.0),    # 비용 vs 품질: 비용이 2배 중요
            (0, 2, 3.0),    # 비용 vs 일정: 비용이 3배 중요
            (0, 3, 4.0),    # 비용 vs 리스크: 비용이 4배 중요
            (1, 2, 2.0),    # 품질 vs 일정: 품질이 2배 중요
            (1, 3, 3.0),    # 품질 vs 리스크: 품질이 3배 중요
            (2, 3, 2.0),    # 일정 vs 리스크: 일정이 2배 중요
        ]
        
        created_comparisons = []
        for i, j, value in comparison_values:
            if i < len(criteria) and j < len(criteria):
                comparison_data = {
                    "project": project_id,
                    "criteria_a": criteria[i]['id'],
                    "criteria_b": criteria[j]['id'],
                    "value": value
                }
                response = requests.post(f"{BASE_URL}/api/service/comparisons/", 
                                       json=comparison_data, headers=headers)
                print(f"  {criteria[i]['name']} vs {criteria[j]['name']}: {response.status_code}")
                if response.status_code == 201:
                    data = response.json()
                    created_comparisons.append(data)
                    print(f"    ✅ 비교값 {value} 저장 완료")
                else:
                    print(f"    ❌ 저장 실패: {response.text}")
        
        print(f"✅ 총 {len(created_comparisons)}개 쌍대비교 완료")
        return created_comparisons
    except Exception as e:
        print(f"❌ 쌍대비교 테스트 실패: {e}")
        return []

def test_weight_calculation(token, project_id):
    """가중치 계산 테스트"""
    print("\n🧮 가중치 계산 테스트...")
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.post(f"{BASE_URL}/api/service/projects/{project_id}/calculate_weights/", 
                               headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ 가중치 계산 성공")
            print(f"기준 개수: {data['criteria_count']}")
            print(f"가중치: {[f'{w:.4f}' for w in data['weights']]}")
            return True
        else:
            print(f"❌ 가중치 계산 실패: {response.text}")
        return False
    except Exception as e:
        print(f"❌ 가중치 계산 테스트 실패: {e}")
        return False

def test_results_retrieval(token, project_id):
    """결과 조회 테스트"""
    print("\n📋 결과 조회 테스트...")
    try:
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = requests.get(f"{BASE_URL}/api/service/results/?project={project_id}", 
                               headers=headers)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            results = data.get('results', [])
            print(f"✅ 결과 조회 성공 ({len(results)}개)")
            
            for result in results:
                print(f"  순위 {result['rank']}: {result['criteria_name']} - 가중치 {result['weight']:.4f}")
            return results
        else:
            print(f"❌ 결과 조회 실패: {response.text}")
        return []
    except Exception as e:
        print(f"❌ 결과 조회 테스트 실패: {e}")
        return []

def run_full_integration_test():
    """완전한 통합 테스트 실행"""
    print("🚀 AHP Platform 완전 통합 테스트 시작")
    print("=" * 60)
    
    # 1. 서비스 상태 확인
    if not test_service_status():
        print("❌ 서비스 상태 확인 실패. 테스트 중단.")
        return
    
    # 2. 사용자 등록 (기존 사용자면 건너뛰기)
    user = test_user_registration()
    
    # 3. JWT 로그인 (admin 계정 사용)
    token = test_jwt_login("admin", "ahp2025admin")
    if not token:
        print("❌ 로그인 실패. 테스트 중단.")
        return
    
    # 4. 프로젝트 생성
    project_id = test_project_creation(token)
    if not project_id:
        print("❌ 프로젝트 생성 실패. 테스트 중단.")
        return
    
    # 5. 평가기준 생성
    criteria = test_criteria_creation(token, project_id)
    if not criteria:
        print("❌ 평가기준 생성 실패. 테스트 중단.")
        return
    
    # 6. 쌍대비교 생성
    comparisons = test_pairwise_comparisons(token, project_id, criteria)
    if not comparisons:
        print("❌ 쌍대비교 생성 실패. 테스트 중단.")
        return
    
    # 7. 가중치 계산
    if not test_weight_calculation(token, project_id):
        print("❌ 가중치 계산 실패. 테스트 중단.")
        return
    
    # 8. 결과 조회
    results = test_results_retrieval(token, project_id)
    
    print("\n" + "=" * 60)
    print("✅ AHP Platform 완전 통합 테스트 성공!")
    print(f"   프로젝트 ID: {project_id}")
    print(f"   평가기준: {len(criteria)}개")
    print(f"   쌍대비교: {len(comparisons)}개") 
    print(f"   결과: {len(results)}개")
    print("🎯 프론트엔드 연동 준비 완료!")

if __name__ == "__main__":
    run_full_integration_test()