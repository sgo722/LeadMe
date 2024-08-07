FROM node:20
# WORKDIR /app

WORKDIR /

COPY . .

RUN npm i

RUN npm run build

RUN apt-get update && apt-get install nginx -y

# # Deployment 단계
# #FROM nginx:alpine

# # Nginx 설정 파일 복사 (필요한 경우)
# # COPY nginx.conf /etc/nginx/nginx.conf

# # 빌드된 파일을 Nginx의 서비스 디렉토리로 복사
# COPY dist /usr/share/nginx/html

# # 포트 노출 (기본값: 80)
# EXPOSE 80

# # Nginx 실행
# # CMD ["nginx", "-g", "daemon off;"]

# # 실행 단계
# # FROM node:20 AS run
# # WORKDIR /app

# # 빌드된 파일을 복사
# # COPY --from=build /app .

# # 포트 노출 (기본값: 3000)
# # EXPOSE 80

# # 애플리케이션 실행

# 로컬에서 빌드한 결과물을 /usr/share/nginx/html 으로 복사합니다.
COPY ./dist /var/www/html

# 기본 nginx 설정 파일을 삭제합니다. (custom 설정과 충돌 방지)
# RUN rm /etc/nginx/conf.d/default.conf

# custom 설정파일을 컨테이너 내부로 복사합니다.

# 컨테이너의 80번 포트를 열어줍니다.
EXPOSE 80

# nginx 서버를 실행하고 백그라운드로 동작하도록 합니다.
CMD ["nginx", "-g", "daemon off;"]