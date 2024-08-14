import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FeedDetail } from "types/index";
import { InteractionButtons } from "features/videoDetail/InteractionButtons";
// import { CommentSection } from "features/videoDetail/CommentSection"; // 댓글 기능 주석 처리

interface VideoPlayerProps {
  video: FeedDetail;
  // showComments: boolean; // 댓글 기능 주석 처리
  // onToggleComments: () => void; // 댓글 기능 주석 처리
  userChallengeId: number;
}

const FeedPlayer: React.FC<VideoPlayerProps> = ({
  video,
  // showComments, // 댓글 기능 주석 처리
  // onToggleComments, // 댓글 기능 주석 처리
  userChallengeId,
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
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

  return (
    <VideoPlayerWrapper /* $showComments={showComments} */>
      <VideoContent>
        {videoUrl && (
          <VideoElement ref={videoRef} src={videoUrl} controls autoPlay loop />
        )}
        <InteractionButtons
          likes={video.likes}
          // commentCount={0} // 댓글 기능 주석 처리
          // onToggleComments={onToggleComments} // 댓글 기능 주석 처리
        />
      </VideoContent>
      {/* <CommentSection show={showComments} userChallengeId={userChallengeId} /> */}
      {/* 댓글 기능 주석 처리 */}
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
