#!/usr/bin/env python
"""
AHP Platform 테스트 실행 스크립트
"""
import os
import sys
import django
from django.core.management import execute_from_command_line

# Django 설정
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ahp_backend.settings')

def run_tests():
    print("🧪 AHP Platform 테스트 실행")
    print("=" * 50)
    
    try:
        django.setup()
        
        # 테스트 실행
        test_commands = [
            ['test', 'simple_service.tests', '--verbosity=2'],
            ['test', 'simple_service.tests.test_api.AuthenticationAPITest', '--verbosity=2'],
            ['test', 'simple_service.tests.test_api.ProjectAPITest', '--verbosity=2'],
            ['test', 'simple_service.tests.test_api.HealthCheckAPITest', '--verbosity=2'],
        ]
        
        all_passed = True
        
        for i, cmd in enumerate(test_commands, 1):
            print(f"\n📋 테스트 그룹 {i}/{len(test_commands)}: {cmd[1] if len(cmd) > 1 else '전체'}")
            print("-" * 30)
            
            try:
                execute_from_command_line(['manage.py'] + cmd)
                print(f"✅ 테스트 그룹 {i} 성공")
            except SystemExit as e:
                if e.code != 0:
                    print(f"❌ 테스트 그룹 {i} 실패 (코드: {e.code})")
                    all_passed = False
            except Exception as e:
                print(f"❌ 테스트 그룹 {i} 오류: {str(e)}")
                all_passed = False
        
        print("\n" + "=" * 50)
        if all_passed:
            print("🎉 모든 테스트 통과!")
            print("✅ 프로덕션 배포 준비 완료")
        else:
            print("⚠️  일부 테스트 실패")
            print("🔧 문제를 해결한 후 다시 시도하세요")
        
        return all_passed
        
    except Exception as e:
        print(f"❌ 테스트 실행 오류: {str(e)}")
        return False


def run_specific_test(test_name=None):
    """특정 테스트만 실행"""
    if test_name:
        print(f"🎯 특정 테스트 실행: {test_name}")
        execute_from_command_line(['manage.py', 'test', test_name, '--verbosity=2'])
    else:
        print("사용법: python run_tests.py specific <test_name>")
        print("예: python run_tests.py specific simple_service.tests.test_api.AuthenticationAPITest")


def run_coverage():
    """테스트 커버리지 측정"""
    try:
        import coverage
        print("📊 테스트 커버리지 측정 시작")
        
        cov = coverage.Coverage()
        cov.start()
        
        # 테스트 실행
        run_tests()
        
        cov.stop()
        cov.save()
        
        print("\n📈 커버리지 리포트:")
        cov.report(show_missing=True)
        
        # HTML 리포트 생성
        cov.html_report(directory='htmlcov')
        print("📁 HTML 커버리지 리포트: htmlcov/index.html")
        
    except ImportError:
        print("⚠️  coverage 패키지가 설치되지 않았습니다.")
        print("설치 명령: pip install coverage")


if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == 'specific':
            test_name = sys.argv[2] if len(sys.argv) > 2 else None
            run_specific_test(test_name)
        elif sys.argv[1] == 'coverage':
            run_coverage()
        else:
            print("사용법:")
            print("  python run_tests.py          - 모든 테스트 실행")
            print("  python run_tests.py specific <test> - 특정 테스트 실행")
            print("  python run_tests.py coverage - 커버리지 측정")
    else:
        run_tests()