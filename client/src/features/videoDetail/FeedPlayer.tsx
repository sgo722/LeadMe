import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FeedDetail } from "types/index";
import { InteractionButtons } from "features/videoDetail/InteractionButtons";
import { axiosInstance } from "axiosInstance/apiClient";
import { getJWTHeader } from "axiosInstance/apiClient";

interface VideoPlayerProps {
  video: FeedDetail;
  userChallengeId: number;
  isActive: boolean;
}

const FeedPlayer: React.FC<VideoPlayerProps> = ({
  video,
  userChallengeId,
  isActive,
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(!isActive);
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likes, setLikes] = useState(video.likes);
  const videoRef = useRef<HTMLVideoElement>(null);

  const fetchSessionUserData = () => {
    const userData = sessionStorage.getItem("user_profile");
    return userData ? JSON.parse(userData) : null;
  };

  const sessionUser = fetchSessionUserData();

  useEffect(() => {
    if (video.video) {
      const base64String = video.video;
      const videoBlob = fetch(`data:video/mp4;base64,${base64String}`).then(
        (res) => res.blob()
      );
      videoBlob.then((blob) => {
        const videoUrl = URL.createObjectURL(blob);
        setVideoUrl(videoUrl);
      });
    }
  }, [video.video]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isActive;
      setIsMuted(!isActive);
    }
  }, [isActive]);

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const toggleLike = async () => {
    try {
      if (isLiked) {
        await axiosInstance.delete("/api/v1/userChallenge/like", {
          headers: getJWTHeader(),
          data: { userChallengeId },
        });
        setLikes(likes - 1);
      } else {
        await axiosInstance.post(
          "/api/v1/userChallenge/like",
          { userChallengeId },
          { headers: getJWTHeader() }
        );
        setLikes(likes + 1);
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error("좋아요 토글 중 오류 발생:", error);
    }
  };

  const deleteVideo = async () => {
    try {
      await axiosInstance.delete(`/api/v1/userChallenge/${userChallengeId}`, {
        headers: getJWTHeader(),
      });
      // 삭제 후 필요한 추가 동작 (예: 피드에서 해당 비디오 제거 등)
    } catch (error) {
      console.error("영상 삭제 중 오류 발생:", error);
    }
  };

  return (
    <VideoPlayerWrapper>
      <VideoContent>
        {videoUrl && (
          <VideoElement
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay
            loop
            muted={isMuted}
            playsInline
          />
        )}
        <InteractionButtons
          likes={likes}
          isMuted={isMuted}
          isLiked={isLiked}
          isOwner={sessionUser?.id === video.userId} // 소유자 여부 확인
          onToggleSound={toggleSound}
          onToggleLike={toggleLike}
          onDelete={deleteVideo} // 삭제 함수 전달
        />
      </VideoContent>
    </VideoPlayerWrapper>
  );
};

const VideoPlayerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  scroll-snap-align: start;
  height: 85vh;
  width: 100%;
  padding-bottom: 3vh;
  scroll-snap-align: center;
`;

const VideoElement = styled.video`
  width: 300px;
  height: 100%;
  max-height: 100%;
  object-fit: cover;
  aspect-ratio: 9 / 16;
  border-radius: 8px;
`;

const VideoContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export default FeedPlayer;
