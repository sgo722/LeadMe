import Header from "components/Header";
import styled from "styled-components";
import YouTube from "react-youtube";
import { YouTubeEvent, YouTubePlayer } from "react-youtube";
import { FaChevronLeft, FaRedo, FaPlay, FaPause } from "react-icons/fa";
import { BiVideoRecording } from "react-icons/bi";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "axiosInstance/apiClient";
import { useSetRecoilState } from "recoil";
import { IsShortsVisibleAtom, RecordedVideoUrlAtom } from "stores/index";
import { SubmitModal } from "features/practice/SubmitModal";
import { AlertModal } from "components/AlertModal";
import { CompletionAlertModal } from "components/CompletionAlertModal";
import { TiMediaRecord } from "react-icons/ti";
import { MdOutlineSpeed } from "react-icons/md";
import countdownSound from "assets/audio/countdown.mp3";
import { UserProfile } from "types";
// import { FaVideoSlash } from "react-icons/fa6";

// interface ChallengeData {
//   youtubeId: string;
//   url: string;
// }

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

interface VideoDataItem {
  challengeId: number;
  youtubeId: string;
  title: string;
}

// const postChallenge = async (data: ChallengeData) => {
//   const res = await axiosInstance.post("/api/v1/challenge", data);
//   return res.data;
// };

const fetchYoutubeBlazePoseData = async (
  videoId: string
): Promise<YoutubeBlazePoseData> => {
  const res = await axiosInstance.get(`/api/v1/challenge/${videoId}`);
  return res.data.data;
};

const colors = ["#FB37FF", "#C882FF", "#33E9E9", "#FF0000", "#0051ff"];
const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

