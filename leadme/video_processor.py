
import cv2
import mediapipe as mp
import numpy as np
import os
from yt_dlp import YoutubeDL
from pymongo import MongoClient
import math

# MediaPipe의 포즈 감지 모델 초기화
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()


PERMANENT_DIRECTORY_CHALLENGE = "/home/ubuntu/python/video/challenge"
# PERMANENT_DIRECTORY_CHALLENGE = "video/challenge"

# MongoDB 연결 설정
client = MongoClient(
    host='i11c109.p.ssafy.io',
    port=27070,
    username='leadme',
    password='leadmessafy11',
    authSource='admin'  # 인증할 데이터베이스를 지정합니다. 기본적으로 'admin'을 사용합니다.
)
db = client['local']  # 'local' 데이터베이스 이름 설정
collection = db['landmarks']  # 'landmarks' 컬렉션 이름 설정

# 비디오 다운로드 함수
def download_video(url, youtube_id, output_dir=PERMANENT_DIRECTORY_CHALLENGE):
    output_path = os.path.join(output_dir, f"{youtube_id}.mp4")
    # 기존 파일이 있다면 삭제
    if os.path.exists(output_path):
        os.remove(output_path)

    ydl_opts = {
        'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]',  # mp4 확장자 지정
        'outtmpl': output_path,  # 출력 파일명 설정
        'quiet': True,
        'external_downloader': 'aria2c',  # 빠른 다운로드를 위한 외부 다운로더 사용
        'external_downloader_args': ['-x', '16', '-k', '1M'],  # 병렬 연결 수와 단위 설정
        # 'proxy' : 'http://localhost:3128'
    }
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])

    # 다운로드 후 파일 확장자 확인 및 변경
    base, ext = os.path.splitext(output_path)

    print("현재 확장자명 : " + ext)

    if ext == '.webm':
        new_output_path = base + '.mp4'
        os.rename(output_path, new_output_path)
        output_path = new_output_path

    return output_path



def process_video(youtubeId, video_path):
    keypoints_list = []

    # 비디오 파일이 존재하는지 확인
    if not os.path.exists(video_path):
        print("Error: "+ video_path + " Video file not found.")
        return keypoints_list

    # 비디오 파일 로드
    cap = cv2.VideoCapture(video_path)

    # 비디오 파일이 열리지 않으면 종료
    if not cap.isOpened():
        print("Error: Could not open video.")
        return keypoints_list

    # 비디오의 원본 FPS와 프레임 수 가져오기
    original_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / original_fps  # 비디오 길이(초)

    print(str(original_fps) + " : original_fps")
    print(str(total_frames) + " : total_frames")
    print(str(duration) + " : duration")

    # 고정된 FPS 설정
    target_fps = 30
    if original_fps <= 0 or target_fps <= 0:
        print("Error: Invalid FPS values.")
        cap.release()
        cv2.destroyAllWindows()
        return keypoints_list

    # frame_interval = round(original_fps / target_fps)
    target_time_interval = 1 / target_fps


    frame_count = 0
    elapsed_time = 0

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
        # 화면 보고싶으면 cv2.imshow('Frame', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break


    document = {
        'youtubeId': youtubeId,
        'landmarks': keypoints_list
    }

    # upsert를 사용하여 문서가 없으면 삽입하고, 있으면 업데이트
    filter_query = {'_id': youtubeId}
    update_query = {'$set': document}
    collection.update_one(filter_query, update_query, upsert=True)

    # 리소스 해제
    cap.release()
    cv2.destroyAllWindows()

    return keypoints_list, original_fps

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

    # 비디오의 원본 FPS와 프레임 수 가져오기
    original_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = total_frames / original_fps  # 비디오 길이(초)

    # 고정된 FPS 설정
    target_fps = 30
    if original_fps <= 0 or target_fps <= 0:
        print("Error: Invalid FPS values.")
        cap.release()
        cv2.destroyAllWindows()
        return keypoints_list


    frame_interval = round(original_fps / target_fps)
    
    frame_count = 0

    # 프레임 별로 비디오 처리
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # 매 `frame_interval` 번째 프레임만 처리
        if frame_count % frame_interval == 0:
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
            # 화면 보고싶으면 cv2.imshow('Frame', frame)
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        frame_count += 1

    print(str(frame_count) + " : 현재 총 프레임")
    
    document = {
        'landmarks': keypoints_list
    }

    # 리소스 해제
    cap.release()
    cv2.destroyAllWindows()

    return keypoints_list