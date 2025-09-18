# Dependabot Pull Requests 정리 가이드

## 현재 열려있는 PR들 (8개)

### GitHub Actions 업데이트 (3개)
1. **actions/checkout v5** - 안전한 업데이트
2. **actions/configure-pages v5** - 안전한 업데이트  
3. **actions/upload-pages-artifact v4** - 안전한 업데이트

### Python 패키지 업데이트 (5개)
4. **django-filter 25.1** (현재: 24.2) - 마이너 업데이트, 안전
5. **djangorestframework-simplejwt 5.5.1** (현재: 5.3.0) - 마이너 업데이트, 안전
6. **gunicorn 23.0.0** (현재: 22.0.0) - 메이저 업데이트, 테스트 필요
7. **numpy >=1.26.0,<3.0** - 범위 확장, 안전
8. **python-dotenv 1.1.1** (현재: 1.0.0) - 마이너 업데이트, 안전

## GitHub에서 병합하는 방법

1. https://github.com/aebonlee/ahp_app/pulls 접속

2. 각 PR에서:
   - "Files changed" 탭에서 변경사항 확인
   - 보안 경고가 없는지 확인
   - "Merge pull request" 클릭
   - "Confirm merge" 클릭

3. 병합 순서 (안전한 순서):
   1. GitHub Actions 업데이트들 먼저 병합
   2. Python 패키지들 병합 (gunicorn은 마지막에)

## 로컬에서 업데이트 받기

모든 PR 병합 후:
```bash
cd ahp_app
git pull origin main
```

## 주의사항
- gunicorn 23.0.0은 메이저 버전 변경이므로 배포 전 테스트 필요
- 모든 변경사항은 자동으로 테스트되므로 CI/CD가 통과하면 안전

## 빠른 정리 (모든 PR 한번에 병합)
GitHub에서 "Merge all" 기능이 없으므로 각각 병합해야 합니다.