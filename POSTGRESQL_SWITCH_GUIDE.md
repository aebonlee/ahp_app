# 💳 유료 PostgreSQL로 전환 가이드

## 🎯 현재 상황
- **기존 DB**: dpg-d2vgtg3uibrs738jk4i0-a (무료, 10월 9일 만료)
- **유료 DB**: dpg-d2q8l5qdbo4c73bt3780-a (이미 결제 중)

## ✅ 전환 작업 (즉시 실행)

### Step 1: Render.com에서 유료 DB 정보 확인

1. **Render.com 대시보드** 접속
2. **PostgreSQL 데이터베이스** 섹션에서 유료 DB 선택
   - ID: `dpg-d2q8l5qdbo4c73bt3780-a`
3. **Connection** 탭에서 다음 정보 복사:
   - Internal Database URL (전체 복사)
   - 또는 개별 정보:
     - Database
     - User  
     - Password
     - Hostname

### Step 2: 백엔드 서비스 환경변수 업데이트

1. **ahp-django-backend** 서비스 선택
2. **Environment** 탭 이동
3. **DATABASE_URL** 변수 찾기
4. 값을 새로운 유료 DB URL로 변경:
   ```
   postgresql://[USER]:[PASSWORD]@dpg-d2q8l5qdbo4c73bt3780-a.oregon-postgres.render.com/[DATABASE]
   ```
5. **Save Changes** 클릭

### Step 3: 서비스 재배포

환경변수 저장 후 자동으로 재배포가 시작됩니다.
만약 자동으로 시작되지 않으면:
1. **Manual Deploy** 클릭
2. 최신 커밋 배포

## 📊 전환 후 이점

| 항목 | 무료 DB | 유료 DB |
|------|---------|---------|
| 만료일 | 10월 9일 | 없음 |
| 용량 | 1GB | 더 큼 |
| 연결 수 | 제한됨 | 더 많음 |
| 백업 | 없음 | 자동 백업 |
| 성능 | 제한됨 | 향상됨 |

## ✅ 전환 성공 확인

### 배포 로그 확인
```
✅ Using PAID PostgreSQL Instance: dpg-d2q8l5qdbo4c73bt3780-a
💳 Already subscribed - No expiry issues!
```

### API 테스트
```bash
curl https://ahp-django-backend.onrender.com/api/service/projects/
```
성공 시: `[]` 또는 데이터 반환

## 💰 비용 최적화

현재 비용:
- Web Service: $7/월 (업그레이드 필요)
- PostgreSQL: 이미 결제 중 ✅

**총 추가 비용: $7/월만 추가**
(PostgreSQL은 이미 결제 중이므로 추가 비용 없음)

## ⚠️ 주의사항

1. **데이터 마이그레이션**
   - 새 DB이므로 기존 데이터 없음
   - 마이그레이션 자동 실행됨
   - 샘플 데이터 자동 생성

2. **연결 정보 보안**
   - DATABASE_URL은 환경변수로만 관리
   - 코드에 하드코딩 금지
   - Git에 커밋하지 않기

## 🚀 다음 단계

1. ✅ 유료 PostgreSQL로 전환 (지금)
2. ✅ Web Service만 $7/월로 업그레이드
3. ✅ 자동 배포 활성화 확인
4. ✅ 27개 커밋 배포 확인

---

**결론: 이미 결제 중인 PostgreSQL을 사용하면 $7만 추가로 전체 시스템을 정상화할 수 있습니다!**