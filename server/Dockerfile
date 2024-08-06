FROM openjdk:17-alpine

RUN apk update && apk add ffmpeg

ARG JAR_FILE=build/libs/*.jar

COPY ${JAR_FILE} app.jar

ENTRYPOINT ["java", "-jar", "/app.jar"]

