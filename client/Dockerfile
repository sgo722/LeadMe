FROM node:20 AS build
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm i

COPY . .

RUN npm run build

# Deployment 단계
FROM nginx:alpine

# Nginx 설정 파일 복사 (필요한 경우)
# COPY nginx.conf /etc/nginx/nginx.conf

# 빌드된 파일을 Nginx의 서비스 디렉토리로 복사
# COPY --from=build /app/dist /usr/share/nginx/html

COPY dist /usr/share/nginx/html

# 포트 노출 (기본값: 80)
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]