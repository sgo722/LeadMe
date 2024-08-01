import { useEffect, useRef, useState } from "react";
import { useRecoilValue } from "recoil";
import { IsWebcamVisibleAtom } from "stores/index";
import styled from "styled-components";
import { FaExpandAlt, FaCompressAlt } from "react-icons/fa";

type WebcamSize = "default" | "maximized";

export const FloatingWebcam: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isWebcamVisible = useRecoilValue(IsWebcamVisibleAtom);
  const [webcamSize, setWebcamSize] = useState<WebcamSize>("default");

  useEffect(() => {
    const enableCam = async () => {
      if (!isWebcamVisible) return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("웹캠 활성화 실패:", error);
      }
    };

    enableCam();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
      // 웹캠 닫힐 때 크기를 기본값으로 리셋
      setWebcamSize("default");
    };
  }, [isWebcamVisible]);

  if (!isWebcamVisible) return null;

  // 웹캠 크기 토글 함수
  const toggleWebcamSize = () => {
    setWebcamSize((prev) => (prev == "default" ? "maximized" : "default"));
  };

  return (
    <WebcamContainer $webcamSize={webcamSize}>
      <WebcamContent $webcamSize={webcamSize}>
        <Video ref={videoRef} autoPlay playsInline />
        <AnalyzingText>영상 준비중</AnalyzingText>
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
`;

const WebcamContent = styled.div<{ $webcamSize: WebcamSize }>`
  position: relative;
  width: ${(props) => (props.$webcamSize === "maximized" ? "330px" : "200px")};
  height: ${(props) => (props.$webcamSize === "maximized" ? "586px" : "355px")};
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  pointer-events: auto;
  ${(props) =>
    props.$webcamSize === "default" &&
    `
    position: absolute;
    bottom: 20px;
    right: 20px;
  `}
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scaleX(-1);
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
