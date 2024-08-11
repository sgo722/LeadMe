import React from "react";
import styled from "styled-components";
import { Video } from "types/index";
import { InteractionButtons } from "features/videoDetail/InteractionButtons";
import { CommentSection } from "features/videoDetail/CommentSection";

interface VideoPlayerProps {
  video: Video;
  showComments: boolean;
  onToggleComments: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  showComments,
  onToggleComments,
}) => {
  return (
    <VideoPlayerWrapper $showComments={showComments}>
      <VideoContent>
        <VideoThumbnail src={video.src} alt={video.title} />
        <InteractionButtons
          likes={video.likes}
          commentCount={video.comments.length}
          onToggleComments={onToggleComments}
        />
      </VideoContent>
      <CommentSection show={showComments} comments={video.comments} />
    </VideoPlayerWrapper>
  );
};

const VideoPlayerWrapper = styled.div<{
  $showComments: boolean;
}>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  scroll-snap-align: start;
  height: 85vh;
  width: 100%;
  margin-bottom: 15vh;
  transition: transform 0.3s ease-in-out;
  transform: ${(props) =>
    props.$showComments ? "translateX(-20%)" : "translateX(0)"};
  scroll-snap-align: start;
`;

const VideoThumbnail = styled.img`
  width: auto;
  height: 100%;
  max-height: 100%;
  object-fit: cover;
  aspect-ratio: 9 / 16;
  border-radius: 10px;
`;

const VideoContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

export default VideoPlayer;
