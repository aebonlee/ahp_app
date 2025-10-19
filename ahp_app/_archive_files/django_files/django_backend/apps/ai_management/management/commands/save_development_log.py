"""
Django Management Command
현재 개발 세션의 내용을 개발일지로 저장
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.ai_management.utils import save_ai_management_prompt, demonstrate_logging
from datetime import datetime

User = get_user_model()


class Command(BaseCommand):
    help = '현재 개발 세션의 내용을 개발일지로 저장합니다'

    def add_arguments(self, parser):
        parser.add_argument(
            '--demo',
            action='store_true',
            help='데모 로그를 생성합니다',
        )
        parser.add_argument(
            '--prompt',
            type=str,
            help='저장할 프롬프트 텍스트',
        )
        parser.add_argument(
            '--response',
            type=str,
            help='AI 응답 텍스트',
        )
        parser.add_argument(
            '--context',
            type=str,
            default='manual',
            help='컨텍스트 (예: ai-management, component-development)',
        )

    def handle(self, *args, **options):
        """명령 실행"""
        
        if options['demo']:
            # 데모 로그 생성
            self.stdout.write('데모 개발 로그를 생성합니다...')
            log_entry = demonstrate_logging()
            
            if log_entry:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'데모 로그가 성공적으로 저장되었습니다: {log_entry.saved_filename}'
                    )
                )
            else:
                self.stdout.write(
                    self.style.ERROR('데모 로그 저장에 실패했습니다.')
                )
            
        elif options['prompt']:
            # 사용자 지정 프롬프트 저장
            prompt = options['prompt']
            response = options.get('response', '')
            context = options.get('context', 'manual')
            
            self.stdout.write(f'개발 프롬프트를 저장합니다...')
            self.stdout.write(f'컨텍스트: {context}')
            
            log_entry = save_ai_management_prompt(prompt, response)
            
            if log_entry:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'프롬프트가 성공적으로 저장되었습니다: {log_entry.saved_filename}'
                    )
                )
            else:
                self.stdout.write(
                    self.style.ERROR('프롬프트 저장에 실패했습니다.')
                )
        
        else:
            # AI 관리 시스템 개발 완료 로그 저장
            completion_prompt = """
AI 관리 시스템 개발 완료 - 2025년 10월 15일

사용자 요청사항:
1. 슈퍼관리자가 AI사용 요금제 신청에 따라 설정을 해줄 수 있어야 함
2. 슈퍼관리자 모드에 메뉴 추가해서 회원별 기능 추가 연결
3. 프론트엔드, 백엔드, DB까지 (장고 관리자 페이지)에서도 같이 관리
4. 작성하는 프롬프트도 개발일지에 포함해서 저장

구현 완료 사항:
- ✅ Django AI Management App 생성
- ✅ 모델: AIServicePlan, AIServiceSettings, UserAIAccess, AIUsageLog, PromptTemplate, DevelopmentPromptLog
- ✅ Django REST API (serializers, views, urls) 
- ✅ Django Admin 통합 관리 페이지
- ✅ React TypeScript 프론트엔드 컴포넌트
- ✅ 슈퍼관리자 대시보드에 'AI 관리' 메뉴 통합
- ✅ 마이그레이션 파일 생성
- ✅ 자동 프롬프트 로깅 시스템 구현
- ✅ 개발일지 자동 저장 유틸리티

다음 단계:
1. Django 마이그레이션 실행 (python manage.py migrate)
2. 슈퍼유저 생성 및 AI 서비스 요금제 초기 데이터 생성
3. API 키 암호화를 위한 SECRET_KEY 설정
4. 프론트엔드 컴포넌트 테스트 및 통합
"""

            completion_response = """
AI 관리 시스템이 완전히 구현되었습니다.

주요 구현 내용:

**Backend (Django)**:
- 6개 모델로 구성된 완전한 데이터 구조
- REST API ViewSet 기반 CRUD 연산
- Django Admin 통합 관리 인터페이스
- 자동 사용량 추적 시그널
- 암호화된 API 키 저장
- 자동 프롬프트 로깅 미들웨어

**Frontend (React TypeScript)**:
- AIManagementDashboard: 통합 관리 대시보드
- 5개 전문 관리 컴포넌트 (요금제, 설정, 사용자 권한, 분석, 템플릿)
- 실시간 통계 및 사용량 모니터링
- 슈퍼관리자 메뉴 통합

**Database & Migration**:
- 완전한 초기 마이그레이션 파일
- 인덱스 최적화
- 외래키 관계 설정

**자동화 기능**:
- 개발 프롬프트 자동 로깅
- 사용량 실시간 추적
- 이메일 알림 시스템
- 파일 자동 저장

이제 사용자는 슈퍼관리자 대시보드에서 'AI 관리' 탭을 통해 모든 AI 관련 기능을 통합 관리할 수 있습니다.
"""
            
            self.stdout.write('AI 관리 시스템 개발 완료 로그를 저장합니다...')
            
            log_entry = save_ai_management_prompt(completion_prompt, completion_response)
            
            if log_entry:
                self.stdout.write(
                    self.style.SUCCESS(
                        f'개발 완료 로그가 저장되었습니다: {log_entry.saved_filename}'
                    )
                )
                self.stdout.write(
                    self.style.SUCCESS(
                        f'파일 위치: DevDocs/{log_entry.saved_filename}'
                    )
                )
            else:
                self.stdout.write(
                    self.style.ERROR('개발 완료 로그 저장에 실패했습니다.')
                )
        
        # 현재 시간과 함께 완료 메시지
        self.stdout.write(
            self.style.SUCCESS(
                f'\n작업 완료 시간: {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}'
            )
        )