import Header from "components/Header";
import styled from "styled-components";
import YouTube from "react-youtube";
import { FaChevronLeft } from "react-icons/fa6";
import { FaExchangeAlt, FaPlayCircle } from "react-icons/fa";
import {
  PoseLandmarker,
  FilesetResolver,
  NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import { useState, useRef, useEffect } from "react";

interface PracticeProps {
  videoId?: string;
}

export const Practice: React.FC<PracticeProps> = ({ videoId }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<any>(null);
  const [webcamRunning, setWebcamRunning] = useState(false);

  useEffect(() => {
    const initializePoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );

      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numPoses: 2,
      });
      setPoseLandmarker(poseLandmarker);
    };

    initializePoseLandmarker();
  }, []);

  useEffect(() => {
    const enableCam = async () => {
      if (!poseLandmarker) {
        console.log("poseLandmaker가 아직 생성되지 않음");
        return;
      }

      try {
        const constraints = {
          video: {
            width: { ideal: 309 },
            height: { ideal: 550 },
            aspectRatio: 9 / 16,
          },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setWebcamRunning(true);
        }
      } catch (error) {
        console.error("웹캠 활성화 실패:", error);
      }
    };

    if (poseLandmarker) {
      enableCam();
    }
  }, [poseLandmarker]);

  const drawPose = (ctx: CanvasRenderingContext2D, pose: number[][]) => {
    const canvasWidth = ctx.canvas.width;

    // 캔버스 컨텍스트를 좌우 반전
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvasWidth, 0);

    const connections = [
      [11, 12], // 어깨
      [11, 13],
      [13, 15], // 왼팔
      [12, 14],
      [14, 16], // 오른팔
      [11, 23],
      [12, 24], // 몸통
      [23, 24], // 엉덩이
      [23, 25],
      [25, 27],
      [27, 29],
      [29, 31], // 왼쪽 다리
      [24, 26],
      [26, 28],
      [28, 30],
      [30, 32], // 오른쪽 다리
    ];

    // 연결선 그리기
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    connections.forEach(([i, j]) => {
      const [x1, y1] = pose[i];
      const [x2, y2] = pose[j];
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    });

    // 키포인트 그리기
    ctx.fillStyle = "red";
    pose.forEach(([x, y], i) => {
      if (i > 10) {
        // 얼굴 부분 제외
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // 캔버스 컨텍스트 복원
    ctx.restore();
  };

  const predictWebcam = () => {
    if (!poseLandmarker || !videoRef.current || !canvasRef.current) return;

    const canvasCtx = canvasRef.current.getContext("2d");
    if (!canvasCtx) return;

    const detectAndDraw = async () => {
      const results = await poseLandmarker.detectForVideo(
        videoRef.current,
        performance.now()
      );
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current!.width,
        canvasRef.current!.height
      );

      if (results.landmarks) {
        results.landmarks.forEach((pose: NormalizedLandmark[]) => {
          const scaledPose = pose.map(({ x, y }) => [
            x * canvasRef.current!.width,
            y * canvasRef.current!.height,
          ]);
          drawPose(canvasCtx, scaledPose);
        });
      }

      if (webcamRunning) {
        requestAnimationFrame(detectAndDraw);
      }
    };

    detectAndDraw();
  };

  useEffect(() => {
    if (webcamRunning && videoRef.current) {
      videoRef.current.addEventListener("loadeddata", predictWebcam);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("loadeddata", predictWebcam);
      }
    };
  }, [webcamRunning]);

  return (
    <>
      <Header stickyOnly />
      <Container>
        <BackButton>
          <FaChevronLeft />
          &nbsp;목록
        </BackButton>
        <Content>
          <VideoWrapper>
            <VideoContainer>
              <YouTubeWrapper>
                <YouTube
                  videoId={videoId || "OvJn-xojCXE"}
                  opts={{
                    width: "309",
                    height: "550",
                    playerVars: {
                      autoplay: 0,
                      rel: 0,
                    },
                  }}
                />
              </YouTubeWrapper>
              <Buttons>
                <button>
                  <FaPlayCircle style={{ fontSize: "20px" }} />
                  재생속도
                </button>
                <button>
                  <FaExchangeAlt style={{ fontSize: "20px" }} />
                  좌우반전
                </button>
                <button>영상변경</button>
              </Buttons>
            </VideoContainer>
          </VideoWrapper>
          <VideoWrapper>
            <VideoContainer>
              <WebcamWrapper>
                <Webcam>
                  <Video ref={videoRef} autoPlay playsInline />
                  <Canvas ref={canvasRef} width={309} height={550} />
                </Webcam>
              </WebcamWrapper>
              <Buttons>
                <button>
                  <FaPlayCircle style={{ fontSize: "20px" }} />
                  재생속도
                </button>
                <button>
                  <FaExchangeAlt style={{ fontSize: "20px" }} />
                  좌우반전
                </button>
                <button>영상변경</button>
              </Buttons>
            </VideoContainer>
          </VideoWrapper>
        </Content>
      </Container>
    </>
  );
};

const Container = styled.div`
  min-width: 1080px;
  margin: 30px 20px;
  min-height: 85vh;
  border-radius: 20px;
  background: linear-gradient(
    108deg,
    rgba(255, 255, 255, 0.26) 0%,
    rgba(255, 255, 255, 0.07) 100%
  );

  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(15px);
  display: flex;
  justify-content: center;
  position: relative;
`;

const Content = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0px;
  align-items: center;
  gap: 50px;
`;

const BackButton = styled.button`
  width: 104px;
  height: 40px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.1);
  color: #ee5050;
  margin: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 500;
  font-size: 18px;
  font-family: "Rajdhani";
  cursor: pointer;
  transition: 0.3s ease;
  &:hover {
    background-color: #eee;
  }
  position: absolute;
  top: 0;
  left: 0;
`;

const VideoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const VideoContainer = styled.div`
  display: flex;
  align-items: flex-end;
`;

const YouTubeWrapper = styled.div`
  margin-right: 20px; // YouTube와 Buttons 사이의 간격 조정
  border-radius: 8px;
  overflow: hidden;
`;

const Buttons = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 10px;
  & > button {
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.7);
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.1);
    border: none;
    width: 60px;
    height: 60px;
    font-size: 12px;
    font-weight: 600;
    color: #ee5050;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: 0.3s ease;
  }
  & > button:hover {
    background-color: #eee;
  }
`;

const WebcamWrapper = styled.div`
  margin-right: 20px; // YouTube와 Buttons 사이의 간격 조정
  border-radius: 8px;
  overflow: hidden;
`;

const Webcam = styled.div`
  position: relative;
  width: 309px;
  height: 550px;
  overflow: hidden;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  object-fit: cover;
`;

const Canvas = styled.canvas`
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;
