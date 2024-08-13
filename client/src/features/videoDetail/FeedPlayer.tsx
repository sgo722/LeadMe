import React from "react";
import styled from "styled-components";
import { Feed } from "types/index";
import { InteractionButtons } from "features/videoDetail/InteractionButtons";
import { CommentSection } from "features/videoDetail/CommentSection";

interface VideoPlayerProps {
  video: Feed;
  showComments: boolean;
  onToggleComments: () => void;
  userChallengeId: number;
}

const FeedPlayer: React.FC<VideoPlayerProps> = ({
  video,
  showComments,
  onToggleComments,
  userChallengeId,
}) => {
  return (
    <VideoPlayerWrapper $showComments={showComments}>
      <VideoContent>
        <VideoThumbnail src={video.thumbnail} alt={video.title} />
        <InteractionButtons
          likes={1000} // 더미 데이터
          commentCount={0}
          onToggleComments={onToggleComments}
        />
      </VideoContent>
      <CommentSection show={showComments} userChallengeId={userChallengeId} />
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
