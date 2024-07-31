import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { Navigate, useNavigate } from "react-router-dom";
interface VideoPlayerProps {
  video: {
    videoId: string;
    snippet: {
      title: string;
      thumbnails: {
        high: {
          url: string;
        };
      };
    };
  };
  isActive: boolean;
  onIntersection: (videoId: string, isIntersecting: boolean) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isActive,
  onIntersection,
}) => {
  const [canEmbed, setCanEmbed] = useState(true);
  const videoRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nav = useNavigate();

  useEffect(() => {
    const currentVideoRef = videoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        onIntersection(video.videoId, entry.isIntersecting);
      },
      {
        threshold: 0.7,
      }
    );

    if (currentVideoRef) {
      observer.observe(currentVideoRef);
    }

    return () => {
      if (currentVideoRef) {
        observer.unobserve(currentVideoRef);
      }
    };
  }, [video.videoId, onIntersection]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && canEmbed) {
      if (isActive) {
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"playVideo","args":""}',
          "*"
        );
      } else {
        iframe.contentWindow?.postMessage(
          '{"event":"command","func":"pauseVideo","args":""}',
          "*"
        );
      }
    }
  }, [isActive, canEmbed]);

  const handleIframeError = () => {
    setCanEmbed(false);
  };

  const handlePracticeClick = () => {
    console.log("연습버튼 클릭!");
    nav(`/practice/${video.videoId}`);
  };

  return (
    <VideoPlayerWrapper ref={videoRef}>
      <ContentWrapper>
        <VideoContent>
          {canEmbed ? (
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${
                video.videoId
              }?enablejsapi=1&autoplay=${
                isActive ? "1" : "0"
              }&rel=0&modestbranding=1&controls=1`}
              title={video.snippet.title}
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onError={handleIframeError}
            />
          ) : (
            <ThumbnailImage
              src={video.snippet.thumbnails.high.url}
              alt={video.snippet.title}
            />
          )}
        </VideoContent>
        <PracticeButton onClick={handlePracticeClick}>
          <ButtonText>
            <span>챌린지 도전</span>
            <span>Go !</span>
          </ButtonText>
        </PracticeButton>
      </ContentWrapper>
    </VideoPlayerWrapper>
  );
};

const VideoPlayerWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  scroll-snap-align: start;
  height: 90vh;
  width: 100%;
  margin: 5vh 0;
`;

const ContentWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const VideoContent = styled.div`
  position: relative;
  width: 38.3vh;
  height: 68.2vh;
  display: flex;
  align-items: center;
  justify-content: center;

  iframe,
  img {
    width: 100%;
    height: 100%;
    border: none;
    border-radius: 10px;
    object-fit: cover;
  }
`;

const ThumbnailImage = styled.img`
  cursor: pointer;
`;

const PracticeButton = styled.button`
  position: absolute;
  bottom: 3px;
  right: -120px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 93px;
  height: 52px;
  color: #ee5050;
  border: none;
  padding: 20px 20px;
  cursor: pointer;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  transition: 0.3s ease;
  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: scale(1.05);
  }
`;

const ButtonText = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1.2;
  text-align: center;

  span:first-child {
    font-weight: 500;
    font-size: 10px;
  }

  span:last-child {
    font-size: 16px;
    font-weight: 700;
  }
`;
export default VideoPlayer;