export const Practice: React.FC = () => {
  // URL 파라미터에서 videoId 추출
  const { videoId } = useParams<{ videoId?: string }>();
  const nav = useNavigate();

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [showAlertModal, setShowAlertModal] = useState<boolean>(false);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const setIsShortsVisible = useSetRecoilState(IsShortsVisibleAtom);
  const setRecordedVideoUrl = useSetRecoilState(RecordedVideoUrlAtom);

  // Recoil 상태 설정
  // const setIsWebcamVisible = useSetRecoilState(IsShortsVisibleAtom);
  // const setCurrentYoutubeId = useSetRecoilState(CurrentYoutubeIdAtom);

  // 로컬 상태 관리
  // const [inputUrl, setInputUrl] = useState<string>("");
  // const [isValidUrl, setIsValidUrl] = useState<boolean>(false);
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
  const [countdown, setCountdown] = useState<number | null>(null); // 카운트다운 상태

  // Ref 설정
  const videoRef = useRef<HTMLVideoElement>(null);
  const youtubeCanvasRef = useRef<HTMLCanvasElement>(null);
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null);
  const countdownAudio = useRef<HTMLAudioElement | null>(null); // 카운트다운 오디오

  const fetchSessionUserData = () => {
    const userData = sessionStorage.getItem("user_profile");
    return userData ? (JSON.parse(userData) as UserProfile) : null;
  };

  const sessionUser = fetchSessionUserData();

  // API 요청 관련 mutation
  // const mutation = useMutation({
  //   mutationFn: postChallenge,
  //   onMutate: (variables: ChallengeData) => {
  //     setIsCompletionAlertModalOpen(true);
  //     setIsWebcamVisible(true);
  //     setCurrentYoutubeId(variables.youtubeId);
  //   },
  //   onSuccess: (data) => {
  //     setIsWebcamVisible(false);
  //     setCurrentYoutubeId("");
  //     nav(`/practice/${data.data.youtubeId}`);
  //   },
  //   onError: () => {
  //     setIsWebcamVisible(false);
  //     setCurrentYoutubeId("");
  //     nav("/home");
  //   },
  // });

  // YouTube BlazePose 데이터 쿼리
  const youtubeBlazePoseQuery = useQuery({
    queryKey: ["youtubeBlazePoseData", videoId],
    queryFn: () => fetchYoutubeBlazePoseData(videoId!),
    enabled: !!videoId,
  });

  // 서버에 저장된 영상 목록 가져오는 쿼리
  const fetchVideoList = async () => {
    const res = await axiosInstance.get("/api/v1/challenge/battleList");
    return res.data.data;
  };

  // 서버에 저장된 영상 가져오기
  const { data: videoList } = useQuery({
    queryKey: ["videoList"],
    queryFn: fetchVideoList,
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

      const randomColor = getRandomColor();

      ctx.strokeStyle = randomColor;
      ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
      ctx.shadowColor = randomColor;
      ctx.shadowBlur = 4;
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      // 몸통
      drawBodyPart(ctx, [
        landmarks[11],
        landmarks[23],
        landmarks[24],
        landmarks[12],
      ]);

      // 팔
      drawLimb(ctx, landmarks, [11, 13, 15, 17, 19, 21], 10, 5); // 왼팔
      drawLimb(ctx, landmarks, [12, 14, 16, 18, 20, 22], 10, 5); // 오른팔

      // 다리
      drawLimb(ctx, landmarks, [23, 25, 27, 29, 31], 15, 10); // 왼쪽 다리
      drawLimb(ctx, landmarks, [24, 26, 28, 30, 32], 15, 10); // 오른쪽 다리
    },
    [youtubeBlazePoseQuery.data]
  );

  const drawBodyPart = (ctx: CanvasRenderingContext2D, points: Landmark[]) => {
    ctx.beginPath();
    ctx.moveTo(points[0].x * ctx.canvas.width, points[0].y * ctx.canvas.height);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(
        points[i].x * ctx.canvas.width,
        points[i].y * ctx.canvas.height
      );
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const drawLimb = (
    ctx: CanvasRenderingContext2D,
    landmarks: Landmark[],
    points: number[],
    startWidth: number,
    endWidth: number
  ) => {
    for (let i = 0; i < points.length - 1; i++) {
      const start = landmarks[points[i]];
      const end = landmarks[points[i + 1]];
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2;

      const currentWidth =
        startWidth - (i * (startWidth - endWidth)) / (points.length - 1);
      const nextWidth =
        startWidth - ((i + 1) * (startWidth - endWidth)) / (points.length - 1);

      ctx.beginPath();
      ctx.moveTo(
        (start.x - currentWidth / 1000) * ctx.canvas.width,
        start.y * ctx.canvas.height
      );
      ctx.lineTo(
        (start.x + currentWidth / 1000) * ctx.canvas.width,
        start.y * ctx.canvas.height
      );
      ctx.lineTo(
        (end.x + nextWidth / 1000) * ctx.canvas.width,
        end.y * ctx.canvas.height
      );
      ctx.lineTo(
        (end.x - nextWidth / 1000) * ctx.canvas.width,
        end.y * ctx.canvas.height
      );
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 관절 부분을 원으로 그리기
      ctx.beginPath();
      ctx.arc(
        midX * ctx.canvas.width,
        midY * ctx.canvas.height,
        currentWidth / 6,
        0,
        2 * Math.PI
      );
      ctx.fill();
      ctx.stroke();
    }
  };

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
  const handleChangeButtonClick = () => nav("/challenge");
  // const handleSearchButtonClick = () => nav("/home");
  // const validateUrl = (url: string) => url.toLowerCase().includes("shorts");
  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputUrl(e.target.value);
  //   setIsValidUrl(validateUrl(e.target.value));
  // };

  // const handleLoadVideo = () => {
  //   const youtubeId = extractVideoId(inputUrl);
  //   if (youtubeId) {
  //     mutation.mutate({ youtubeId, url: inputUrl });
  //     setInputUrl("");
  //   } else {
  //     console.error("올바른 Youtube Shorts URL이 아닙니다.");
  //   }
  // };

  // const extractVideoId = (url: string): string | null => {
  //   const match = url.match(/shorts\/([^?]+)/);
  //   return match ? match[1] : null;
  // };

  // 파이썬에서 영상 다운받는동안 대기시간에 홈으로 이동시켜줌
  const handleCloseIsCompletionAlertModal = () => {
    setIsCompletionAlertModalOpen(false);
    nav("/home");
  };

  const startRecording = () => {
    setCountdown(3);
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null; // prev가 null인 경우 처리
        if (prev === 1) {
          clearInterval(countdownInterval);
          setTimeout(() => {
            startActualRecording();
            setCountdown(null);
          }, 1000); // 1초 더 기다린 후 녹화 시작
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startActualRecording = () => {
    setIsRecording(true);
    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.seekTo(0);
      youtubePlayerRef.current.setPlaybackRate(1);
      setPlaybackRate(1);
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
      const blob = new Blob(
        [
          JSON.stringify({
            userId: data.userId,
            challengeId: data.challengeId,
          }),
        ],
        {
          type: "application/json",
        }
      );
      formData.append("videoFile", data.videoFile);
      formData.append("request", blob);

      const res = await axiosInstance.post(
        "/api/v1/userChallenge/analyze",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      return res.data;
    },
    onMutate: (data) => {
      setIsAnalyzing(true);
      setShowSubmitModal(false);
      setRecordedChunks([]);

      const videoUrl = URL.createObjectURL(data.videoFile);
      setRecordedVideoUrl(videoUrl);
      setIsShortsVisible(true);

      setAlertMessage("영상 분석이 시작되었습니다!");
      setShowAlertModal(true);
      nav("/home");
    },

    onSuccess: (data) => {
      setIsAnalyzing(false);
      setAlertMessage("영상 분석이 완료되었습니다!");
      setShowAlertModal(true);
      setTimeout(() => {
        setIsShortsVisible(false);
        setRecordedVideoUrl(null);
        nav(`/report/${data.data.uuid}`);
      }, 2000);
    },
    onError: (error) => {
      console.error("제출 실패", error);
      setIsAnalyzing(false);
      setIsShortsVisible(false);
      setRecordedVideoUrl(null);
      setAlertMessage("영상 제출에 실패했습니다. 다시 시도해주세요.");
      setShowAlertModal(true);
    },
  });

  // 모달에서 제출 누르면  실핼할 함수
  const handleSubmit = async () => {
    if (recordedChunks.length === 0) return;
    const blob = new Blob(recordedChunks, { type: "video/mp4" });

    if (youtubeBlazePoseQuery?.data?.challengeId) {
      submitVideoMutation.mutate({
        videoFile: blob,
        userId: sessionUser?.id || 1,
        challengeId: youtubeBlazePoseQuery.data.challengeId,
      });
    }
    console.log(
      "전송 할 데이터들",
      blob,
      youtubeBlazePoseQuery?.data?.challengeId
    );
  };

  useEffect(() => {
    countdownAudio.current = new Audio(countdownSound);
  }, []);

  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownAudio.current?.play();
    }
  }, [countdown]);

  const handlePick = (id: string) => {
    nav(`/challenge/${id}`);
  };

  return (
    <>
      <Header stickyOnly />
      <Container>
        {videoId && (
          <BackButton onClick={handleBackButtonClick}>
            <FaChevronLeft />
            &nbsp;목록
          </BackButton>
        )}
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
                  <ChallengeList>
                    <Title>Challenge!</Title>
                    <ScrollableList>
                      {Array.isArray(videoList) && videoList.length > 0 ? (
                        videoList.map((item: VideoDataItem) => (
                          <ListItem
                            key={item.challengeId}
                            onClick={() => handlePick(item.youtubeId)}
                          >
                            {item.title}
                          </ListItem>
                        ))
                      ) : (
                        <ListItem>No videos found</ListItem>
                      )}
                    </ScrollableList>
                  </ChallengeList>
                )}
              </YouTubeWrapper>
              {videoId && !isRecording && (
                <Buttons>
                  <ButtonWrapper>
                    <Button
                      onClick={() => setShowPlaybackRates(!showPlaybackRates)}
                    >
                      <MdOutlineSpeed style={{ fontSize: "25px" }} />
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
                      <FaPause
                        style={{ fontSize: "15px", marginBottom: "3px" }}
                      />
                    ) : (
                      <FaPlay
                        style={{ fontSize: "15px", marginBottom: "3px" }}
                      />
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
                  {countdown !== null && (
                    <CountdownOverlay>
                      <CountdownCircle>
                        <CountdownSpinner $countdown={countdown} />
                        <CountdownNumber>{countdown}</CountdownNumber>
                      </CountdownCircle>
                    </CountdownOverlay>
                  )}
                  <Video ref={videoRef} autoPlay playsInline />
                  <YoutubeCanvas
                    ref={youtubeCanvasRef}
                    width={309}
                    height={550}
                  />
                  {isRecording && (
                    <RecordingIndicator>
                      <TiMediaRecord
                        style={{
                          color: "red",
                          fontSize: "25px",
                          marginBottom: "3px",
                        }}
                      />
                      <span>REC</span>
                    </RecordingIndicator>
                  )}
                </Webcam>
              </WebcamWrapper>
              <Buttons>
                {videoId &&
                  (!isRecording ? (
                    <Button
                      onClick={startRecording}
                      disabled={countdown !== null}
                      style={{ opacity: countdown !== null ? 0.5 : 1 }}
                    >
                      <BiVideoRecording style={{ fontSize: "20px" }} />
                      녹화
                    </Button>
                  ) : (
                    <Button onClick={resetRecording}>
                      <FaRedo style={{ fontSize: "20px" }} />
                      초기화
                    </Button>
                  ))}
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
        isPending={submitVideoMutation.isPending || isAnalyzing}
      />
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        message={alertMessage}
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
  height: 550px;
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

const ChallengeList = styled.div`
  width: 350px;
  height: 550px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 8px 8px 4px 0px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 30px 10px;
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
  color: white;
  font-weight: bold;
  display: flex;
  align-items: center;
  & > span {
    font-size: 18px;
  }
`;

const CountdownOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 10;
`;

const CountdownCircle = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background-color: rgba(238, 80, 80, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
`;

const CountdownNumber = styled.div`
  font-size: 80px;
  color: white;
  font-weight: bold;
`;

const CountdownSpinner = styled.div<{ $countdown: number }>`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 8px solid transparent;
  border-top-color: #ee5050;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ScrollableList = styled.div`
  flex-grow: 1;
  border-radius: 10px;
  padding: 10px;

  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 15px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #dfdfdf;
    border-radius: 10px;
    border: 4px solid rgba(0, 0, 0, 0);
    background-clip: padding-box;
    cursor: pointer;
  }
`;

const ListItem = styled.div`
  width: 100%;
  min-width: 295px;
  padding: 15px;
  margin: 10px 0;
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 8px;
  background: linear-gradient(90deg, #f7f7f7 0%, #ffedf6 100%);

  &:first-child {
    margin: 0;
  }

  &:last-child {
    margin: 0;
  }
`;

const Title = styled.h1`
  color: #ee5050;
  font-family: Rajdhani;
  font-size: 50px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.6px;
  margin-bottom: 12px;
`;
