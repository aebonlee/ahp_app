@echo off
echo ==============================================
echo AHP Research Platform - 안정 버전 복구
echo ==============================================
echo.

echo 현재 디렉토리를 확인합니다...
cd /d "C:\Users\ASUS\ahp-research-platform"

echo.
echo Git 태그를 이용한 안정 버전 복구를 시작합니다...
echo 대상 태그: v1.0-evaluation-test-complete
echo.

git checkout v1.0-evaluation-test-complete

if errorlevel 1 (
    echo 오류: Git 태그 복구에 실패했습니다.
    echo 백업 파일을 이용한 복구를 시도합니다...
    
    cd /d "C:\Users\ASUS"
    
    echo 기존 프로젝트 폴더를 백업합니다...
    if exist "ahp-research-platform-old" rmdir /s /q "ahp-research-platform-old"
    if exist "ahp-research-platform" move "ahp-research-platform" "ahp-research-platform-old"
    
    echo 백업 파일에서 복구합니다...
    tar -xzf "AHP-PROJECT-BACKUPS\STABLE-VERSIONS\v1.0-evaluation-test-complete-20250829\v1.0-evaluation-test-complete-20250829-source.tar.gz"
    
    if errorlevel 1 (
        echo 오류: 백업 파일 복구에 실패했습니다.
        echo 기존 폴더를 복원합니다...
        move "ahp-research-platform-old" "ahp-research-platform"
        pause
        exit /b 1
    )
    
    cd "ahp-research-platform"
)

echo.
echo 의존성을 설치합니다...
npm install

if errorlevel 1 (
    echo 경고: npm install에서 일부 문제가 발생했을 수 있습니다.
    echo 수동으로 확인해 주세요.
)

echo.
echo 빌드 테스트를 진행합니다...
npm run build:frontend

if errorlevel 1 (
    echo 오류: 빌드에 실패했습니다.
    echo 프로젝트 설정을 확인해 주세요.
    pause
    exit /b 1
)

echo.
echo ==============================================
echo 복구가 완료되었습니다!
echo.
echo 현재 버전: v1.0-evaluation-test-complete
echo 프로젝트 위치: C:\Users\ASUS\ahp-research-platform
echo GitHub: https://github.com/aebonlee/ahp-research-platform
echo.
echo 개발 서버 시작: npm start
echo ==============================================
echo.

pause