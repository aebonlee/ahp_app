# 🗂️ AHP Research Platform - 백업 아카이브

## 📋 개요
AHP Research Platform 프로젝트의 체계적인 백업 및 아카이브 시스템입니다.

## 📁 폴더 구조

```
AHP-PROJECT-BACKUPS/
├── 📂 STABLE-VERSIONS/          # 안정 버전 릴리스
│   └── v1.0-evaluation-test-complete-20250829/
│       └── v1.0-evaluation-test-complete-20250829-source.tar.gz
├── 📂 SOURCE-CODE/              # 최신 소스코드 백업
│   └── ahp-research-platform-latest-20250829.tar.gz
├── 📂 DAILY-BACKUPS/            # 일일 백업 (자동)
├── 📂 DOCUMENTATION/            # 문서 및 메타데이터
│   ├── BACKUP_INFO.md
│   ├── git-history.txt
│   ├── git-tags.txt
│   └── git-remotes.txt
├── 📂 RELEASES/                 # 프로덕션 릴리스
└── 📄 README.md                 # 이 파일
```

## 🏷️ 현재 안정 버전

### v1.0-evaluation-test-complete (2025-08-29)
- **상태**: ✅ 안정적 (Production Ready)
- **Git Tag**: `v1.0-evaluation-test-complete`
- **커밋**: `5f82da0`
- **빌드 크기**: 331.93 kB (gzipped)
- **GitHub**: https://github.com/aebonlee/ahp-research-platform

#### 주요 기능
- ✅ **평가 테스트 시스템**: 완전한 미리보기/시뮬레이션 기능
- ✅ **템플릿 레이아웃**: 헤더/사이드바 통합
- ✅ **라우팅 최적화**: 독립적 App.tsx 처리
- ✅ **TypeScript 호환**: 컴파일 오류 없음

## 🔄 복구 절차

### 1. Git 태그 복구 (권장)
```bash
cd C:\Users\ASUS\ahp-research-platform
git checkout v1.0-evaluation-test-complete
npm install
npm run build
```

### 2. 백업 파일 복구
```bash
cd C:\Users\ASUS
tar -xzf AHP-PROJECT-BACKUPS/STABLE-VERSIONS/v1.0-evaluation-test-complete-20250829/v1.0-evaluation-test-complete-20250829-source.tar.gz
cd ahp-research-platform
npm install
```

### 3. 최신 소스 복구
```bash
cd C:\Users\ASUS
tar -xzf AHP-PROJECT-BACKUPS/SOURCE-CODE/ahp-research-platform-latest-20250829.tar.gz
```

## 📊 백업 정책

### 자동 백업
- **안정 버전**: 주요 기능 완성 시점
- **일일 백업**: 개발 중 변경사항 (예정)
- **소스 백업**: 매 커밋마다 최신 상태 유지

### 보관 정책
- **안정 버전**: 영구 보관
- **일일 백업**: 30일 보관
- **소스 백업**: 최신 5개 버전 보관

## 🔧 유지보수

### 백업 검증
```bash
# 압축 파일 무결성 검사
tar -tzf [backup-file].tar.gz > /dev/null && echo "OK" || echo "CORRUPTED"

# 크기 확인
ls -lh AHP-PROJECT-BACKUPS/SOURCE-CODE/
```

### 정리 작업
```bash
# 오래된 일일 백업 정리 (30일 이상)
find AHP-PROJECT-BACKUPS/DAILY-BACKUPS/ -name "*.tar.gz" -mtime +30 -delete
```

## ⚠️ 중요 사항

1. **의존성 재설치**: 복구 후 반드시 `npm install` 실행
2. **환경 설정**: `.env` 파일 및 설정 확인
3. **Git 설정**: 원격 저장소 연결 확인
4. **빌드 테스트**: `npm run build` 성공 확인

## 📞 지원

- **GitHub Repository**: https://github.com/aebonlee/ahp-research-platform
- **백업 위치**: `C:\Users\ASUS\AHP-PROJECT-BACKUPS\`
- **생성일**: 2025-08-29
- **최종 업데이트**: 2025-08-29 15:50 KST

---
**백업 시스템 버전**: 1.0  
**관리자**: Claude Code Assistant