import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FeedDetail } from "types/index";
import { InteractionButtons } from "features/videoDetail/InteractionButtons";

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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log(userChallengeId);

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
            playsInline // 모바일에서 인라인 재생을 위해
          />
        )}
        <InteractionButtons
          likes={video.likes}
          isMuted={isMuted}
          onToggleSound={toggleSound}
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
