import Header from "components/Header";
import styled from "styled-components";
import YouTube from "react-youtube";
import { YouTubeEvent, YouTubePlayer } from "react-youtube";
import {
  FaChevronLeft,
  FaRedo,
  FaPlayCircle,
  FaPlay,
  FaPause,
} from "react-icons/fa";
import { BiVideoRecording } from "react-icons/bi";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "axiosInstance/apiClient";
import { useSetRecoilState } from "recoil";
import { IsShortsVisibleAtom, CurrentYoutubeIdAtom } from "stores/index";
import { CompletionAlertModal } from "components/CompletionAlertModal";
import { SubmitModal } from "features/practice/SubmitModal";

interface ChallengeData {
  youtubeId: string;
  url: string;
}

interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

interface YoutubeBlazePoseData {
  youtubeId: string;
  landmarks: Landmark[][];
  challengeId: number;
}

const postChallenge = async (data: ChallengeData) => {
  const res = await axiosInstance.post("/api/v1/challenge", data);
  return res.data;
};

const fetchYoutubeBlazePoseData = async (
  videoId: string
): Promise<YoutubeBlazePoseData> => {
  const res = await axiosInstance.get(`/api/v1/challenge/${videoId}`);
  return res.data.data;
};

export const Practice: React.FC = () => {
  // URL 파라미터에서 videoId 추출
  const { videoId } = useParams<{ videoId?: string }>();
  const nav = useNavigate();

  // Recoil 상태 설정
  const setIsWebcamVisible = useSetRecoilState(IsShortsVisibleAtom);
  const setCurrentYoutubeId = useSetRecoilState(CurrentYoutubeIdAtom);

  // 로컬 상태 관리
  const [inputUrl, setInputUrl] = useState<string>("");
  const [isValidUrl, setIsValidUrl] = useState<boolean>(false);
  const [isCompletionAlertModalOpen, setIsCompletionAlertModalOpen] =
    useState<boolean>(false);
  const [isYouTubePlaying, setIsYouTubePlaying] = useState<boolean>(false);
  const [webcamRunning, setWebcamRunning] = useState<boolean>(false);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(
    null
  );
  const [playbackRate, setPlaybackRate] = useState<number>(1); // 재생속도
  const [showPlaybackRates, setShowPlaybackRates] = useState<boolean>(false); // 재생속도 조절 모달
  const playbackRates = [0.5, 0.75, 1, 1.25, 1.5]; // 재생 속도 리스트
  const [isRecording, setIsRecording] = useState<boolean>(false); // 녹화 상태
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]); // 녹화영상 관리
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false); // 제출 모달 상태

  // Ref 설정
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeCanvasRef = useRef<HTMLCanvasElement>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);

  // API 요청 관련 mutation
  const mutation = useMutation({
    mutationFn: postChallenge,
    onMutate: (variables: ChallengeData) => {
      setIsCompletionAlertModalOpen(true);
      setIsWebcamVisible(true);
      setCurrentYoutubeId(variables.youtubeId);
    },
    onSuccess: (data) => {
      setIsWebcamVisible(false);
      setCurrentYoutubeId("");
      nav(`/practice/${data.data.youtubeId}`);
    },
    onError: () => {
      setIsWebcamVisible(false);
      setCurrentYoutubeId("");
      nav("/home");
    },
  });

  // YouTube BlazePose 데이터 쿼리
  const youtubeBlazePoseQuery = useQuery({
    queryKey: ["youtubeBlazePoseData", videoId],
    queryFn: () => fetchYoutubeBlazePoseData(videoId!),
    enabled: !!videoId,
  });

  // PoseLandmarker 초기화
  useEffect(() => {
    const initializePoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task`,
          delegate: "CPU",
        },
        runningMode: "VIDEO",
        numPoses: 2,
      });
      setPoseLandmarker(poseLandmarker);
    };
    initializePoseLandmarker();
  }, []);

  // 웹캠 활성화
  useEffect(() => {
    const enableCam = async () => {
      if (!poseLandmarker) return;
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
    if (poseLandmarker) enableCam();
  }, [poseLandmarker]);

  // YouTube BlazePose 데이터 그리기 함수
  const drawYoutubeBlazePoseData = useCallback(
    (frameIndex: number) => {
      if (!youtubeCanvasRef.current || !youtubeBlazePoseQuery.data) return;
      const ctx = youtubeCanvasRef.current.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(
        0,
        0,
        youtubeCanvasRef.current.width,
        youtubeCanvasRef.current.height
      );
      const landmarks = youtubeBlazePoseQuery.data.landmarks[frameIndex];
      if (!landmarks) return;

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

      ctx.strokeStyle = "blue";
      ctx.lineWidth = 2;
      connections.forEach(([i, j]) => {
        const start = landmarks[i];
        const end = landmarks[j];
        if (start && end) {
          ctx.beginPath();
          ctx.moveTo(start.x * ctx.canvas.width, start.y * ctx.canvas.height);
          ctx.lineTo(end.x * ctx.canvas.width, end.y * ctx.canvas.height);
          ctx.stroke();
        }
      });

      // 관절 그리기(얼굴 포함)
      // landmarks.forEach((landmark) => {
      //   ctx.beginPath();
      //   ctx.arc(
      //     landmark.x * youtubeCanvasRef.current!.width,
      //     landmark.y * youtubeCanvasRef.current!.height,
      //     5,
      //     0,
      //     2 * Math.PI
      //   );
      //   ctx.fillStyle = "red";
      //   ctx.fill();
      // });

      // 관절 그리기 (얼굴 제외)
      const bodyJoints = [
        11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
      ];
      bodyJoints.forEach((index) => {
        const landmark = landmarks[index];
        ctx.beginPath();
        ctx.arc(
          landmark.x * youtubeCanvasRef.current!.width,
          landmark.y * youtubeCanvasRef.current!.height,
          5,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = "red";
        ctx.fill();
      });
    },
    [youtubeBlazePoseQuery.data]
  );

  // YouTube 영상과 BlazePose 데이터 동기화
  useEffect(() => {
    // 애니메이션 프레임 ID를 저장할 변수
    let animationFrameId: number;
    // 초당 프레임 수 설정
    const fps = 30;
    // 프레임 간 간격(밀리초)
    const frameInterval = 1000 / fps;
    // 마지막으로 프레임을 그린 시간
    let lastTime = 0;

    const animate = (currentTime: number) => {
      // 필요한 데이터나 상태가 없으면 애니메이션을 계속 하지만 아무것도 그리지 않음(완전히 중지하면 즉각적 반응이 불가능해서)
      if (
        !youtubePlayerRef.current ||
        !isYouTubePlaying ||
        !youtubeBlazePoseQuery.data ||
        !youtubeBlazePoseQuery.data.landmarks ||
        youtubeBlazePoseQuery.data.landmarks.length === 0
      ) {
        // 조건이 충족되지 않아도 계속해서 다음 프레임을 요청
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      // 프레임 간격만큼 시간이 지났는지 확인(최적화를 위해)
      if (currentTime - lastTime >= frameInterval) {
        // youtube 비이도의 현재 시간 가져오기
        const currentVideoTime = youtubePlayerRef.current.getCurrentTime();
        // 현재 시간에 해당하는 프레임 인덱스 계산
        const frameIndex = Math.floor(currentVideoTime * fps);
        // 계산된 프레임 인덱스로 blazepose 데이터 그리기
        drawYoutubeBlazePoseData(frameIndex);
        // 마지막 그린 시간 업데이트
        lastTime = currentTime;
      }
      // 다음 애니메이션 프레임 요청
      animationFrameId = requestAnimationFrame(animate);
    };
    // 애니메이션 루프 시작
    animationFrameId = requestAnimationFrame(animate);
    // 클린업
    return () => cancelAnimationFrame(animationFrameId);
  }, [isYouTubePlaying, youtubeBlazePoseQuery.data, drawYoutubeBlazePoseData]);

  // YouTube 이벤트 핸들러
  const handleYouTubeStateChange = (event: YouTubeEvent) => {
    setIsYouTubePlaying(event.data === 1);
  };

  const handleYouTubeReady = (event: YouTubeEvent) => {
    youtubePlayerRef.current = event.target;
    event.target.setPlaybackRate(playbackRate);
  };

  const handleYouTubeEnd = () => {
    if (isRecording) {
      setIsRecording(false);
      if (mediaRecorder) {
        mediaRecorder.stop();
      }
      setShowSubmitModal(true);
    }
  };

  // Youtube 재생 속도 조절
  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.setPlaybackRate(rate);
    }
    setShowPlaybackRates(false);
  };

  // Youtube 재생/일시정지 토글 함수
  const togglePlayPause = () => {
    if (youtubePlayerRef.current) {
      if (isYouTubePlaying) {
        youtubePlayerRef.current.pauseVideo();
      } else {
        youtubePlayerRef.current.playVideo();
      }
    }
  };

  // 웹캠 포즈 감지
  const predictWebcam = useCallback(() => {
    if (!poseLandmarker || !videoRef.current) return;
    const detectPose = async () => {
      if (videoRef.current) {
        const results = await poseLandmarker.detectForVideo(
          videoRef.current,
          performance.now()
        );
        if (results.landmarks) {
          // 여기서 감지된 포즈 데이터를 처리할 수 있음
        }
      }
      if (webcamRunning) requestAnimationFrame(detectPose);
    };
    detectPose();
  }, [poseLandmarker, webcamRunning]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (webcamRunning && videoElement) {
      videoElement.addEventListener("loadeddata", predictWebcam);
    }
    return () => {
      if (videoElement) {
        videoElement.removeEventListener("loadeddata", predictWebcam);
      }
    };
  }, [webcamRunning, predictWebcam]);

  // UI 이벤트 핸들러
  const handleBackButtonClick = () => nav(-1);
  const handleChangeButtonClick = () => nav("/practice");
  const handleSearchButtonClick = () => nav("/home");
  const validateUrl = (url: string) => url.toLowerCase().includes("shorts");
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputUrl(e.target.value);
    setIsValidUrl(validateUrl(e.target.value));
  };

  const handleLoadVideo = () => {
    const youtubeId = extractVideoId(inputUrl);
    if (youtubeId) {
      mutation.mutate({ youtubeId, url: inputUrl });
      setInputUrl("");
    } else {
      console.error("올바른 Youtube Shorts URL이 아닙니다.");
    }
  };

  const extractVideoId = (url: string): string | null => {
    const match = url.match(/shorts\/([^?]+)/);
    return match ? match[1] : null;
  };

  // 파이썬에서 영상 다운받는동안 대기시간에 홈으로 이동시켜줌
  const handleCloseIsCompletionAlertModal = () => {
    setIsCompletionAlertModalOpen(false);
    nav("/home");
  };

  const startRecording = () => {
    setIsRecording(true);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.setPlaybackRate(1);
      setPlaybackRate(1);
      youtubePlayerRef.current.seekTo(0);
      youtubePlayerRef.current.playVideo();
    }
    // 웹캠 녹화 시작 로직
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks((prev) => [...prev, event.data]);
        }
      };
      setMediaRecorder(recorder);
      recorder.start();
    }
  };

  const resetRecording = () => {
    setIsRecording(false);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(0);
      youtubePlayerRef.current.pauseVideo();
    }
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
    setRecordedChunks([]);
    setShowSubmitModal(false);
  };

  const submitVideoMutation = useMutation({
    mutationFn: async (data: {
      videoFile: Blob;
      userId: number;
      challengeId: number;
    }) => {
      const formData = new FormData();
      formData.append("videoFile", data.videoFile, "recorded_video.mp4");
      formData.append(
        "request",
        JSON.stringify({
          userId: data.userId,
          challengeId: data.challengeId,
        })
      );

      const res = await axiosInstance.post(
        "/api/v1/userChallenge/analyze",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return res.data;
    },

    onSuccess: () => {
      setShowSubmitModal(false);
      setRecordedChunks([]);
      console.log("제출 성공");
    },
    onError: (error, variables) => {
      console.error("제출 실패", error);
      console.log("전송 시도한 데이터:", {
        videoFileSize: variables.videoFile.size,
        userId: variables.userId,
        challengeId: variables.challengeId,
      });
    },
  });

  // 모달에서 제출 누르면  실핼할 함수
  const handleSubmit = async () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: "video/mp4" });

    if (youtubeBlazePoseQuery?.data?.challengeId) {
      submitVideoMutation.mutate({
        videoFile: blob,
        userId: 1, // 향후 동적으로 변경 필요
        challengeId: youtubeBlazePoseQuery.data.challengeId,
      });
    }
    console.log(blob, youtubeBlazePoseQuery?.data?.challengeId);
    console.log("전송완료!");
  };

  // 모달에서 다운로드 누르면 실행할 함수
  const handleDownload = () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: "video/mp4" });
    // 다운로드 링크 생성
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recorded_video.mp4";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Header stickyOnly />
      <Container>
        <BackButton onClick={handleBackButtonClick}>
          <FaChevronLeft />
          &nbsp;목록
        </BackButton>
        <Content>
          <VideoWrapper>
            <VideoContainer>
              <YouTubeWrapper>
                {videoId ? (
                  <YouTube
                    videoId={videoId}
                    onStateChange={handleYouTubeStateChange}
                    onReady={handleYouTubeReady}
                    onEnd={handleYouTubeEnd}
                    opts={{
                      width: "309",
                      height: "550",
                      playerVars: {
                        autoplay: 0,
                        rel: 0,
                        modestbranding: 1,
                        controls: 1,
                        fs: 0,
                        playsinline: 1,
                        origin: window.location.origin,
                      },
                    }}
                  />
                ) : (
                  <SearchUrl>
                    <Title>참고 영상을 첨부하세요</Title>
                    <SubTitle>
                      <span>방법 1</span>
                    </SubTitle>
                    <SearchButton onClick={handleSearchButtonClick}>
                      영상 검색하러 가기
                    </SearchButton>
                    <SubTitle>
                      <span>방법 2</span>
                    </SubTitle>
                    <SearchInput
                      placeholder="숏츠 영상 url을 입력하세요"
                      value={inputUrl}
                      onChange={handleInputChange}
                    />
                    <SearchButton
                      onClick={handleLoadVideo}
                      disabled={!isValidUrl}
                      style={{ opacity: isValidUrl ? 1 : 0.5 }}
                    >
                      url 영상 불러오기
                    </SearchButton>
                  </SearchUrl>
                )}
              </YouTubeWrapper>
              {videoId && !isRecording && (
                <Buttons>
                  <ButtonWrapper>
                    <Button
                      onClick={() => setShowPlaybackRates(!showPlaybackRates)}
                    >
                      <FaPlayCircle style={{ fontSize: "20px" }} />
                      재생속도
                    </Button>
                    {showPlaybackRates && (
                      <PlaybackRateOptions>
                        {playbackRates.map((rate) => (
                          <PlaybackRateButton
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            $isActive={playbackRate === rate}
                          >
                            {rate}x
                          </PlaybackRateButton>
                        ))}
                      </PlaybackRateOptions>
                    )}
                  </ButtonWrapper>
                  <Button onClick={togglePlayPause}>
                    {isYouTubePlaying ? (
                      <FaPause style={{ fontSize: "20px" }} />
                    ) : (
                      <FaPlay style={{ fontSize: "20px" }} />
                    )}
                    {isYouTubePlaying ? "일시정지" : "재생"}
                  </Button>
                  <button onClick={handleChangeButtonClick}>영상변경</button>
                </Buttons>
              )}
            </VideoContainer>
          </VideoWrapper>
          <VideoWrapper>
            <VideoContainer>
              <WebcamWrapper>
                <Webcam>
                  <Video ref={videoRef} autoPlay playsInline />
                  <YoutubeCanvas
                    ref={youtubeCanvasRef}
                    width={309}
                    height={550}
                  />
                  {isRecording && (
                    <RecordingIndicator>녹화 중</RecordingIndicator>
                  )}
                </Webcam>
              </WebcamWrapper>
              <Buttons>
                {!isRecording ? (
                  <Button onClick={startRecording}>
                    <BiVideoRecording style={{ fontSize: "20px" }} />
                    녹화
                  </Button>
                ) : (
                  <Button onClick={resetRecording}>
                    <FaRedo style={{ fontSize: "20px" }} />
                    초기화
                  </Button>
                )}
              </Buttons>
            </VideoContainer>
          </VideoWrapper>
        </Content>
      </Container>
      <CompletionAlertModal
        isOpen={isCompletionAlertModalOpen}
        onClose={handleCloseIsCompletionAlertModal}
      />
      <SubmitModal
        isOpen={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          setRecordedChunks([]);
        }}
        onSubmit={handleSubmit}
        onDownload={handleDownload}
      />
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

const YoutubeCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

// 영상 url 입력하는 경우 ui
const SearchUrl = styled.div`
  width: 309px;
  height: 550px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 8px 8px 4px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px;
  gap: 25px;
`;

const Title = styled.div`
  color: #b4b4b4;
  font-size: 18px;
  font-weight: 500;
`;

const SubTitle = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  color: #b4b4b4;
  font-size: 14px;
  width: 100%;

  &::before,
  &::after {
    content: "";
    flex: 1;
    border-bottom: 1px solid #cecece;
  }

  & > span {
    padding: 0 10px;
  }
`;

const SearchButton = styled.button`
  border-radius: 4px;
  background: #f7f7f7;
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.15);
  border: none;
  color: #ee5050;
  cursor: pointer;
  width: 250px;
  height: 44px;
  font-size: 18px;
  font-weight: 500;
`;

const SearchInput = styled.input`
  border-radius: 4px;
  background: #fff;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.15);
  border: none;
  width: 250px;
  height: 44px;
  outline: none;
  padding-left: 15px;
`;

const ButtonWrapper = styled.div`
  position: relative;
`;

const Button = styled.button`
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

  &:hover {
    background-color: #eee;
  }
`;

const PlaybackRateOptions = styled.div`
  position: absolute;
  top: -200px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const PlaybackRateButton = styled.button<{ $isActive: boolean }>`
  border: none;
  background: ${(props) => (props.$isActive ? "#ee5050" : "white")};
  color: ${(props) => (props.$isActive ? "white" : "#ee5050")};
  padding: 10px 15px;
  cursor: pointer;
  transition: 0.3s ease;

  &:hover {
    background: ${(props) => (props.$isActive ? "#ee5050" : "#f0f0f0")};
  }
`;

const RecordingIndicator = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  color: red;
  font-weight: bold;
`;
