# AHP Research Platform - 백업 관리 시스템

## 📋 백업 개요

이 디렉토리는 AHP Research Platform 프로젝트의 체계적인 백업 관리를 위해 생성되었습니다.

## 📁 디렉토리 구조

```
ahp-research-platform-backups/
├── version-history/          # 버전별 히스토리 백업
├── restore-points/          # 주요 복구 지점 백업  
├── v1.0-evaluation-test-complete-20250829-source.tar.gz  # 현재 버전 압축 백업
└── BACKUP_INFO.md          # 이 파일
```

## 🏷️ 현재 복구 기점 설정

### v1.0-evaluation-test-complete (2025-08-29)
- **Git Tag**: `v1.0-evaluation-test-complete`
- **Commit Hash**: `7031e64`
- **백업 파일**: `v1.0-evaluation-test-complete-20250829-source.tar.gz`
- **상태**: ✅ 안정적 (Stable)

### 주요 기능
- ✅ 평가 테스트 기능 완전 구현
- ✅ 템플릿 레이아웃 통합
- ✅ 라우팅 시스템 정상 작동
- ✅ TypeScript 빌드 성공
- ✅ 프로덕션 빌드: 331.93 kB (gzipped)

## 🔄 복구 방법

### Git 태그를 이용한 복구
```bash
cd C:\Users\ASUS\ahp-research-platform
git checkout v1.0-evaluation-test-complete
```

### 백업 파일을 이용한 복구
```bash
cd C:\Users\ASUS
tar -xzf ahp-research-platform-backups/v1.0-evaluation-test-complete-20250829-source.tar.gz
```

## 📊 백업 이력

| 버전 | 날짜 | Git Tag | 설명 | 상태 |
|------|------|---------|------|------|
| v1.0 | 2025-08-29 | v1.0-evaluation-test-complete | 평가 테스트 기능 완성 | ✅ Stable |

## 📝 백업 정책

1. **주요 기능 완성 시점**마다 복구 기점 생성
2. **Git 태그**와 **압축 백업 파일** 이중 백업
3. **버전별 시리즈 백업**으로 이력 관리
4. **백업 정보 문서화**로 추적성 확보

## ⚠️ 중요 사항

- 백업 파일은 `node_modules`, `.git`, `build` 디렉토리 제외
- Git 태그는 GitHub에도 동기화됨
- 복구 시 npm install 등 의존성 재설치 필요

---
생성일: 2025-08-29 15:31 KST
생성자: Claude Code Assistant