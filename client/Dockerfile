FROM node:20 AS build
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

RUN npm run build

RUN ls -la /app/dist

# Deployment 단계
FROM node:20

WORKDIR /app

RUN npm install -g serve

# 빌드된 파일을 Nginx의 서비스 디렉토리로 복사
COPY --from=build /app/dist /app/dist

# 포트 노출 (기본값: 80)
EXPOSE 5173

# 실행
CMD ["serve", "-s", "dist", "-l", "5173"]