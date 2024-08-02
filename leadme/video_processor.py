import cv2
import mediapipe as mp
import numpy as np
import os
from yt_dlp import YoutubeDL
from pymongo import MongoClient
from concurrent.futures import ThreadPoolExecutor, as_completed
import tensorflow as tf

# GPU 설정 함수
def set_up_gpu():
    os.environ['CUDA_VISIBLE_DEVICES'] = '0'  # 사용할 GPU 지정
    gpus = tf.config.experimental.list_physical_devices('GPU')
    if gpus:
        try:
            for gpu in gpus:
                tf.config.experimental.set_virtual_device_configuration(
                gpu,
                [tf.config.experimental.VirtualDeviceConfiguration(memory_limit=4096)]
    )
        except RuntimeError as e:
            print(e)

# MediaPipe의 포즈 감지 모델 초기화
mp_pose = mp.solutions.pose
pose = mp_pose.Pose()

# MongoDB 연결 설정
client = MongoClient('mongodb://i11c109.p.ssafy.io:27017/')
db = client['local']  # 'local' 데이터베이스 이름 설정
collection = db['landmarks']  # 'landmarks' 컬렉션 이름 설정

# 비디오 다운로드 함수
def download_video(url, output_path='downloaded_video.mp4'):
    if os.path.exists(output_path):
        os.remove(output_path)

    ydl_opts = {
        'format': 'bestvideo+bestaudio/best',
        'outtmpl': output_path,
        'quiet': True
    }
    with YoutubeDL(ydl_opts) as ydl:
        ydl.download([url])
    return output_path

# 비디오 처리 함수
def process_video(youtubeId, video_path):
    keypoints_list = []

    if not os.path.exists(video_path):
        print("Error: Video file not found.")
        return keypoints_list

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: Could not open video.")
        return keypoints_list

    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frames.append(rgb_frame)

    # 배치로 프레임 처리
    results = pose.process(frames)
    for result in results:
        if result.pose_landmarks:
            keypoints = [{
                'x': landmark.x,
                'y': landmark.y,
                'z': landmark.z,
                'visibility': landmark.visibility
            } for landmark in result.pose_landmarks.landmark]
            keypoints_list.append(keypoints)

    document = {'youtubeId': youtubeId, 'landmarks': keypoints_list}
    filter_query = {'_id': youtubeId}
    update_query = {'$set': document}
    collection.update_one(filter_query, update_query, upsert=True)

    cap.release()
    cv2.destroyAllWindows()

    return keypoints_list


# 사용자 업로드 비디오 처리 함수
def process_video_user(video_path):
    keypoints_list = []

    if not os.path.exists(video_path):
        print("Error: Video file not found.")
        return keypoints_list

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print("Error: Could not open video.")
        return keypoints_list

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        result = pose.process(rgb_frame)

        if result.pose_landmarks:
            keypoints = []
            for landmark in result.pose_landmarks.landmark:
                keypoints.append({
                    'x': landmark.x,
                    'y': landmark.y,
                    'z': landmark.z,
                    'visibility': landmark.visibility
                })
            keypoints_list.append(keypoints)

    document = {
        'landmarks': keypoints_list
    }

    cap.release()
    cv2.destroyAllWindows()

    return keypoints_list

# 병렬로 비디오 다운로드 및 처리
def download_and_process(video):
    set_up_gpu()
    video_path = download_video(video.url, f'downloaded_{video.youtubeId}.mp4')
    keypoints = process_video(video.youtubeId, video_path)
    return {"youtubeId": video.youtubeId, "keypoints": keypoints}

def download_and_process_videos(videos):
    with ThreadPoolExecutor() as executor:
        future_to_video = {executor.submit(download_and_process, video): video for video in videos}
        results = []
        for future in as_completed(future_to_video):
            video = future_to_video[future]
            try:
                result = future.result()
                results.append(result)
            except Exception as exc:
                print(f'{video.url} generated an exception: {exc}')
    return results