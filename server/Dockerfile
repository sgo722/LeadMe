FROM openjdk:17-slim-buster

RUN apt-get update && apt-get install -y ffmpeg

ARG JAR_FILE=build/libs/*.jar

ENV MONGO_USERNAME=leadme
ENV MONGO_PASSWORD=leadmessafy11

COPY ${JAR_FILE} app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]

