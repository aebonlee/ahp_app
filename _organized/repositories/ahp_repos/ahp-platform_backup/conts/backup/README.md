# 🗂️ AHP Research Platform - 백업 시스템

## 📋 개요
체계적인 구조와 간편한 복구 절차를 갖춘 AHP Research Platform 프로젝트의 포괄적인 백업 시스템입니다.

## 📁 디렉토리 구조

```
C:\Users\ASUS\ahp-research-platform\backup\
├── 📂 ahp-project/              # 완전한 프로젝트 백업
│   └── ahp-research-platform-complete-YYYYMMDD-HHMM.tar.gz
├── 📂 stable-versions/          # 안정 버전 릴리스
│   └── v1.0-evaluation-test-complete-20250829/
│       └── v1.0-evaluation-test-complete-20250829-source.tar.gz
├── 📂 source-archives/          # 개발 소스 백업
│   └── ahp-research-platform-latest-20250829.tar.gz
├── 📂 documentation/            # 프로젝트 문서 및 메타데이터
│   ├── README.md
│   ├── DEVELOPMENT-STATUS.md
│   ├── git-status.txt
│   └── 다양한 git 정보 파일들
├── 📂 scripts/                  # 백업 및 복구 스크립트
│   └── restore-project.bat
└── 📄 README.md                 # 이 파일
```

## 🏷️ 현재 안정 버전

### v1.0-evaluation-test-complete (2025-08-29)
- **상태**: ✅ 프로덕션 준비 완료
- **Git 태그**: `v1.0-evaluation-test-complete`
- **GitHub**: https://github.com/aebonlee/ahp-research-platform
- **빌드 크기**: 331.93 kB (gzipped)
- **TypeScript**: 컴파일 오류 없음

#### 구현된 주요 기능
- ✅ **평가 테스트 시스템**: 완전한 미리보기 및 시뮬레이션 기능
- ✅ **템플릿 통합**: 완전한 헤더/사이드바 레이아웃 통합
- ✅ **라우팅 최적화**: 독립적인 App.tsx 처리
- ✅ **프로덕션 빌드**: 최적화되고 오류 없음

## 🔄 복구 절차

### 방법 1: Git 태그 복구 (권장)
```bash
cd C:\Users\ASUS\ahp-research-platform
git checkout v1.0-evaluation-test-complete
npm install
npm run build
```

### 방법 2: 원클릭 복구
```batch
# Windows 배치 스크립트
C:\Users\ASUS\ahp-research-platform\backup\scripts\restore-project.bat
```

### 방법 3: 아카이브 복구
```bash
cd C:\Users\ASUS
# 안정 버전 추출
tar -xzf ahp-research-platform/backup/stable-versions/v1.0-evaluation-test-complete-20250829/v1.0-evaluation-test-complete-20250829-source.tar.gz

# 또는 최신 완전 백업 추출
tar -xzf ahp-research-platform/backup/ahp-project/ahp-research-platform-complete-YYYYMMDD-HHMM.tar.gz
```

## 📊 백업 유형

### 1. 완전한 프로젝트 백업
- **위치**: `ahp-project/`
- **내용**: 모든 소스 파일이 포함된 전체 프로젝트
- **빈도**: 주요 마일스톤 및 릴리스
- **크기**: ~1.3MB 압축

### 2. 안정 버전 백업
- **위치**: `stable-versions/`
- **내용**: 검증된 안정 버전만
- **빈도**: 안정적으로 태그된 경우
- **목적**: 안전한 롤백 지점

### 3. 소스 아카이브
- **위치**: `source-archives/`
- **내용**: 개발 스냅샷
- **빈도**: 정기적인 개발 백업
- **목적**: 최신 변경사항 보존

### 4. 문서 백업
- **위치**: `documentation/`
- **내용**: 프로젝트 문서, git 정보, 개발 상태
- **목적**: 컨텍스트 및 메타데이터 보존

## 🛠️ 유지보수

### 정기 작업
```bash
# 백업 무결성 검증
tar -tzf ahp-research-platform/backup/ahp-project/[backup-file].tar.gz > /dev/null && echo "OK"

# 백업 크기 확인
du -sh ahp-research-platform/backup/*/

# 오래된 백업 정리 (최신 5개 유지)
cd ahp-research-platform/backup/ahp-project && ls -t *.tar.gz | tail -n +6 | xargs rm -f
```

### 백업 검증 체크리스트
- [ ] 아카이브가 오류 없이 추출됨
- [ ] 추출 후 npm install이 작동함
- [ ] 빌드 프로세스가 성공함
- [ ] 모든 주요 기능이 작동함
- [ ] Git 히스토리가 보존됨 (해당하는 경우)

## ⚠️ 중요 사항

1. **의존성**: 복구 후 항상 `npm install` 실행
2. **환경**: `.env` 파일 및 구성 확인
3. **Git 설정**: 필요시 원격 저장소 재연결
4. **빌드 테스트**: `npm run build` 성공 확인
5. **기능 테스트**: 평가 테스트 시스템 작동 확인

## 📞 빠른 참조

- **프로젝트 GitHub**: https://github.com/aebonlee/ahp-research-platform
- **백업 위치**: `C:\Users\ASUS\ahp-research-platform\backup\`
- **안정 태그**: `v1.0-evaluation-test-complete`
- **복구 스크립트**: `backup\scripts\restore-project.bat`

## 🎯 시스템 상태 요약

- ✅ **프로젝트 상태**: 프로덕션 준비 완료 및 안정적
- ✅ **백업 시스템**: 다중 복구 방법으로 완전 운영
- ✅ **문서화**: 완전한 가이드 및 절차
- ✅ **자동화**: 원클릭 복구 가능
- ✅ **버전 관리**: Git 태그가 GitHub와 동기화

---
**생성일**: 2025-08-29 16:00 KST  
**최종 업데이트**: 2025-08-29 16:00 KST  
**시스템 버전**: 2.0 (단순화된 구조)