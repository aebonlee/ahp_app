#!/bin/bash

# AHP for Paper 수동 배포 스크립트
# GitHub Actions가 실패할 경우 사용하는 백업 배포 방법

echo "🚀 AHP for Paper 수동 배포 시작..."

# 1. 의존성 설치
echo "📦 의존성 설치 중..."
npm ci

# 2. 테스트 실행
echo "🧪 테스트 실행 중..."
npm test -- --watchAll=false --coverage=false

if [ $? -ne 0 ]; then
    echo "❌ 테스트 실패! 배포를 중단합니다."
    exit 1
fi

# 3. 프론트엔드 빌드
echo "🔨 프론트엔드 빌드 중..."
PUBLIC_URL=/AHP-decision-system npm run build:frontend

if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패! 배포를 중단합니다."
    exit 1
fi

# 4. GitHub Pages에 배포
echo "📤 GitHub Pages에 배포 중..."
npx gh-pages -d build -o origin

if [ $? -eq 0 ]; then
    echo "✅ 배포 완료!"
    echo "🌐 사이트: https://aebonlee.github.io/AHP-decision-system/"
    echo ""
    echo "💡 배포가 완료되었습니다. 몇 분 후 사이트가 업데이트됩니다."
    echo "   캐시 문제가 있다면 브라우저 새로고침(Ctrl+F5)을 시도해보세요."
else
    echo "❌ 배포 실패!"
    exit 1
fi