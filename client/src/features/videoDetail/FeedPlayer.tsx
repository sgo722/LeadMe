import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { FeedDetail } from "types/index";
import { InteractionButtons } from "features/videoDetail/InteractionButtons";
import { CommentSection } from "features/videoDetail/CommentSection";

interface VideoPlayerProps {
  video: FeedDetail;
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
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  return (
    <VideoPlayerWrapper $showComments={showComments}>
      <VideoContent>
        {videoUrl && (
          <VideoElement ref={videoRef} src={videoUrl} controls autoPlay loop />
        )}
        <InteractionButtons
          likes={video.likes}
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
