# Backend Update - Project API Fix

## 변경 사항

### 1. Project 모델 (apps/projects/models.py)
추가된 필드:
- `evaluation_mode`: 평가 모드 선택 (practical/theoretical/direct_input/fuzzy_ahp)
- `workflow_stage`: 워크플로우 단계 (creating/waiting/evaluating/completed)
- `deleted_at`: 소프트 삭제 타임스탬프
- `criteria_count`: 기준 개수
- `alternatives_count`: 대안 개수

업데이트된 필드:
- `status`: 'deleted' 선택지 추가

### 2. Serializers (apps/projects/serializers.py)
- ProjectSerializer: 모든 새 필드 추가
- ProjectCreateSerializer: evaluation_mode, workflow_stage 추가
- ProjectSummarySerializer: 카운트 필드 추가

### 3. Views (apps/projects/views.py)
새로운 엔드포인트:
- `DELETE /api/v1/projects/{id}/soft_delete/` - 휴지통으로 이동
- `POST /api/v1/projects/{id}/restore/` - 휴지통에서 복원
- `GET /api/v1/projects/trash/` - 휴지통 목록 조회
- `DELETE /api/v1/projects/{id}/permanent_delete/` - 영구 삭제

변경사항:
- `get_queryset()`: 삭제된 프로젝트 제외 (deleted_at__isnull=True)

### 4. Migration (0003_add_evaluation_mode_and_trash.py)
모든 필드 변경사항을 DB에 적용하는 마이그레이션 파일

## 배포 방법

### Render.com에 배포:

1. **파일 업로드**:
   ```bash
   # 변경된 파일들을 Render.com 저장소에 푸시
   git add apps/projects/
   git commit -m "fix: Add evaluation_mode, workflow_stage and trash functionality"
   git push origin main
   ```

2. **마이그레이션 실행**:
   Render.com 대시보드에서:
   - Shell 탭 열기
   - 다음 명령 실행:
   ```bash
   python manage.py migrate projects
   ```

3. **서비스 재시작**:
   - Manual Deploy 버튼 클릭 또는
   - 자동으로 재배포됨

## API 테스트

### 프로젝트 생성:
```bash
curl -X POST https://ahp-django-backend.onrender.com/api/v1/projects/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project",
    "description": "Testing new fields",
    "objective": "Test objective",
    "evaluation_mode": "practical",
    "workflow_stage": "creating"
  }'
```

### 휴지통으로 이동:
```bash
curl -X DELETE https://ahp-django-backend.onrender.com/api/v1/projects/{id}/soft_delete/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 휴지통 목록:
```bash
curl -X GET https://ahp-django-backend.onrender.com/api/v1/projects/trash/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 복원:
```bash
curl -X POST https://ahp-django-backend.onrender.com/api/v1/projects/{id}/restore/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 영구 삭제:
```bash
curl -X DELETE https://ahp-django-backend.onrender.com/api/v1/projects/{id}/permanent_delete/ \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 주의사항

1. **마이그레이션 필수**: 배포 후 반드시 `python manage.py migrate projects` 실행
2. **기존 데이터**: 기존 프로젝트는 `evaluation_mode='practical'`, `workflow_stage='creating'` 기본값 적용
3. **권한**: 프로젝트 소유자만 삭제/복원/영구삭제 가능
4. **소프트 삭제**: 휴지통으로 이동된 프로젝트는 일반 목록에서 제외됨

## 프론트엔드 연동

프론트엔드에서 다음 필드들을 전송할 수 있습니다:
- `evaluation_mode`: 'practical' | 'theoretical' | 'direct_input' | 'fuzzy_ahp'
- `workflow_stage`: 'creating' | 'waiting' | 'evaluating' | 'completed'
- `status`: 'draft' | 'active' | 'evaluation' | 'completed' | 'archived' | 'deleted'

응답에 포함되는 새 필드:
- `evaluation_mode`, `workflow_stage`, `deleted_at`, `criteria_count`, `alternatives_count`