import React from "react";
import styled from "styled-components";
import { Video } from "types/index";
import { InteractionButtons } from "features/videoDetail/InteractionButtons";
// import { CommentSection } from "features/videoDetail/CommentSection"; // 댓글 기능 주석처리

interface VideoPlayerProps {
  video: Video;
  isActive: boolean;
  // showComments: boolean; // 댓글 기능 주석처리
  // onToggleComments: () => void; // 댓글 기능 주석처리
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  video,
  // isActive,
  // showComments, // 댓글 기능 주석처리
  // onToggleComments, // 댓글 기능 주석처리
}) => {
  return (
    <VideoPlayerWrapper /*  $isActive={isActive} $showComments={showComments} */
    >
      <VideoContent>
        <VideoThumbnail src={video.src} alt={video.title} />
        <InteractionButtons
          likes={video.likes}
          // commentCount={video.comments.length}
          // onToggleComments={onToggleComments} // 댓글 기능 주석처리
        />
      </VideoContent>
      {/* <CommentSection show={showComments} userChallengeId={video.id} /> */}
      {/* 댓글 기능 주석처리 */}
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
  margin-bottom: 3vh;
  transition: transform 0.3s ease-in-out;
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

export default VideoPlayer;
