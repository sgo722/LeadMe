import cv2
import mediapipe as mp
import numpy as np
import os
from yt_dlp import YoutubeDL
from pymongo import MongoClient

# MediaPipe의 포즈 감지 모델 초기화
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

# MongoDB 연결 설정
client = MongoClient('mongodb://localhost:27017/')
db = client['local']  # 'local' 데이터베이스 이름 설정
collection = db['landmarks']  # 'landmarks' 컬렉션 이름 설정

# 비디오 다운로드 함수
def download_video(youtubeId, output_path='downloaded_video.mp4'):
    # 기존 파일이 있다면 삭제
    if os.path.exists(output_path):
        os.remove(output_path)

    ydl_opts = {
        'format': 'best',
        'outtmpl': output_path,
        'quiet': True,
    }
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return output_path


def process_video(video_url, video_path):
    keypoints_list = []

    # 비디오 파일이 존재하는지 확인
    if not os.path.exists(video_path):
        print("Error: Video file not found.")
        return keypoints_list

    # 비디오 파일 로드
    cap = cv2.VideoCapture(video_path)

    # 비디오 파일이 열리지 않으면 종료
    if not cap.isOpened():
        print("Error: Could not open video.")
        return keypoints_list

    # 비디오의 fps 가져오기
    fps = cap.get(cv2.CAP_PROP_FPS)
    wait_time = int(1000 / fps)

    # 프레임 별로 비디오 처리
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # BGR 이미지를 RGB 이미지로 변환
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # MediaPipe를 사용하여 포즈 추정
        result = pose.process(rgb_frame)

        if result.pose_landmarks:
            # 각 랜드마크의 x, y, z 좌표 및 가시성 추출
            keypoints = []
            for landmark in result.pose_landmarks.landmark:
                keypoints.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                })
            keypoints_list.append(keypoints)

            # 프레임에 랜드마크 그리기 (선택 사항)
            mp.solutions.drawing_utils.draw_landmarks(frame, result.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        # 프레임 표시 (선택 사항)
        cv2.imshow('Frame', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    document = {
        'youtubeId': youtubeId,
        'landmarks': keypoints_list
    }

    # upsert를 사용하여 문서가 없으면 삽입하고, 있으면 업데이트
    filter_query = {'_id': video_url}
    update_query = {'$set': document}
    collection.update_one(filter_query, update_query, upsert=True)

    # 리소스 해제
    cap.release()
    cv2.destroyAllWindows()

    return keypoints_list



# 비디오 처리 함수
def process_video_user(video_path):
    keypoints_list = []

    # 비디오 파일이 존재하는지 확인
    if not os.path.exists(video_path):
        print("Error: Video file not found.")
        return keypoints_list

    # 비디오 파일 로드
    cap = cv2.VideoCapture(video_path)

    # 비디오 파일이 열리지 않으면 종료
    if not cap.isOpened():
        print("Error: Could not open video.")
        return keypoints_list

    # 비디오의 fps 가져오기
    fps = cap.get(cv2.CAP_PROP_FPS)
    wait_time = int(1000 / fps)

    # 프레임 별로 비디오 처리
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # BGR 이미지를 RGB 이미지로 변환
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

        # MediaPipe를 사용하여 포즈 추정
        result = pose.process(rgb_frame)

        if result.pose_landmarks:
            # 각 랜드마크의 x, y, z 좌표 및 가시성 추출
            keypoints = []
            for landmark in result.pose_landmarks.landmark:
                keypoints.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                })
            keypoints_list.append(keypoints)

            # 프레임에 랜드마크 그리기 (선택 사항)
            mp.solutions.drawing_utils.draw_landmarks(frame, result.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        # 프레임 표시 (선택 사항)
        cv2.imshow('Frame', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    document = {
        'landmarks': keypoints_list
    }


    # 리소스 해제
    cap.release()
    cv2.destroyAllWindows()

    return keypoints_list