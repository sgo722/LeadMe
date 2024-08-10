FROM openjdk:17-slim-buster

RUN apt-get update && apt-get install -y ffmpeg

ARG JAR_FILE=build/libs/*.jar

ENV MONGO_USERNAME=leadme
ENV MONGO_PASSWORD=leadmessafy11

# 필요한 디렉토리 생성 (데이터 저장용)
RUN mkdir -p /home/ubuntu/python/video/temporary /home/ubuntu/python/video/user /home/ubuntu/python/video/challenge /home/ubuntu/python/video/challenge/audio /home/ubuntu/python/video/user/thumbnail /home/ubuntu/python/video/challenge/thumbnail

# 애플리케이션 코드 복사
COPY . .

# 지속적인 데이터 저장을 위해 볼륨 설정
VOLUME ["/home/ubuntu/python/video/temporary", "/home/ubuntu/python/video/user","/home/ubuntu/python/video/challenge","/home/ubuntu/python/video/challenge/audio", "/home/ubuntu/python/video/user/thumbnail", "/home/ubuntu/python/video/challenge/thumbnail"]

COPY ${JAR_FILE} app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]

