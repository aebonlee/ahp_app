# 🗂️ 백업 시스템 가이드

## 📋 개요
AHP Research Platform의 체계적인 백업 및 복구 시스템입니다.

## 📁 백업 위치
```
C:\Users\ASUS\AHP-PROJECT-BACKUPS\
```

## 🏷️ 현재 안정 버전
- **버전**: v1.0-evaluation-test-complete
- **날짜**: 2025-08-29
- **상태**: ✅ 프로덕션 준비 완료
- **Git 태그**: `v1.0-evaluation-test-complete`

## 🔄 빠른 복구
```batch
# Windows 원클릭 복구
C:\Users\ASUS\AHP-PROJECT-BACKUPS\restore-stable.bat
```

## 📊 백업 구조
- **STABLE-VERSIONS**: 안정 버전 릴리스
- **SOURCE-CODE**: 최신 소스코드 백업  
- **DOCUMENTATION**: 개발 문서 및 메타데이터
- **DAILY-BACKUPS**: 일일 백업 (자동화 예정)
- **RELEASES**: 프로덕션 릴리스

## ⚠️ 복구 후 필수 작업
1. `npm install` - 의존성 설치
2. `npm run build` - 빌드 테스트
3. 환경 설정 확인

자세한 내용은 백업 폴더의 README.md를 참조하세요.