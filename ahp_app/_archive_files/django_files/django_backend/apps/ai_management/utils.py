"""
AI Management Utilities
개발 프롬프트 자동 저장 및 관리 유틸리티
"""
import os
import json
import uuid
from datetime import datetime
from django.conf import settings
from django.contrib.auth import get_user_model
from .models import DevelopmentPromptLog

User = get_user_model()


class DevelopmentPromptLogger:
    """개발 프롬프트 자동 로깅 클래스"""
    
    def __init__(self, user=None, context='general'):
        self.user = user
        self.context = context
        self.session_id = str(uuid.uuid4())
        self.base_dir = self._get_dev_docs_dir()
    
    def _get_dev_docs_dir(self):
        """DevDocs 디렉토리 경로 반환"""
        # Django 프로젝트 루트에서 DevDocs 찾기
        base_dir = getattr(settings, 'BASE_DIR', os.getcwd())
        while base_dir and base_dir != '/':
            devdocs_path = os.path.join(base_dir, 'DevDocs')
            if os.path.exists(devdocs_path):
                return devdocs_path
            
            # 상위 디렉토리로 이동
            parent_dir = os.path.dirname(base_dir)
            if parent_dir == base_dir:  # 루트에 도달
                break
            base_dir = parent_dir
        
        # DevDocs가 없으면 생성
        devdocs_path = os.path.join(os.getcwd(), 'DevDocs')
        os.makedirs(devdocs_path, exist_ok=True)
        return devdocs_path
    
    def log_prompt(self, user_prompt, ai_response='', context=None):
        """개발 프롬프트 로깅"""
        if not self.user:
            return None
        
        context = context or self.context
        
        # 데이터베이스에 저장
        log_entry = DevelopmentPromptLog.objects.create(
            user=self.user,
            session_id=self.session_id,
            context=context,
            user_prompt=user_prompt,
            ai_response=ai_response
        )
        
        # 파일로 저장
        filename = self._save_to_file(log_entry)
        
        if filename:
            log_entry.file_saved = True
            log_entry.saved_filename = filename
            log_entry.save(update_fields=['file_saved', 'saved_filename'])
        
        return log_entry
    
    def _save_to_file(self, log_entry):
        """개발 로그를 마크다운 파일로 저장"""
        try:
            # 날짜별 파일명 생성
            today = datetime.now().strftime('%Y%m%d')
            filename = f"개발일지_{today}_{log_entry.context}_자동로그.md"
            filepath = os.path.join(self.base_dir, filename)
            
            # 파일 헤더 (파일이 새로 생성되는 경우)
            if not os.path.exists(filepath):
                header = f"""# 개발일지 - {datetime.now().strftime('%Y년 %m월 %d일')}

> 자동 생성된 개발 프롬프트 로그
> 컨텍스트: {log_entry.context}

"""
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(header)
            
            # 로그 엔트리 추가
            content = f"""
## 🤖 AI 개발 프롬프트 #{log_entry.id}

**시간**: {log_entry.created_at.strftime('%Y-%m-%d %H:%M:%S')}  
**사용자**: {log_entry.user.username}  
**세션**: `{log_entry.session_id[:8]}...`  
**컨텍스트**: {log_entry.context}

### 📝 사용자 프롬프트:
```
{log_entry.user_prompt}
```

### 💡 AI 응답:
```
{log_entry.ai_response}
```

---

"""
            
            # 파일에 추가
            with open(filepath, 'a', encoding='utf-8') as f:
                f.write(content)
            
            return filename
            
        except Exception as e:
            print(f"개발 로그 파일 저장 실패: {e}")
            return None
    
    @classmethod
    def quick_log(cls, user_prompt, ai_response='', user=None, context='general'):
        """빠른 로깅을 위한 클래스 메서드"""
        if not user:
            # 기본 사용자 찾기 (슈퍼유저)
            try:
                user = User.objects.filter(is_superuser=True).first()
            except:
                return None
        
        logger = cls(user=user, context=context)
        return logger.log_prompt(user_prompt, ai_response, context)


def auto_save_development_prompt(prompt_text, response_text='', context='manual'):
    """
    개발 프롬프트를 자동으로 저장하는 함수
    
    사용 예:
    auto_save_development_prompt(
        "AI 관리 시스템의 사용자 권한 관리 기능을 구현해줘",
        "React 컴포넌트와 Django API를 생성했습니다.",
        "ai-management"
    )
    """
    try:
        # 현재 활성 사용자 찾기 (슈퍼유저 우선)
        user = User.objects.filter(is_superuser=True).first()
        if not user:
            user = User.objects.filter(is_staff=True).first()
        
        if user:
            return DevelopmentPromptLogger.quick_log(
                user_prompt=prompt_text,
                ai_response=response_text,
                user=user,
                context=context
            )
    except Exception as e:
        print(f"개발 프롬프트 자동 저장 실패: {e}")
    
    return None


