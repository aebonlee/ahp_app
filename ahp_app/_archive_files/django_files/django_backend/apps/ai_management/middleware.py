"""
AI Management Middleware
개발 프롬프트 자동 로깅을 위한 미들웨어
"""
import json
import uuid
from datetime import datetime
from django.utils.deprecation import MiddlewareMixin
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from .models import DevelopmentPromptLog
import os
import re

User = get_user_model()


class DevelopmentPromptLoggingMiddleware(MiddlewareMixin):
    """
    개발 관련 프롬프트를 자동으로 감지하고 로깅하는 미들웨어
    """
    
    # 개발 관련 키워드들
    DEVELOPMENT_KEYWORDS = [
        'claude', 'ai', '프롬프트', 'prompt', '개발', 'development', 'code', 'coding',
        '구현', 'implement', '함수', 'function', '컴포넌트', 'component', 'react',
        'django', 'python', 'typescript', 'javascript', '버그', 'bug', 'fix',
        '수정', 'modify', '추가', 'add', '생성', 'create', '만들어', 'make'
    ]
    
    # 로깅할 URL 패턴들
    LOGGED_PATHS = [
        '/api/ai-management/',
        '/api/chatbot/',
        '/api/assistant/',
    ]
    
    def __init__(self, get_response):
        self.get_response = get_response
        super().__init__(get_response)
    
    def process_request(self, request):
        """요청 처리 전 실행"""
        # 세션 ID 생성 및 설정
        if not hasattr(request, 'session') or not request.session.get('dev_session_id'):
            if hasattr(request, 'session'):
                request.session['dev_session_id'] = str(uuid.uuid4())
        
        # 개발 컨텍스트 감지
        request.dev_context = self._detect_development_context(request)
        
        return None
    
    def process_response(self, request, response):
        """응답 처리 후 실행"""
        # POST 요청이고 개발 관련 내용이 있는 경우만 로깅
        if (request.method == 'POST' and 
            self._should_log_request(request) and
            hasattr(request, 'user') and request.user.is_authenticated):
            
            try:
                self._log_development_prompt(request, response)
            except Exception as e:
                # 로깅 실패해도 원래 응답은 정상적으로 반환
                print(f"개발 프롬프트 로깅 실패: {e}")
        
        return response
    
    def _detect_development_context(self, request):
        """개발 컨텍스트 감지"""
        path = request.path.lower()
        
        # URL 기반 컨텍스트 감지
        if 'ai-management' in path:
            return 'ai-management'
        elif 'chatbot' in path:
            return 'chatbot'
        elif 'assistant' in path:
            return 'assistant'
        elif 'admin' in path:
            return 'admin'
        else:
            return 'general'
    
    def _should_log_request(self, request):
        """로깅해야 할 요청인지 판단"""
        # 로깅 대상 경로 확인
        for path_pattern in self.LOGGED_PATHS:
            if path_pattern in request.path:
                return True
        
        # 요청 본문에서 개발 관련 키워드 확인
        try:
            if hasattr(request, 'body') and request.body:
                body_str = request.body.decode('utf-8').lower()
                
                # JSON 형태인 경우 파싱해서 확인
                try:
                    body_data = json.loads(request.body)
                    body_str = json.dumps(body_data).lower()
                except:
                    pass
                
                # 개발 관련 키워드 확인
                for keyword in self.DEVELOPMENT_KEYWORDS:
                    if keyword in body_str:
                        return True
        except:
            pass
        
        return False
    
    def _extract_prompt_from_request(self, request):
        """요청에서 프롬프트 추출"""
        try:
            if hasattr(request, 'body') and request.body:
                body_data = json.loads(request.body)
                
                # 일반적인 프롬프트 필드들
                prompt_fields = ['prompt', 'message', 'query', 'question', 'text', 'content']
                
                for field in prompt_fields:
                    if field in body_data and body_data[field]:
                        return str(body_data[field])
                
                # 전체 요청을 프롬프트로 간주
                return json.dumps(body_data, ensure_ascii=False, indent=2)
        except:
            pass
        
        return None
    
    def _extract_response_content(self, response):
        """응답에서 AI 응답 추출"""
        try:
            if hasattr(response, 'content'):
                content = response.content.decode('utf-8')
                
                # JSON 응답인 경우 파싱
                try:
                    response_data = json.loads(content)
                    
                    # 일반적인 응답 필드들
                    response_fields = ['response', 'answer', 'result', 'content', 'message']
                    
                    for field in response_fields:
                        if field in response_data and response_data[field]:
                            return str(response_data[field])
                    
                    # 전체 응답을 AI 응답으로 간주
                    return json.dumps(response_data, ensure_ascii=False, indent=2)
                except:
                    return content
        except:
            pass
        
        return ""
    
    def _log_development_prompt(self, request, response):
        """개발 프롬프트 로깅"""
        user_prompt = self._extract_prompt_from_request(request)
        if not user_prompt:
            return
        
        ai_response = self._extract_response_content(response)
        session_id = getattr(request.session, 'get', lambda x: str(uuid.uuid4()))('dev_session_id')
        context = getattr(request, 'dev_context', 'general')
        
        # 로그 저장
        log_entry = DevelopmentPromptLog.objects.create(
            user=request.user,
            session_id=session_id,
            context=context,
            user_prompt=user_prompt,
            ai_response=ai_response
        )
        
        # 파일로도 저장 (옵션)
        self._save_to_file(log_entry)
    
    def _save_to_file(self, log_entry):
        """개발 로그를 파일로 저장"""
        try:
            # DevDocs 디렉토리에 저장
            base_dir = os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', 'DevDocs')
            if not os.path.exists(base_dir):
                os.makedirs(base_dir)
            
            # 날짜별 파일명 생성
            today = datetime.now().strftime('%Y%m%d')
            filename = f"개발로그_{today}_{log_entry.context}.md"
            filepath = os.path.join(base_dir, filename)
            
            # 파일 내용 생성
            content = f"""
## 개발 프롬프트 로그
- **세션 ID**: {log_entry.session_id}
- **사용자**: {log_entry.user.username}
- **컨텍스트**: {log_entry.context}
- **시간**: {log_entry.created_at.strftime('%Y-%m-%d %H:%M:%S')}

### 사용자 프롬프트:
```
{log_entry.user_prompt}
```

### AI 응답:
```
{log_entry.ai_response}
```

---

"""
            
            # 파일에 추가
            with open(filepath, 'a', encoding='utf-8') as f:
                f.write(content)
            
            # 로그 엔트리 업데이트
            log_entry.file_saved = True
            log_entry.saved_filename = filename
            log_entry.save(update_fields=['file_saved', 'saved_filename'])
            
        except Exception as e:
            print(f"파일 저장 실패: {e}")


