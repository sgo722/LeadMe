# 베이스 이미지 선택
FROM python:3.9-slim

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 의존성 설치
RUN apt-get update && apt-get install -y \
    build-essential \
    # OpenGL 라이브러리 추가
    libgl1-mesa-glx \
    libglib2.0-0 \  
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Python 의존성 파일 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 애플리케이션 코드 복사
COPY . .

# 환경 변수 설정
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV FILE_STORAGE_PATH=/app/video

# 파일 저장을 위한 볼륨 생성
VOLUME ["/app/video"]

# ffmpeg 다운로드
RUN apt-get update && apt-get install -y ffmpeg

# 필요한 디렉토리 생성 및 권한 설정
RUN mkdir -p /app/video && chmod 777 /app/video

# 포트 설정
EXPOSE 4567

# 환경 변수 설정 (개발 환경 예시)
ENV ENV=dev

# 애플리케이션 시작 명령
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4567", "--reload"]
