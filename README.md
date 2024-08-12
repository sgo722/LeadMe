# SSAFY 11기 공통프로젝트 : LeadMe



<br/>

## 🖥️ 프로젝트 소개

**플랫폼 검색을 한 번에**
+ 유튜브, 틱톡의 모든 숏츠 영상을 한 번의 검색으로 모아 볼 수 있습니다.

**AI 기반 분석 레포트 제공**
+ AI 기술을 활용한 모션 분석 보고서를 제공하여 춤 연습을 더욱 효율적으로 할 수 있습니다.

**SNS 업로드 기능**
+ 내가 춘 챌린지를 유튜브에 업로드 하여 나의 춤 실력을 뽐낼 수 있습니다.

<br/>

## 📹 프로젝트 시연 영상

<br/>

## 🧑‍🤝‍🧑 멤버 구성 및 역할

|FE/BE|이름|역할|
|---|---|-------|
|FE|윤하연|자신이 개발한 내용 기입!|
|FE|임준희|자신이 개발한 내용 기입!|
|BE|남보우|자신이 개발한 내용 기입!|
|BE|박준엽|자신이 개발한 내용 기입!|
|BE|박진우|자신이 개발한 내용 기입!|
|BE|양준영|자신이 개발한 내용 기입!|

<br/>

## ⚙️ 개발 환경

FE
---


BE
---
1. 자바 버전 : 
2. Springboot 버전 : 
3. 빌드 & 빌드 도구 :
4. Git branch 전략 :  






<br/>

## 🛠️ 기술 스택

FE
---


**Library**
<br/>
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Threejs](https://img.shields.io/badge/threejs-black?style=for-the-badge&logo=three.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)


BE
---

**Framework**
<br/>
<img src="https://img.shields.io/badge/springboot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white">
<img src="https://img.shields.io/badge/Spring Security-6DB33F?style=for-the-badge&logo=Spring Security&logoColor=white">

**DB**
<br/>
![MySQL](https://img.shields.io/badge/mysql-4479A1.svg?style=for-the-badge&logo=mysql&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)

**Library**
<br/>
<img src="https://img.shields.io/badge/spring data jpa-6DB33F?style=for-the-badge&logo=spring&logoColor=white">
<img src="https://img.shields.io/badge/QueryDSL-0078C0?style=for-the-badge&logo=quora&logoColor=white">
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)


**Protocol & Message Queue**
<br/>
<img src="https://img.shields.io/badge/WebSocket-010101?style=for-the-badge&logo=socket.io&logoColor=white">
<img src="https://img.shields.io/badge/Stomp-008CDD?style=for-the-badge&logo=stripe&logoColor=white">
<img src="https://img.shields.io/badge/Redis PUB/SUB-FF4438?style=for-the-badge&logo=redis&logoColor=white">


**Server**
<br/>
<img src="https://img.shields.io/badge/AWS EC2-FF9900?style=for-the-badge&logo=amazon ec2&logoColor=white">
<img src="https://img.shields.io/badge/AWS S3-569A31?style=for-the-badge&logo=amazon s3&logoColor=white">
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)


Comunication
---
![Notion](https://img.shields.io/badge/Notion-%23000000.svg?style=for-the-badge&logo=notion&logoColor=white)
![GitLab](https://img.shields.io/badge/gitlab-%23181717.svg?style=for-the-badge&logo=gitlab&logoColor=white)



<br/>

## 📋 기능 소개

**📌 회원**

> Kakao, Google를 통해 소셜 로그인을 진행한다. <br>
> JWT 토큰을 이용하여 인증,인가를 진행하며 인가 시간이 초과한 경우 재로그인을 해야 한다.<br>
> 아이디와,비밀번호를 통하여 인증을 진행하며 일치하지 않을 경우 서비스 사용을 할 수 없다.<br>

**📌 마이페이지**

> 사용자는 마이페이지에서 자신이 올린 챌린지 영상을 조회할 수 있다. <br>
> 자신이 팔로워 한 유저 목록, 자신을 팔로잉한 유저 목록을 조회할 수 있다. <br>
> 채팅 페이지로 이동 및 프로필 편집을 할 수 있다. <br>

**📌 챌린지 검색**


**📌 챌린지 연습하기**

**📌 챌린지 배틀**

**📌 채팅**

> 사용자는 마이페이지의 메시지목록에서 채팅을 진행할 수 있다.<br>
> 사용자는 가입된 다른 사용자를 검색하여 채팅방을 개설할 수 있다.<br>
> 채팅방 생성 및 삭제 시 채팅방 리스트 및 마지막 메세지가 최신화된다.<br>
> 메시지목록 페이지 진입 시, 사용자가 읽지않은 메시지가 있다면 채팅방에 표시된다.<br>

**📌 랭킹**

> 사용자가 게시한 챌린지 영상에서 받은 좋아요수의 총 합계를 계산하여 랭킹이 집계된다. <br>
> 순위가 높은 유저부터 확인할 수 있고, 해당 유저를 클릭시 유저의 피드로 이동할 수 있다. <br>
> 유저의 프로필 정보, 해당 유저가 받은 좋아요 수, 해당 유저의 팔로워 수를 확인할 수 있다. <br>


<br/>

## 🏗 아키텍처

![아키텍처](/uploads/38760df4e89520a10bf307ea44ae7686/image__4_.png)


<br/>

## 📐 ERD

![ERD](/uploads/d353ae5e0f69e5de0ea6e4e4127d2081/image.png)



