# 베이스 이미지로 Python 3.9 버전의 slim 이미지를 사용
FROM python:3.9-slim

# 컨테이너 내에서 작업 디렉토리 설정
WORKDIR /app


# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    # OpenGL 라이브러리 추가
    libgl1-mesa-glx \
    libglib2.0-0 \  
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 애플리케이션 코드 복사
COPY . .


# 필요 패키지 설치
RUN pip install --no-cache-dir -r requirements.txt

# 필요한 디렉토리 생성 (데이터 저장용)
RUN mkdir -p /home/ubuntu/python/video/temporary /home/ubuntu/python/video/user /home/ubuntu/python/video/challenge

# 환경 변수 설정 (필요한 경우)
ENV ENV=prod
ENV FILE_STORAGE_PATH=/home/ubuntu/python/video

# FastAPI 앱을 실행할 포트 노출
EXPOSE 4567

# 지속적인 데이터 저장을 위해 볼륨 설정
VOLUME ["/home/ubuntu/python/video/temporary", "/home/ubuntu/python/video/user", "/home/ubuntu/python/video/challenge"]

# 애플리케이션 실행
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4567"]