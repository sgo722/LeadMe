import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { axiosInstance } from "axiosInstance/apiClient";
import { useMutation } from "@tanstack/react-query";
import { useSetRecoilState } from "recoil";
import { IsShortsVisibleAtom, CurrentYoutubeIdAtom } from "stores/index";
import { CompletionAlertModal } from "components/CompletionAlertModal";

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
  challengeVideoIds: string[];
}

const postChallenge = async (data: Record<string, unknown>) => {
  const res = await axiosInstance.post("/api/v1/challenge", data);
  return res.data;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isActive,
  onIntersection,
  challengeVideoIds,
}) => {
  const [canEmbed, setCanEmbed] = useState(true);
  const videoRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const nav = useNavigate();
  const setIsWebcamVisible = useSetRecoilState(IsShortsVisibleAtom);
  const setCurrentYoutubeId = useSetRecoilState(CurrentYoutubeIdAtom);
  const [isCompletionAlertModalOpen, setIsCompletionAlertModalOpen] =
    useState<boolean>(false);
  const [showMessage, setShowMessage] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const mutation = useMutation({
    mutationFn: postChallenge,
    onMutate: () => {
      setIsCompletionAlertModalOpen(true);
      setIsWebcamVisible(true);
      setCurrentYoutubeId(video.videoId);
    },
    onSuccess: () => {
      console.log("MongoDB에 저장 성공");
      setIsWebcamVisible(false);
      setCurrentYoutubeId("");
      nav(`/practice/${video.videoId}`);
    },
    onError: (error) => {
      console.error("에러", error);
      setIsWebcamVisible(false);
      setIsCompletionAlertModalOpen(false);
      setCurrentYoutubeId("");
      nav("/home");
    },
  });

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

  const handleIframeError = () => {
    setCanEmbed(false);
  };

  const handlePracticeClick = () => {
    const challengeData = {
      youtubeId: video.videoId,
      url: `https://www.youtube.com/shorts/${video.videoId}`,
    };

    mutation.mutate(challengeData);
  };

  const handleCloseCompletionAlertModal = () => {
    setIsCompletionAlertModalOpen(false);
    nav("/home");
  };

  const handleSubClick = () => {
    setIsButtonDisabled(true);
    setShowMessage(true);
    setTimeout(() => {
      setShowMessage(false);
    }, 2000);
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
        {challengeVideoIds.includes(video.videoId) ? (
          <PracticeButton onClick={handlePracticeClick}>
            <ButtonText>
              <span>챌린지 도전</span>
              <span>Go !</span>
            </ButtonText>
          </PracticeButton>
        ) : (
          <SubButton
            onClick={handleSubClick}
            disabled={isButtonDisabled}
            $isDisabled={isButtonDisabled}
          >
            <SubText>Challenge</SubText>
            <SubText>등록 신청</SubText>
          </SubButton>
        )}
        {showMessage && (
          <Message>빠른 시일 내로 영상이 준비 될 거에요!</Message>
        )}
      </ContentWrapper>
      <CompletionAlertModal
        isOpen={isCompletionAlertModalOpen}
        onClose={handleCloseCompletionAlertModal}
      />
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

const SubButton = styled.button<{ $isDisabled: boolean }>`
  position: absolute;
  bottom: 3px;
  right: -120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 93px;
  height: 52px;
  color: ${({ $isDisabled }) => ($isDisabled ? "#a0a0a0" : "#c0c0c0")};
  border: none;
  padding: 20px 20px;
  cursor: ${({ $isDisabled }) => ($isDisabled ? "not-allowed" : "pointer")};
  border-radius: 8px;
  background: ${({ $isDisabled }) =>
    $isDisabled ? "rgba(241, 241, 241, 0.8)" : "rgba(255, 255, 255, 0.8)"};
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  transition: 0.3s ease;

  &:hover {
    background: ${({ $isDisabled }) =>
      $isDisabled ? "rgba(241, 241, 241, 0.8)" : "rgba(255, 255, 255, 1)"};
    transform: ${({ $isDisabled }) => ($isDisabled ? "none" : "scale(1.05)")};
  }
`;

const SubText = styled.div`
  font-family: "Noto Sans KR", sans-serif;
  font-size: 12px;

  &:first-child {
    color: #686868;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 3px;
  }
`;

const Message = styled.div`
  position: absolute;
  background-color: rgba(255, 255, 255, 1);
  color: #303030;
  padding: 10px 20px;
  border-radius: 8px;
  font-family: "Noto Sans KR", sans-serif;
  font-size: 13px;
  animation: fadeOut 2s forwards;

  @keyframes fadeOut {
    0% {
      opacity: 1;
    }
    90% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
`;