class AIUsageTrackingMiddleware(MiddlewareMixin):
    """
    AI 사용량 추적 미들웨어
    """
    
    def process_response(self, request, response):
        """AI API 사용량 추적"""
        if (request.method == 'POST' and 
            '/api/ai' in request.path and
            hasattr(request, 'user') and request.user.is_authenticated):
            
            try:
                self._track_ai_usage(request, response)
            except Exception as e:
                print(f"AI 사용량 추적 실패: {e}")
        
        return response
    
    def _track_ai_usage(self, request, response):
        """AI 사용량 추적 및 로깅"""
        from .models import AIUsageLog, UserAIAccess
        
        try:
            # 사용자 AI 접근 권한 확인
            user_access = UserAIAccess.objects.get(user=request.user, is_enabled=True)
            
            # 사용량 정보 추출
            usage_info = self._extract_usage_info(request, response)
            
            if usage_info:
                # 사용 로그 생성
                AIUsageLog.objects.create(
                    user=request.user,
                    ai_settings=user_access.ai_settings,
                    request_type=usage_info.get('request_type', 'general'),
                    prompt=usage_info.get('prompt', ''),
                    response=usage_info.get('response', ''),
                    tokens_used=usage_info.get('tokens_used', 0),
                    cost=usage_info.get('cost', 0.0),
                    response_time=usage_info.get('response_time', 0.0),
                    ip_address=self._get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    session_id=request.session.get('dev_session_id', ''),
                    model_version=usage_info.get('model_version', ''),
                    error_message=usage_info.get('error_message', '')
                )
                
        except UserAIAccess.DoesNotExist:
            # AI 접근 권한이 없는 사용자
            pass
        except Exception as e:
            print(f"AI 사용량 로깅 실패: {e}")
    
    def _extract_usage_info(self, request, response):
        """요청/응답에서 사용량 정보 추출"""
        # 실제 구현에서는 AI API 응답 헤더나 본문에서 토큰 사용량 등을 추출
        # 현재는 기본값 반환
        return {
            'request_type': 'chatbot',
            'prompt': '',
            'response': '',
            'tokens_used': 0,
            'cost': 0.0,
            'response_time': 0.0,
            'model_version': 'gpt-3.5-turbo'
        }
    
    def _get_client_ip(self, request):
        """클라이언트 IP 주소 가져오기"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip or '127.0.0.1'