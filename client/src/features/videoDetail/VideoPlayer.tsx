import React from "react";
import styled from "styled-components";
import { Video } from "types/index";
import { InteractionButtons } from "features/videoDetail/InteractionButtons";
import { CommentSection } from "features/videoDetail/CommentSection";

interface VideoPlayerProps {
  video: Video;
  isActive: boolean;
  showComments: boolean;
  onToggleComments: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  isActive,
  showComments,
  onToggleComments,
}) => {
  return (
    <VideoPlayerWrapper $isActive={isActive} $showComments={showComments}>
      <VideoContent>
        <VideoThumbnail src={video.src} alt={video.title} />
        <InteractionButtons
          likes={video.likes}
          commentCount={video.comments.length}
          onToggleComments={onToggleComments}
        />
      </VideoContent>
      <CommentSection show={showComments} userChallengeId={video.id} />
    </VideoPlayerWrapper>
  );
};

const VideoPlayerWrapper = styled.div<{
  $isActive: boolean;
  $showComments: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  scroll-snap-align: start;
  height: 90vh;
  width: 100%;
  margin-bottom: 3vh;
  transition: transform 0.3s ease-in-out;
  transform: ${(props) =>
    props.$showComments ? "translateX(-20%)" : "translateX(0)"};
`;

const VideoContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const VideoThumbnail = styled.img`
  width: 24vw;
  height: 80vh;
  max-width: 100%;
  object-fit: cover;
  border-radius: 10px;
`;
