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

const FeedPlayer: React.FC<VideoPlayerProps> = ({
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
  padding-bottom: 3vh;
  scroll-snap-align: center;
`;
const VideoThumbnail = styled.img`
  width: auto;
  height: 100%; // 부모의 높이에 맞게 설정
  max-height: 100%;
  object-fit: cover;
  aspect-ratio: 9 / 16; // 9:16 비율 유지
  border-radius: 14px;
`;
const VideoContent = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;
export default FeedPlayer;
