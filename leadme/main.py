from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
import shutil
import os
import uuid
import config
import ray
import cv2
import time
import logging
# from pathlib import Path
import subprocess

import asyncio
from moviepy.editor import VideoFileClip , AudioFileClip, CompositeAudioClip
from video_processor import download_video, process_video, process_video_user


# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

# print(Path(__file__).resolve())

app = FastAPI()

# Ray 초기화
ray.init()

class Video(BaseModel):
    url : str
    youtubeId : str

UPLOAD_DIRECTORY = "."
# TEMP_DIRECTORY = "/home/ubuntu/python/video/temporary"
# TEMP_DIRECTORY = "video/temporary"
# PERMANENT_DIRECTORY_USER = "video/user"
# PERMANENT_DIRECTORY_CHALLENGE = "video/challenge"
# PERMANENT_DIRECTORY_CHALLENGE_AUDIO = "video/challenge/audio"

TEMP_DIRECTORY = "/home/ubuntu/python/video/temporary"
PERMANENT_DIRECTORY_USER = "/home/ubuntu/python/video/user"
PERMANENT_DIRECTORY_CHALLENGE = "/home/ubuntu/python/video/challenge"
PERMANENT_DIRECTORY_CHALLENGE_AUDIO =  "/home/ubuntu/python/video/challenge/audio"


## 서비스 로직 호출 부분을 Ray로 병렬 처리한다.
@ray.remote
def ray_process_video(youtubeId, video_path):
    return process_video(youtubeId, video_path)

@ray.remote
def ray_process_video_user(video_path):
    return process_video_user(video_path)

@app.get("/")
async def read_root():
    return "This is root path from MyAPI"

@app.post("/videoUrl")
async def saveVideoData(video: Video):
    start_time = time.time()
    video_path = await asyncio.to_thread(download_video, video.url, video.youtubeId)
    
    # 비디오 처리 실행 및 결과 대기
    
    keypoints = await asyncio.to_thread(lambda: ray.get(ray_process_video.remote(video.youtubeId, video_path)))
    
    total_time = time.time() - start_time
    logger.info(f"videoUrl API - YoutubeID: {video.youtubeId}, Total Time: {total_time:.4f} seconds")
    
    return {"youtubeId": video.youtubeId, "keypoints": keypoints}

@app.post("/upload/userFile")
async def saveVideoDataByUserFile(
    videoFile: UploadFile = File(...),
    youtubeId: str = Form(...)
):
    start_time = time.time()
    unique_id = str(uuid.uuid4())

    os.makedirs(TEMP_DIRECTORY, exist_ok=True)
    original_video_path = os.path.join(TEMP_DIRECTORY, f"{unique_id}_{videoFile.filename}")
    flipped_temp_video_path = os.path.join(TEMP_DIRECTORY, f"{unique_id}_flipped_temp.avi")
    final_video_path = os.path.join(TEMP_DIRECTORY, f"{unique_id}.mp4")
    youtube_video_path = os.path.join(PERMANENT_DIRECTORY_CHALLENGE, f"{youtubeId}.mp4")
    youtube_audio_path = os.path.join(PERMANENT_DIRECTORY_CHALLENGE_AUDIO, f"{youtubeId}.mp3")
    
    download_start = time.time()
    with open(original_video_path, "wb") as buffer:
        shutil.copyfileobj(videoFile.file, buffer)
    download_end = time.time()

    try:
        flip_start = time.time()
        cap = cv2.VideoCapture(original_video_path)
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        out = cv2.VideoWriter(flipped_temp_video_path, fourcc, cap.get(cv2.CAP_PROP_FPS), 
                            (int(cap.get(cv2.CAP_PROP_FRAME_WIDTH)), int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))))

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            flipped_frame = cv2.flip(frame, 1)  # 수평으로 뒤집기
            out.write(flipped_frame)

        cap.release()
        out.release()
        flip_end = time.time()

        convert_start = time.time()
        clip = VideoFileClip(flipped_temp_video_path)
        clip.write_videofile(final_video_path, codec="libx264")

        convert_end = time.time()

        extract_audio_from_video(youtube_video_path, youtube_audio_path)
        # replace_audio_in_video(final_video_path, youtube_audio_path, final_video_path)
        combine_audio_video(youtube_video_path, final_video_path,final_video_path)

    except Exception as e:
        return {"error": str(e)}
    
    os.remove(original_video_path)
    os.remove(flipped_temp_video_path)
    
    keypoints = await asyncio.to_thread(lambda: ray.get(ray_process_video_user.remote(final_video_path)))

    total_time = time.time() - start_time
    logger.info(f"userFile API - UUID: {unique_id}, Total Time: {total_time:.4f} seconds")

    return {"uuid": unique_id, "keypoints": keypoints}

def extract_audio_from_video(video_file_path, audio_file_path):
    try:
        video = VideoFileClip(video_file_path)
        video.audio.write_audiofile(audio_file_path)
    except Exception as e:
        print(f"Audio extraction error: {str(e)}")
        raise

def replace_audio_in_video(video_file_path, new_audio_file_path, output_file_path, volume=1.0):
    try:
        video = VideoFileClip(video_file_path)
        new_audio = AudioFileClip(new_audio_file_path)
        new_audio = new_audio.volumex(volume)

        if new_audio.duration > video.duration:
            new_audio = new_audio.subclip(0, video.duration)

        video = video.set_audio(new_audio)
        video.write_videofile(output_file_path, codec='libx264', audio_codec='aac')
    except Exception as e:
        print(f"Audio replacement error: {str(e)}")
        raise


def combine_audio_video(audio_source_path, video_source_path, output_path):
    """
    오디오 소스 파일의 오디오와 비디오 소스 파일의 비디오를 결합하여 새로운 비디오 파일을 생성합니다.

    :param audio_source_path: 오디오 소스 파일 경로 (MP4 파일)
    :param video_source_path: 비디오 소스 파일 경로 (MP4 파일)
    :param output_path: 출력 비디오 파일 경로
    """
    # 오디오 소스 파일에서 오디오를 추출
    audio_clip = VideoFileClip(audio_source_path).audio

    # 비디오 소스 파일을 로드
    video_clip = VideoFileClip(video_source_path)

    # 비디오 길이에 맞게 오디오를 자르거나 반복
    audio_clip = audio_clip.set_duration(video_clip.duration)

    # 새로운 오디오를 비디오에 설정
    final_video = video_clip.set_audio(audio_clip)

    # 최종 비디오 파일을 저장
    final_video.write_videofile(output_path, codec='libx264', audio_codec='aac')