import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { FeedDetail } from "types/index";
import { InteractionButtons } from "features/videoDetail/InteractionButtons";
import { axiosInstance } from "axiosInstance/apiClient";
import { getJWTHeader } from "axiosInstance/apiClient";

interface VideoPlayerProps {
  video: FeedDetail;
  userChallengeId: number;
  isActive: boolean;
  onVideoDeleted: () => void;
}

const FeedPlayer: React.FC<VideoPlayerProps> = ({
  video,
  userChallengeId,
  isActive,
  onVideoDeleted,
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(!isActive);
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likes, setLikes] = useState(video.likes);
  const [isDeleting, setIsDeleting] = useState(false);
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
      await axiosInstance.post(
        `/api/v1/userChallenge/like/${userChallengeId}`,
        {},
        { headers: getJWTHeader() }
      );
      if (isLiked) {
        setLikes(likes - 1);
      } else {
        setLikes(likes + 1);
      }

      setIsLiked(!isLiked);
    } catch (error) {
      console.error("좋아요 토글 중 오류 발생:", error);
    }
  };

  const deleteVideo = async () => {
    setIsDeleting(true);
    setTimeout(async () => {
      try {
        await axiosInstance.delete(`/api/v1/userChallenge/${userChallengeId}`, {
          headers: getJWTHeader(),
        });
        onVideoDeleted();
      } catch (error) {
        console.error("영상 삭제 중 오류 발생:", error);
      }
    }, 500);
  };

  return (
    <VideoPlayerWrapper $isDeleting={isDeleting}>
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
          isOwner={sessionUser?.id === video.userId}
          onToggleSound={toggleSound}
          onToggleLike={toggleLike}
          onDelete={deleteVideo}
        />
      </VideoContent>
    </VideoPlayerWrapper>
  );
};

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

const VideoPlayerWrapper = styled.div<{ $isDeleting: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  scroll-snap-align: start;
  height: 85vh;
  width: 100%;
  padding-bottom: 3vh;
  scroll-snap-align: center;
  animation: ${({ $isDeleting }) => $isDeleting && fadeOut} 0.5s ease-out;
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
