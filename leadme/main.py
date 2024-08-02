from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
import shutil
import os
import uuid
import config
import ray
import time
import logging
import asyncio

from video_processor import download_video, process_video, process_video_user

# 로깅 설정
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI()

# Ray 초기화
ray.init()

class Video(BaseModel):
    url : str
    youtubeId : str

UPLOAD_DIRECTORY = "."
TEMP_DIRECTORY = "/home/ubuntu/python/video/temporary"
PERMANENT_DIRECTORY_USER = "/home/ubuntu/python/video/user"
PERMANENT_DIRECTORY_CHALLENGE = "/home/ubuntu/python/video/challenge"

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
    video_path = await asyncio.to_thread(download_video, video.url, 'downloaded_video.mp4')

    # 비디오 처리 실행 및 결과 대기
    keypoints = await asyncio.to_thread(lambda: ray.get(ray_process_video.remote(video.youtubeId, video_path)))

    total_time = time.time() - start_time
    logger.info(f"videoUrl API - YoutubeID: {video.youtubeId}, Total Time: {total_time:.4f} seconds")

    return {"youtubeId": video.youtubeId, "keypoints": keypoints}

@app.post("/upload/userFile")
async def saveVideDataByUserFile(videoFile: UploadFile = File(...)):
    start_time = time.time()
    unique_id = str(uuid.uuid4())

    os.makedirs(TEMP_DIRECTORY, exist_ok=True)
    temp_video_path = os.path.join(TEMP_DIRECTORY, f"{unique_id}.mp4")

    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(videoFile.file, buffer)

    # 비디오 처리 실행 및 결과 대기
    keypoints = await asyncio.to_thread(lambda: ray.get(ray_process_video_user.remote(temp_video_path)))

    total_time = time.time() - start_time
    logger.info(f"userFile API - UUID: {unique_id}, Total Time: {total_time:.4f} seconds")

    return {"uuid": unique_id, "keypoints": keypoints}