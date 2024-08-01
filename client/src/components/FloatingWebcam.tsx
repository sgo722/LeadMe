import { useState, useEffect } from "react";
import { useRecoilValue } from "recoil";
import { IsWebcamVisibleAtom, CurrentYoutubeIdAtom } from "stores/index";
import styled from "styled-components";
import { FaExpandAlt, FaCompressAlt } from "react-icons/fa";
import YouTube from "react-youtube";

type WebcamSize = "default" | "maximized";

export const FloatingWebcam: React.FC = () => {
  const isWebcamVisible = useRecoilValue(IsWebcamVisibleAtom);
  const youtubeId = useRecoilValue(CurrentYoutubeIdAtom);
  const [webcamSize, setWebcamSize] = useState<WebcamSize>("default");

  useEffect(() => {
    //이거 그냥 보였다안보였다 하는거라 언마운트될때 클린업함수에 써봤자 webcamSize 초기화 못함
    // Recoil 상태에 따라 초기화 하는걸로
    if (!isWebcamVisible) {
      setWebcamSize("default");
    }
  }, [isWebcamVisible]);

  const toggleWebcamSize = () => {
    setWebcamSize((prev) => (prev === "default" ? "maximized" : "default"));
  };

  const videoDimensions = {
    default: { width: "200px", height: "355px" },
    maximized: { width: "330px", height: "586px" },
  };

  if (!isWebcamVisible) return null;

  return (
    <WebcamContainer $webcamSize={webcamSize}>
      <WebcamContent $webcamSize={webcamSize}>
        {youtubeId ? (
          <YouTube
            videoId={youtubeId}
            opts={{
              width: videoDimensions[webcamSize].width,
              height: videoDimensions[webcamSize].height,
              playerVars: {
                autoplay: 1,
                controls: 0,
                modestbranding: 1,
              },
            }}
          />
        ) : (
          <AnalyzingText>영상 준비중</AnalyzingText>
        )}
        <SizeButton onClick={toggleWebcamSize}>
          {webcamSize === "default" ? <FaExpandAlt /> : <FaCompressAlt />}
        </SizeButton>
      </WebcamContent>
    </WebcamContainer>
  );
};

const WebcamContainer = styled.div<{ $webcamSize: WebcamSize }>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1000;
  background-color: ${(props) =>
    props.$webcamSize === "maximized" ? "rgba(0, 0, 0, 0.5)" : "transparent"};
  transition: background-color 0.3s ease;
`;

const WebcamContent = styled.div<{ $webcamSize: WebcamSize }>`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  pointer-events: auto;
  ${(props) =>
    props.$webcamSize === "default" &&
    `
    position: absolute;
    bottom: 40px;
    right: 40px;
  `}
`;

const AnalyzingText = styled.div`
  position: absolute;
  bottom: 10px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px;
`;

const SizeButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: white;
  font-size: 14px;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;
