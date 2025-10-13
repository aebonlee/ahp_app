# Render.com Team Plan Setup Guide

## 🚀 Team Plan 기능 활용 가이드

### 1. 초기 설정

#### 1.1 Render Dashboard에서 Team 생성
1. [Render Dashboard](https://dashboard.render.com)에 로그인
2. Settings → Team 메뉴로 이동
3. "Create Team" 클릭
4. Team 이름 입력: "AHP Research Platform"

#### 1.2 Blueprint 연동
```bash
# Git repository에서
git add render.yaml
git commit -m "Add Render blueprint configuration"
git push origin main
```

Render Dashboard에서:
1. "New" → "Blueprint" 클릭
2. GitHub repository 연결
3. `render.yaml` 파일 자동 감지 및 서비스 생성

### 2. Team 멤버 관리

#### 2.1 멤버 초대
Dashboard → Team → Members에서:
- **Owner** (1명): 모든 권한
- **Admin** (2-3명): 서비스 관리, 배포 권한
- **Developer** (5-6명): 배포, 로그 확인 권한  
- **Viewer** (나머지): 읽기 전용

#### 2.2 역할별 권한
| 역할 | 서비스 생성 | 배포 | 환경변수 | 로그 | 청구 |
|------|------------|------|----------|------|------|
| Owner | ✅ | ✅ | ✅ | ✅ | ✅ |
| Admin | ✅ | ✅ | ✅ | ✅ | ❌ |
| Developer | ❌ | ✅ | 읽기 | ✅ | ❌ |
| Viewer | ❌ | ❌ | ❌ | ✅ | ❌ |

### 3. Preview Environments 설정

#### 3.1 자동 PR Preview 활성화
1. Service 설정에서 "Pull Request Previews" 활성화
2. GitHub Actions 연동:
```yaml
# .github/workflows/preview.yml 참고
pullRequestPreviewsEnabled: true
```

#### 3.2 Preview URL 패턴
- Backend: `https://ahp-backend-pr-{number}.onrender.com`
- Frontend: `https://ahp-frontend-pr-{number}.onrender.com`

### 4. Horizontal Autoscaling 구성

#### 4.1 Production 서비스 스케일링
```yaml
# render.yaml에 추가
services:
  - type: web
    name: ahp-backend-prod
    scaling:
      minInstances: 2
      maxInstances: 10
      targetCPUPercent: 70
```

#### 4.2 모니터링 대시보드
- Metrics → Service 선택
- CPU, Memory, Response Time 실시간 확인
- Alert 설정으로 임계값 초과 시 알림

### 5. Private Links 설정

#### 5.1 내부 통신용 Private Service
```yaml
# Backend가 Database와 private 통신
envVars:
  - key: DATABASE_URL
    value: postgres://user:pass@ahp-database.internal:5432/db
```

#### 5.2 보안 강화
- 외부 접근 차단
- Service 간 암호화된 내부 통신
- IP 화이트리스트 설정 가능

### 6. 환경별 배포 전략

#### 6.1 Development
```bash
# 개발자 로컬에서
npm run dev:all
```

#### 6.2 Staging (자동 배포)
```bash
git push origin develop
# develop 브랜치 push 시 자동 배포
```

#### 6.3 Production (수동 승인)
```bash
# PowerShell (Windows)
.\scripts\deploy-render.ps1 -Environment production -Service all

# Bash (Mac/Linux)
./scripts/deploy-render.sh production all
```

### 7. 모니터링 및 알림

#### 7.1 Slack 연동
1. Render Dashboard → Settings → Integrations
2. Slack workspace 연결
3. 채널 선택 및 알림 유형 설정

#### 7.2 이메일 알림
- 배포 성공/실패
- 서비스 다운
- 자동 스케일링 이벤트
- 비용 임계값 초과

### 8. 비용 관리

#### 8.1 Team Plan 포함 사항
- 10명 팀 멤버
- 500GB 대역폭
- 무제한 프로젝트
- Standard 인스턴스 사용

#### 8.2 추가 비용 발생 항목
- 추가 대역폭: $0.10/GB
- 추가 팀 멤버: $9/월
- Premium 인스턴스 업그레이드

### 9. 백업 및 복구

#### 9.1 자동 백업
```yaml
databases:
  - name: ahp-database-prod
    plan: standard
    backupSchedule: "@daily"
    backupRetentionDays: 30
```

#### 9.2 수동 백업
```bash
# Render CLI 사용
render db:backup ahp-database-prod
```

### 10. 문제 해결

#### 10.1 배포 실패 시
1. Build logs 확인
2. Environment variables 검증
3. Health check endpoint 테스트

#### 10.2 성능 이슈
1. Metrics 대시보드 확인
2. Autoscaling 설정 조정
3. 인스턴스 타입 업그레이드 고려

### 11. CI/CD Pipeline

#### 11.1 GitHub Actions 연동
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        env:
          RENDER_API_KEY: ${{ secrets.RENDER_API_KEY }}
        run: ./scripts/deploy-render.sh production all
```

### 12. 보안 Best Practices

1. **환경 변수**: 민감한 정보는 Render Dashboard에서 직접 설정
2. **API Keys**: GitHub Secrets 사용
3. **Database**: IP 화이트리스트 설정
4. **HTTPS**: 모든 서비스에 SSL 인증서 자동 적용
5. **2FA**: 팀 멤버 전원 2단계 인증 필수

### 13. 지원 및 문의

- **Render Chat Support**: Team Plan 전용 채팅 지원
- **이메일**: support@render.com
- **문서**: https://render.com/docs
- **상태 페이지**: https://status.render.com

### 14. 다음 단계

1. [ ] Team 멤버 초대 완료
2. [ ] Preview Environments 테스트
3. [ ] Autoscaling 임계값 조정
4. [ ] Slack 알림 설정
5. [ ] 백업 정책 수립
6. [ ] 모니터링 대시보드 구성

---

## 📞 연락처
- 프로젝트 관리자: aebon@naver.com
- 기술 지원: 010-3700-0629
- 카카오톡: aebon