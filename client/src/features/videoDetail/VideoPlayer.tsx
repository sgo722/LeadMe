// import React, { useState } from "react";
// import styled from "styled-components";
// import { Video } from "types/index";
// import { InteractionButtons } from "features/videoDetail/InteractionButtons";

// interface VideoPlayerProps {
//   video: Video;
//   isActive: boolean;
// }

// export const VideoPlayer: React.FC<VideoPlayerProps> = ({
//   video,
//   isActive,
// }) => {
//   const [isMuted, setIsMuted] = useState(true);

//   const toggleSound = () => {
//     setIsMuted(!isMuted);
//   };

//   return (
//     <VideoPlayerWrapper $isActive={isActive}>
//       <VideoContent>
//         <VideoThumbnail src={video.src} alt={video.title} />
//         <InteractionButtons
//           likes={video.likes}
//           isMuted={isMuted}
//           isLiked
//           onToggleLike={toggle}
//           onToggleSound={toggleSound}
//         />
//       </VideoContent>
//     </VideoPlayerWrapper>
//   );
// };

// const VideoPlayerWrapper = styled.div<{ $isActive: boolean }>`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   position: relative;
//   scroll-snap-align: start;
//   height: 90vh;
//   width: 100%;
//   margin-bottom: 3vh;
//   transition: transform 0.3s ease-in-out;
// `;

// const VideoContent = styled.div`
//   position: relative;
//   display: flex;
//   align-items: center;
// `;

// const VideoThumbnail = styled.img`
//   width: 24vw;
//   height: 80vh;
//   max-width: 100%;
//   object-fit: cover;
//   border-radius: 10px;
// `;

// export default VideoPlayer;
