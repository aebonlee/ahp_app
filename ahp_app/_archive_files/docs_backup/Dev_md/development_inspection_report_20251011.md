# AHP 플랫폼 통합 개발 환경 점검 보고서
**작성일**: 2025년 10월 11일  
**작성자**: OpenAI ChatGPT (gpt-5-codex)  
**프로젝트**: AHP Research Platform (ahp-research-platform)

---

## 1. 프로젝트 개요
- **프론트엔드 저장소**: https://github.com/aebonlee/ahp_app  
  - 최신 커밋: `af3c341` (feat: Add export functionality to reports page)
- **백엔드 저장소**: https://github.com/aebonlee/ahp-django-service  
  - 로컬 저장소에 서브모듈/복제본 미구성 (프로젝트 루트의 `django_backend/`가 비어 있음)
- **실서비스 URL**:  
  - 프론트엔드: https://aebonlee.github.io/ahp_app/  
  - 백엔드 API: https://ahp-django-backend.onrender.com  
  - 관리자 페이지: https://ahp-django-backend.onrender.com/admin/
- **데이터베이스**: Render PostgreSQL (Service ID: dpg-d2q8l5qdbo4c73bt3780-a)

---

## 2. 로컬 개발 환경 점검
### 2.1 런타임 버전
```
Node.js  : v20.19.4
npm      : 11.4.2 (Unknown env config "http-proxy" 경고 발생)
```
- CRA(react-scripts 5.0.1) 기반 빌드/테스트 스크립트 사용.
- 개발용 프록시(`npm config get http-proxy`)가 설정되어 있으나 정의되지 않아 npm 경고가 반복적으로 출력됨. 실제 기능에는 영향 없음.

### 2.2 프로젝트 구조 및 의존성 현황
- `package.json` 기준 주요 런타임 의존성: React 18.2, TypeScript 4.9, Tailwind CSS 3.4, Axios, Recharts, qrcode/react 등.
- `node_modules/` 존재, 잠재적 보안 이슈 확인을 위해 `npm audit --production` 실행했으나 npm 레지스트리 접근 제한(HTTP 403)으로 결과 수집 실패.
- `/src/components/admin/PersonalServiceDashboard.tsx` 내부에 동일 식별자(`renderExportReportsFullPage`) 중복 선언이 존재하며, 빌드와 테스트 모두에 치명적 오류로 작용.

---

## 3. 품질 점검 결과
### 3.1 단위 테스트 (npm test -- --watchAll=false)
- 명령 실행 위치: `/workspace/ahp_app`
- 결과 요약: **총 13개 중 11개 통과, 2개 실패**  
  - **주요 실패 원인**:  
    1. `LoginForm.test.tsx`에서 기대 문자열 "🚀 서비스 로그인"이 실제 렌더링 결과와 불일치 (`서비스 로그인`).  
    2. `PersonalServiceDashboard.tsx` 구문 오류: `renderExportReportsFullPage` 재정의로 인해 Babel 파싱 실패.
- 관련 로그: `chunk_id=195b9e`, `chunk_id=2f3491`.

### 3.2 프로덕션 빌드 (npm run build)
- 결과: **실패**  
  - 동일한 `renderExportReportsFullPage` 중복 선언 오류로 빌드 중단 (`chunk_id=a9794a`).
- 빌드 산출물(`build/`) 미생성.

### 3.3 코드 정적 분석 / Lint
- 별도 lint 스크립트 미구현. ESLint는 CRA 기본 설정 존재하나 실행 기록 없음.

### 3.4 보안 감사 (npm audit)
- `npm audit --production` 실행 실패 (HTTP 403).  
  - 외부 네트워크 제한 혹은 npm 계정 권한 문제 추정 (`chunk_id=707a34`).

---

## 4. 백엔드 & 인프라 상태
### 4.1 Render 백엔드 서비스
- `GET https://ahp-django-backend.onrender.com/health/` 요청 결과: **HTTP 403 Forbidden** (`chunk_id=e3c279`).  
  - 인증/허용 IP 정책으로 외부 점검이 제한된 것으로 보임.  
  - 퍼블릭 상태 확인 필요.
- `GET https://ahp-django-backend.onrender.com/db-status/` 응답 본문 없음 (`chunk_id=f764e3`).  
  - 엔드포인트가 인증 필요 혹은 비활성화되어 있을 가능성.

### 4.2 PostgreSQL (Render)
- DB 접속 테스트 미수행 (접속 정보 미제공).  
  - 백엔드 `db-status` 엔드포인트 응답 부재로 연결성 미확인 상태.

### 4.3 백엔드 코드베이스
- 로컬 레포의 `django_backend/` 디렉터리가 비어 있어, 동시 개발/디버깅 불가.  
  - 서브모듈 추가 또는 백엔드 저장소 병행 클론 필요.

---

## 5. 위험 요소 및 개선 권고
1. **프론트엔드 빌드 불가**  
   - `PersonalServiceDashboard.tsx` 함수 중복 선언 제거 또는 네이밍 변경 필요.  
   - 빌드/테스트 실패로 CI 파이프라인과 배포 자동화 중단 위험 존재.
2. **단위 테스트 실패**  
   - `LoginForm` UI 텍스트 업데이트에 맞춰 테스트 스냅샷/쿼리 수정 필요.  
   - 주요 인증 플로우에 대한 회귀 검증이 현재 무효화됨.
3. **npm audit 실패**  
   - 프록시/레지스트리 접근 정책 검토, 필요한 경우 `npm config set registry` 혹은 사내 프록시 설정 정비.
4. **백엔드 접근 제한**  
   - 헬스체크/DB 상태 확인 불가. Render 방화벽 또는 인증 정책 확인 필요.  
   - 운영 모니터링 대시보드 구축 또는 pingdom과 같은 외부 모니터링 도입 검토.
5. **백엔드 코드 부재**  
   - 로컬 단일 레포에서 프론트/백 분리 개발 시 개발 효율 저하.  
   - `git submodule` 또는 `git sparse-checkout` 활용해 백엔드 코드를 함께 관리하도록 개선 권장.
6. **npm 환경설정 경고**  
   - `npm config delete http-proxy` 혹은 올바른 프록시 값 재설정으로 경고 제거.

---

## 6. 향후 조치 제안 (우선순위)
1. **P0**: `PersonalServiceDashboard.tsx` 중복 함수 정리 → 빌드 및 테스트 복구.
2. **P0**: `LoginForm.test.tsx` 기대 문자열 최신 UI에 맞춰 수정.
3. **P1**: Render 백엔드 헬스체크/DB 상태 엔드포인트 인증 정책 점검 후 외부 모니터링 가능하도록 조정.
4. **P1**: 백엔드 저장소를 서브모듈로 연결하거나 로컬 개발 환경에서 병행 세팅.
5. **P2**: npm audit 실행 가능하도록 네트워크/프록시 재설정, 정기적 보안 점검 파이프라인 구축.
6. **P2**: CRA Lint/Formatter 자동화 (`npm run lint` 스크립트) 추가로 코드 품질 관리.

---

## 7. 참고 자료
- 테스트 로그: `chunk_id=195b9e`, `chunk_id=2f3491`
- 빌드 로그: `chunk_id=a9794a`
- 네트워크 점검: `chunk_id=e3c279`, `chunk_id=f764e3`
- 보안 감사 시도: `chunk_id=707a34`
- Node/npm 버전 확인: `chunk_id=3c76b0`
- 최신 커밋 확인: `chunk_id=1340ae`

