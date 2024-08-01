import Header from "components/Header";
import styled from "styled-components";
import YouTube from "react-youtube";
import { FaChevronLeft } from "react-icons/fa6";
import { FaExchangeAlt, FaPlayCircle } from "react-icons/fa";
import { PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { axiosInstance } from "axiosInstance/apiClient";
import { useSetRecoilState } from "recoil";
import { IsShortsVisibleAtom, CurrentYoutubeIdAtom } from "stores/index";
import { CompletionAlertModal } from "components/CompletionAlertModal";

interface ChallengeData {
  youtubeId: string;
  url: string;
}

// 사용자가 입력한 유튜브id랑 url을 서버로 보내서 랜드마크를 따고 mongoDB에 저장
const postChallenge = async (data: ChallengeData) => {
  const res = await axiosInstance.post("/api/v1/challenge", data);
  return res.data;
};

export const Practice: React.FC = () => {
  const { videoId } = useParams<{ videoId?: string }>();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [poseLandmarker, setPoseLandmarker] = useState<PoseLandmarker | null>(
    null
  );
  const [webcamRunning, setWebcamRunning] = useState(false);
  const nav = useNavigate();
  const [inputUrl, setInputUrl] = useState<string>("");
  const [isValidUrl, setIsValidUrl] = useState<boolean>(false);
  const setIsWebcamVisible = useSetRecoilState(IsShortsVisibleAtom);
  const setCurrentYoutubeId = useSetRecoilState(CurrentYoutubeIdAtom);
  const [isCompletionAlertModalOpen, setIsCompletionAlertModalOpen] =
    useState<boolean>(false);

  const mutation = useMutation({
    mutationFn: postChallenge,
    onMutate: (variables: ChallengeData) => {
      setIsCompletionAlertModalOpen(true);
      setIsWebcamVisible(true);
      setCurrentYoutubeId(variables.youtubeId);
    },
    onSuccess: (data) => {
      console.log("MongoDB에 저장 성공");
      setIsWebcamVisible(false); // 성공 시 웹캠 비활성화
      setCurrentYoutubeId("");
      nav(`/practice/${data.data.youtubeId}`);
    },
    onError: (error) => {
      console.error("에러", error);
      setIsWebcamVisible(false); // 에러 발생 시 웹캠 비활성화
      setCurrentYoutubeId("");
      nav("/home");
    },
  });

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
          // ex)서버로 전송하거나 상태로 저장
          console.log("Detected pose:", results.landmarks);
        }
      }

      if (webcamRunning) {
        requestAnimationFrame(detectPose);
      }
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

  // 목록 버튼 클릭 시 실행할 함수
  const handleBackButtonClick = () => {
    nav(-1);
  };

  // 영상변경 버튼 클릭 시 실행할 함수
  const handleChangeButtonClick = () => {
    nav("/practice");
  };

  // 영상검색하러 가기 버튼 클릭 시 실행할 함수
  const handleSearchButtonClick = () => {
    nav("/home");
  };

  // url 유효성 검사 함수
  const validateUrl = (url: string) => {
    return url.toLowerCase().includes("shorts");
  };

  // url input onChange 이벤트 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setInputUrl(url);
    setIsValidUrl(validateUrl(url));
  };

  // 영상 불러오기 버튼 클릭 시 실행할 함수
  const handleLoadVideo = () => {
    const youtubeId = extractVideoId(inputUrl);
    if (youtubeId) {
      const challengeData = {
        youtubeId: youtubeId,
        url: inputUrl,
      };
      mutation.mutate(challengeData);
      setInputUrl("");
    } else {
      console.error("올바른 Youtube Shorts URL이 아닙니다.");
    }
  };

  // url에서 videoId 추출하는 함수
  const extractVideoId = (url: string): string | null => {
    const match = url.match(/shorts\/([^?]+)/);
    return match ? match[1] : null;
  };

  const handleCloseIsCompletionAlertModal = () => {
    setIsCompletionAlertModalOpen(false);
    nav("/home");
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
                    onPlay={() => {
                      console.log("유튜브 영상 재생");
                    }}
                    opts={{
                      width: "309",
                      height: "550",
                      playerVars: {
                        autoplay: 0,
                        rel: 0,
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
              {videoId && (
                <Buttons>
                  <button>
                    <FaPlayCircle style={{ fontSize: "20px" }} />
                    재생속도
                  </button>
                  <button>
                    <FaExchangeAlt style={{ fontSize: "20px" }} />
                    좌우반전
                  </button>
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
      <CompletionAlertModal
        isOpen={isCompletionAlertModalOpen}
        onClose={handleCloseIsCompletionAlertModal}
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
