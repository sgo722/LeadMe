from fastapi import FastAPI, File, UploadFile, Form
from pydantic import BaseModel
import shutil
import os
import uuid
from video_processor import download_video, process_video, process_video_user

app = FastAPI()

class Video(BaseModel):
    url : str
    youtubeId : str

UPLOAD_DIRECTORY = "."
TEMP_DIRECTORY = "/home/ubuntu/python/video/temporary"  # 임시 저장 디렉토리 경로
PERMANENT_DIRECTORY_USER = "/home/ubuntu/python/video/user"  # 영구 저장 디렉토리 경로
PERMANENT_DIRECTORY_CHALLENGE = "/home/ubuntu/python/video/challenge"  # 영구 저장 디렉토리 경로

@app.get("/")
async def read_root():
    return "This is root path from MyAPI"

@app.post("/videoUrl")
async def saveVideoData(video: Video):

    
    # 비디오 다운로드 및 처리
    video_path = download_video(video.url, 'downloaded_video.mp4')
    print("비디오 경로 : " + video_path)
    keypoints = process_video(video.youtubeId, video_path)
    print(f"Video processing successful for YouTube ID: {video.youtubeId}")
    return {"youtubeId": video.youtubeId, "keypoints": keypoints}

    # # 비디오 다운로드 및 처리
    # video_path = download_video(video.url, 'downloaded_video.mp4')
    # keypoints = process_video(video.youtubeId, video_path)
    # return {"youtubeId": video.youtubeId, "keypoints": keypoints}


@app.post("/upload/userFile")
async def saveVideDataByUserFile(videoFile: UploadFile = File(...)):
    # 고유한 UUID 생성
    unique_id = str(uuid.uuid4())

    os.makedirs(TEMP_DIRECTORY, exist_ok=True)
    # 임시 디렉토리에 파일 저장
    temp_video_path = os.path.join(TEMP_DIRECTORY, f"{unique_id}.mp4")

    with open(temp_video_path, "wb") as buffer:
        shutil.copyfileobj(videoFile.file, buffer)

    # 키포인트 추출 등 필요한 처리 수행
    keypoints = process_video_user(temp_video_path)

    return {"keypoints": keypoints, "uuid": unique_id}