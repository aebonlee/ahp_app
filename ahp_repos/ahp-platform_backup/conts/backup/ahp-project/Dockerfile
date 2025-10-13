# Node.js 기반 배포용 Dockerfile
FROM node:18-alpine

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci --only=production

# 앱 파일 복사
COPY . .

# 빌드
RUN npm run build

# 포트 설정
EXPOSE 3000

# Express 서버 실행
CMD ["node", "server.js"]