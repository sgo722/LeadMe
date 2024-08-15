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
      console.log("토글 전 상태: ", { isLiked, userChallengeId }); // 현재 상태 확인

      if (isLiked) {
        // 좋아요 취소 API 요청
        await axiosInstance.delete("/api/v1/commentLike", {
          headers: getJWTHeader(),
          data: { userChallengeId }, // 요청 데이터로 userChallengeId 전송
        });
        console.log("좋아요 취소 요청:", { userChallengeId });
        setLikes(likes - 1); // 좋아요 수 감소
      } else {
        // 좋아요 추가 API 요청
        await axiosInstance.post(
          "/api/v1/commentLike",
          { userChallengeId },
          { headers: getJWTHeader() }
        );
        console.log("좋아요 추가 요청:", { userChallengeId });
        setLikes(likes + 1); // 좋아요 수 증가
      }

      setIsLiked(!isLiked); // 좋아요 여부 토글
      console.log("토글 후 상태: ", { isLiked, likes }); // 토글 후 상태 확인
    } catch (error) {
      console.error("좋아요 토글 중 오류 발생:", error);
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
          onToggleSound={toggleSound}
          onToggleLike={toggleLike}
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
