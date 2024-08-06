# 빌드 스테이지
FROM node:20.12.2-alpine as build

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 및 설치
# package*.json을 먼저 복사하고 npm ci를 실행해서 의존성 설치를 캐싱
COPY package*.json ./
RUN npm ci

# 소스 코드 복사
COPY . .

# 프로덕션용 빌드
RUN npm run build


# nginx 사용이유
# spa라서 빌드 후에는 정적 파일만 남는데, nginx는 정적파일을 효율적으로 제공할 수 있는 가볍고 빠른 웹서버
# node보다 nginx쓰는게 리소스 사용 측면에서 더 효율적
# 실행 스테이지
FROM nginx:alpine

# Nginx 설정 파일 복사 해야함??
# COPY nginx.conf /etc/nginx/nginx.conf

# 빌드된 파일을 Nginx의 서비스 디렉토리로 복사
COPY --from=build /app/dist /usr/share/nginx/html

# 포트 노출
# nginx 기본설정 80번 포트
# 컨테이너 실행할때 -p 옵션으로 호스트의 포트와 매핑해야함
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]