def export_development_logs(start_date=None, end_date=None, context=None, format='markdown'):
    """
    개발 로그를 내보내기
    
    Args:
        start_date: 시작 날짜
        end_date: 종료 날짜  
        context: 컨텍스트 필터
        format: 내보내기 형식 ('markdown', 'json', 'csv')
    """
    try:
        queryset = DevelopmentPromptLog.objects.all()
        
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        if context:
            queryset = queryset.filter(context=context)
        
        queryset = queryset.order_by('-created_at')
        
        if format == 'markdown':
            return _export_as_markdown(queryset)
        elif format == 'json':
            return _export_as_json(queryset)
        elif format == 'csv':
            return _export_as_csv(queryset)
        
    except Exception as e:
        print(f"개발 로그 내보내기 실패: {e}")
    
    return None


def _export_as_markdown(logs):
    """마크다운 형식으로 내보내기"""
    content = f"""# 개발 프롬프트 로그 통합 리포트

생성일: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}  
총 로그 수: {logs.count()}개

"""
    
    for log in logs:
        content += f"""
## 로그 #{log.id}

**시간**: {log.created_at.strftime('%Y-%m-%d %H:%M:%S')}  
**사용자**: {log.user.username}  
**컨텍스트**: {log.context}  
**세션**: {log.session_id}

### 프롬프트:
```
{log.user_prompt}
```

### 응답:
```
{log.ai_response}
```

---

"""
    
    return content


def _export_as_json(logs):
    """JSON 형식으로 내보내기"""
    data = []
    for log in logs:
        data.append({
            'id': log.id,
            'user': log.user.username,
            'session_id': log.session_id,
            'context': log.context,
            'user_prompt': log.user_prompt,
            'ai_response': log.ai_response,
            'file_saved': log.file_saved,
            'saved_filename': log.saved_filename,
            'created_at': log.created_at.isoformat()
        })
    
    return json.dumps(data, ensure_ascii=False, indent=2)


def _export_as_csv(logs):
    """CSV 형식으로 내보내기"""
    import csv
    import io
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # 헤더
    writer.writerow([
        'ID', '사용자', '세션ID', '컨텍스트', '프롬프트', 'AI응답', 
        '파일저장여부', '파일명', '생성시간'
    ])
    
    # 데이터
    for log in logs:
        writer.writerow([
            log.id,
            log.user.username,
            log.session_id,
            log.context,
            log.user_prompt,
            log.ai_response,
            log.file_saved,
            log.saved_filename,
            log.created_at.strftime('%Y-%m-%d %H:%M:%S')
        ])
    
    return output.getvalue()


# 편의 함수들
def save_this_prompt(prompt, response=''):
    """현재 프롬프트를 저장하는 편의 함수"""
    return auto_save_development_prompt(prompt, response, 'manual')


def save_ai_management_prompt(prompt, response=''):
    """AI 관리 관련 프롬프트 저장"""
    return auto_save_development_prompt(prompt, response, 'ai-management')


def save_component_development_prompt(prompt, response=''):
    """컴포넌트 개발 관련 프롬프트 저장"""
    return auto_save_development_prompt(prompt, response, 'component-development')


# 실제 사용 예시를 위한 함수
def demonstrate_logging():
    """로깅 시스템 사용 예시"""
    
    # 현재 작업 내용을 로그로 저장
    current_prompt = """
사용할 연구자가 인공지능 API키 사용까지는 어려울 수도 있어서 본인이 발급해서 사용할 사람들을 위한 안내이지만 
때론 슈퍼관리자가 AI사용 요금제 신청에 따라 설정도 해줄 수 있어야 해. 
슈펴관리자 모드에 메뉴 하나 추가해서 회원별 기능 추가 연결도 만들어 줘야 해. 
그리고 내가 개발 하라고 한 내역은 항상 프론트엔드, 백엔드, DB까지 (장고 관리자 페이지)에서도 같이 관리가 되게 개발되어야 해.
그리고 내가 작성하는 프롬프트도 개발일지처럼 또는 개발일지에 포함해서 저장해줘.
"""
    
    current_response = """
완전한 AI 관리 시스템을 구현했습니다:

1. **Django Backend**:
   - models.py: AI 서비스 요금제, 설정, 사용자 접근 권한, 사용 로그, 프롬프트 템플릿 모델
   - serializers.py: REST API 직렬화기들
   - views.py: ViewSet 기반 API 뷰들
   - admin.py: Django 관리자 페이지 통합
   - signals.py: 자동 사용량 업데이트 및 알림
   - urls.py: API 라우팅

2. **React Frontend**:
   - AIManagementDashboard: 메인 관리 대시보드
   - AIServicePlanManager: 요금제 관리
   - UserAIAccessManager: 사용자 권한 관리  
   - AISettingsManager: AI 설정 관리
   - AIUsageAnalytics: 사용량 분석
   - PromptTemplateManager: 프롬프트 템플릿 관리

3. **통합 기능**:
   - 슈퍼관리자 메뉴에 'AI 관리' 탭 추가
   - 프론트엔드-백엔드-DB 완전 연동
   - 자동 프롬프트 로깅 시스템
   - Django 마이그레이션 파일 생성
"""
    
    # 로그 저장
    log_entry = save_ai_management_prompt(current_prompt, current_response)
    
    if log_entry:
        print(f"개발 프롬프트가 저장되었습니다: {log_entry.saved_filename}")
        return log_entry
    else:
        print("개발 프롬프트 저장에 실패했습니다.")
        return None


if __name__ == "__main__":
    # 테스트 실행
    demonstrate_logging()