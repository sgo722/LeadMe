import { useState, useEffect, useRef } from "react";
import { useRecoilValue } from "recoil";
import { IsShortsVisibleAtom, CurrentYoutubeIdAtom } from "stores/index";
import styled from "styled-components";
import { FaExpandAlt, FaCompressAlt } from "react-icons/fa";
import YouTube from "react-youtube";

type ShortsSize = "default" | "maximized";

export const ShortsModal: React.FC = () => {
  const isShortsVisible = useRecoilValue(IsShortsVisibleAtom);
  const youtubeId = useRecoilValue(CurrentYoutubeIdAtom);
  const [shortsSize, setShortsSize] = useState<ShortsSize>("default");
  const shortsContentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    //이거 그냥 보였다안보였다 하는거라 언마운트될때 클린업함수에 써봤자 shortsSize 초기화 못함
    // Recoil 상태에 따라 초기화 하는걸로
    if (!isShortsVisible) {
      setShortsSize("default");
    }
  }, [isShortsVisible]);

  // 쇼츠가 최대화 됐을 때 영상 외의 영역 클릭하면 최소화
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        shortsContentRef.current &&
        // 클릭된 요소가 shorts 영상 내부에 없을때만 실행
        !shortsContentRef.current.contains(event.target as Node) &&
        shortsSize === "maximized"
      ) {
        setShortsSize("default");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // 메모리 누수 방지
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [shortsSize]);

  // 쇼츠 영상 크기 최대화 시키는 함수
  const maximizeShorts = () => {
    setShortsSize("maximized");
  };

  // 쇼츠 영상 크기 최소화 시키는 함수
  const minimizeShorts = () => {
    setShortsSize("default");
  };

  // const toggleShortsSize = () => {
  //   setShortsSize((prev) => (prev === "default" ? "maximized" : "default"));
  // };

  const videoDimensions = {
    default: { width: "200px", height: "355px" },
    maximized: { width: "330px", height: "586px" },
  };

  if (!isShortsVisible) return null;

  return (
    <ShortsContainer $shortsSize={shortsSize}>
      <ShortsContent $shortsSize={shortsSize} ref={shortsContentRef}>
        {youtubeId ? (
          <YouTube
            videoId={youtubeId}
            opts={{
              width: videoDimensions[shortsSize].width,
              height: videoDimensions[shortsSize].height,
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
        <SizeButton
          onClick={shortsSize === "default" ? maximizeShorts : minimizeShorts}
        >
          {shortsSize === "default" ? <FaExpandAlt /> : <FaCompressAlt />}
        </SizeButton>
      </ShortsContent>
    </ShortsContainer>
  );
};

const ShortsContainer = styled.div<{ $shortsSize: ShortsSize }>`
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 1000;
  background-color: ${(props) =>
    props.$shortsSize === "maximized" ? "rgba(0, 0, 0, 0.5)" : "transparent"};
  transition: background-color 0.3s ease;
`;

const ShortsContent = styled.div<{ $shortsSize: ShortsSize }>`
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  pointer-events: auto;
  ${(props) =>
    props.$shortsSize === "default" &&
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
