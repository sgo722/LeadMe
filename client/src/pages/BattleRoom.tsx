import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { OpenVidu } from "openvidu-browser";
import { axiosInstance } from "axiosInstance/apiClient";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRecoilValue } from "recoil";
import { userProfileState } from "stores/authAtom";
import countdownSound from "assets/audio/countdown.mp3";
import styled from "styled-components";
import YouTube, { YouTubePlayer } from "react-youtube";
import { getJWTHeader } from "axiosInstance/apiClient";
import type {
  Publisher,
  Session,
  Subscriber,
  StreamEvent,
  SignalEvent,
} from "openvidu-browser";

interface SignalData {
  ready?: boolean;
  selectedVideoId?: number | null;
  isVideoConfirmed?: boolean;
  start?: boolean;
  selectedYoutubeId?: string;
}

interface VideoDataItem {
  challengeId: number;
  youtubeId: string;
  title: string;
}

// 세션 : 화상 회의 가상 공간
// 발행자(publisher) : 자신의 오디오/비디오 스트림을 세션에 전송하는 참가자
// 구독자(Subscriber) : 다른 참가자가 발행한 스트림을 수신하는 참가자, 한 참가자는 여러 스트림을 동시에 구독 가능
// 스트림 : 실시간으로 전송되는 오디오, 비디오 등 발행자가 생성하고 구독자가 수신
// 로컬 비디오 스트림 : 사용자 자신의 웹캠에서 캡처된 비디오 스트림, 이는 사용자가 발행하는 스트림으로 다른 참가자들에게 전송
// 피어 : WebRTC에서 직접 연결되는 두 엔드포인트,

// 방장 여부를 확인하는 쿼리
const fetchHostStatus = async (sessionId: string) => {
  const res = await axiosInstance.get(`/api/v1/sessions/${sessionId}/host`);
  return res.data;
};

// 서버에 저장된 영상 목록 가져오는 쿼리
const fetchVideoList = async () => {
  const res = await axiosInstance.get("/api/v1/challenge/battleList");
  return res.data;
};

// 유저가 선택한 영상의 blasePose 데이터를 받아오는 쿼리
const fetchChallengeData = async (youtubeId: string) => {
  const res = await axiosInstance.get(`/api/v1/challenge/${youtubeId}`);
  return res.data;
};

// 녹화 영상 제출 및 점수 반환 쿼리
const submitRecordedVideo = async (data: FormData) => {
  const res = await axiosInstance.post("/api/v1/competition/result", data, {
    headers: {
      ...getJWTHeader(),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const BattleRoom: React.FC = () => {
  const location = useLocation();
  const { token } = location.state as {
    token: string;
  };
  const nav = useNavigate();
  const userProfile = useRecoilValue(userProfileState); // 유저정보
  const [session, setSession] = useState<Session | null>(null); //OpenVidu 세션 상태 관리
  const [publisher, setPublisher] = useState<Publisher | null>(null); // 로컬 비디오 스트림 발행자 상태 관리
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]); // 원격 비디오 스트림 구독자 목록 상태 관리
  const [selectedVideo, setSelectedVideo] = useState<VideoDataItem | null>(
    null
  );
  const [selectedYoutubeId, setSelectedYoutubeId] = useState<string | null>(
    null
  ); // 선택된 영상의 youtubeId 상태
  const [searchTerm, setSearchTerm] = useState<string>(""); // 검색어
  const [isVideoConfirmed, setIsVideoConfirmed] = useState<boolean>(false);

  const [myReady, setMyReady] = useState<boolean>(false); // 자신의 준비 state
  const [peerReady, setPeerReady] = useState<boolean>(false); // 상대방의 준비 state
  const [isHost, setIsHost] = useState<boolean>(false); // 방장 여부를 확인하는 state

  const [countdown, setCountdown] = useState<number | null>(null); // 카운트다운 상태
  const [battleStart, setBattleStart] = useState<boolean>(false); // 배틀 시작 상태
  const [isYouTubePlaying, setIsYouTubePlaying] = useState<boolean>(false);

  const [isRecording, setIsRecording] = useState<boolean>(false); // 녹화 상태
  const youtubePlayerRef = useRef<YouTubePlayer | null>(null); // 유튜브플레이어 참조
  const countdownAudio = useRef<HTMLAudioElement | null>(null); // 카운트다운 오디오 참조
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const webcamCanvasRef = useRef<HTMLCanvasElement>(null); // 캔버스 참조

  // 서버에 저장된 영상 가져오기
  const { data: videoList, isLoading: isVideoLoading } = useQuery({
    queryKey: ["videoList"],
    queryFn: fetchVideoList,
  });

  // 영상을 제출하고 점수를 반환하는 뮤테이션
  const submitRecordedVideoMutation = useMutation({
    mutationFn: submitRecordedVideo,
    onSuccess: (data) => {
      console.log("성공했음 반환값:", data);
    },
    onError: (error) => {
      console.log("녹화영상 제출 실패", error);
    },
  });

  // 선택된 비디오의 blazepose 데이터를 받아오는 쿼리
  const challengeQuery = useQuery({
    queryKey: ["challengeData", selectedYoutubeId],
    queryFn: () => {
      if (selectedYoutubeId) {
        return fetchChallengeData(selectedYoutubeId);
      }
      throw new Error("selectedYoutubeId is null");
    },
    enabled: !!selectedYoutubeId,
  });

  // 블레이즈포즈 안정화되면 지우기
  useEffect(() => {
    if (challengeQuery.isSuccess) {
      console.log("블레이즈포즈 데이터:", challengeQuery.data.data.landmarks);
    }
    if (challengeQuery.isError) {
      console.error("블레이즈포즈 가져오다가 에러남:", challengeQuery.error);
    }
  }, [
    challengeQuery.isSuccess,
    challengeQuery.isError,
    challengeQuery.data,
    challengeQuery.error,
  ]);

  // 방장 여부 확인
  const {
    data: hostData,
    isLoading: isCheckingHost,
    error: hostCheckError,
  } = useQuery({
    queryKey: ["hostStatus", session?.sessionId],
    queryFn: () => {
      if (!session?.sessionId) {
        throw new Error("세션아이디가 없어용");
      }
      return fetchHostStatus(session.sessionId);
    },
    enabled: !!session?.sessionId,
  });

  // 방장 여부 설정
  useEffect(() => {
    if (hostData?.isSuccess) {
      const hostId = hostData.data;
      const userId = JSON.parse(
        sessionStorage.getItem("user_profile") || "{}"
      ).id;
      setIsHost(hostId === userId);
      console.log("방장여부:", isHost);
    }
  }, [hostData, isHost]);

  // 카운트 다운 오디오 초기화
  useEffect(() => {
    countdownAudio.current = new Audio(countdownSound);
  }, []);

  // 비디오 아이템 클릭 핸들러
  const handleItemClick = (id: number) => {
    const video = videoList?.data.find(
      (item: VideoDataItem) => item.challengeId === id
    );
    setSelectedVideo(video || null);
    setIsVideoConfirmed(false);
    // 선택된 비디오 정보를 다른 참가자에게 전송
    if (session && video) {
      session.signal({
        data: JSON.stringify({ selectedVideoId: video.challengeId }),
        type: "video-selected",
      });
    }
  };

  // 방 나가는 뮤테이션
  const exitSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      await axiosInstance.delete(`/api/v1/session/${sessionId}`);
    },
    onSuccess: () => {
      console.log("세션 종료 성공");
      nav("/battle");
    },
    onError: (error) => {
      console.error("세션 종료 실패:", error);
    },
  });

  // 비디오 선택 취소 핸들러
  const handleClose = () => {
    setSelectedVideo(null);
    setIsVideoConfirmed(false);

    // 비디오 선택 취소 정보를 다른 참가자에게 전송
    if (session) {
      session.signal({
        data: JSON.stringify({ selectedVideoId: null }),
        type: "video-selected",
      });
    }
  };

  // 비디오 선택 확인 핸들러
  const handleConfirm = () => {
    setIsVideoConfirmed(true);
    if (selectedVideo) {
      setSelectedYoutubeId(selectedVideo.youtubeId);
    }
    // 비디오 선택 확인 정보를 다른 참가자에게 전송
    if (session) {
      session.signal({
        data: JSON.stringify({
          isVideoConfirmed: true,
          selectedYoutubeId: selectedVideo?.youtubeId,
        }),
        type: "video-confirmed",
      });
    }
  };

  // 비디오 선택 취소 및 초기화 핸들러
  const handleCancel = () => {
    setIsVideoConfirmed(false);
    setSelectedVideo(null);

    // 비디오 선택 취소 및 초기화 정보를 다른 참가자에게 전송
    if (session) {
      session.signal({
        data: JSON.stringify({
          isVideoConfirmed: false,
          selectedVideoId: null,
        }),
        type: "video-cancelled",
      });
    }
  };

  // 준비 버튼 클릭 시 상태를 변경하고 다른참가자에게 신호를 보내는 함수
  const toggleReady = useCallback(() => {
    const newReadyState = !myReady;
    setMyReady(newReadyState);
    if (session) {
      session.signal({
        data: JSON.stringify({ ready: newReadyState }),
        type: "user-ready",
      });
    }
  }, [myReady, session]);

  // 시작신호를 보내는 함수
  const sendStartSignal = () => {
    if (session) {
      session.signal({
        data: JSON.stringify({ start: true }),
        type: "battle-start",
      });
    }
  };

  // 배틀 시작 함수
  const startBattle = useCallback(() => {
    if (youtubePlayerRef.current) {
      // 유튜브 영상 제일 처음으로 되돌리기
      youtubePlayerRef.current.seekTo(0);
      // 비디오 멈추기
      youtubePlayerRef.current.pauseVideo();
      // 배틀 시작
      setBattleStart(true);
      // 카운트다운 3으로 변경
      setCountdown(3);
      // 준비 상태 초기화
      setMyReady(false);
      setPeerReady(false);
    }
  }, [youtubePlayerRef]);

  // 배틀 시작 클릭시 시그널을 보내고 카운트다운을 시작하는 함수
  const handleStart = () => {
    if (isHost && myReady && peerReady) {
      sendStartSignal();
      startBattle();
    } else {
      alert("모든 참가자가 준비되지 않았습니다.");
    }
  };

  // 녹화 시작 함수
  const startRecording = useCallback(() => {
    if (publisher && publisher.stream) {
      const stream = publisher.stream.getMediaStream();
      try {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm",
        });

        mediaRecorderRef.current = mediaRecorder;
        recordedChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onerror = (error) => {
          console.error("MediaRecorder 에러:", error);
        };

        mediaRecorder.start();
        setIsRecording(true);
        console.log("녹화 시작");
      } catch (error) {
        console.error("MediaRecorder 생성 실패:", error);
      }
    } else {
      console.error("Publisher 또는 스트림이 없음");
    }
  }, [publisher]);

  // 녹화 데이터 처리, 영상 제출 api 호출
  useEffect(() => {
    if (!isRecording && recordedChunksRef.current.length > 0) {
      const recordedBlob = new Blob(recordedChunksRef.current, {
        type: "video/webm",
      });
      console.log("녹화된 영상 크기:", recordedBlob.size);
      // 여기서 영상 제출 API 호출

      const formData = new FormData();
      formData.append(
        "request",
        JSON.stringify({
          userId: userProfile?.id,
          challengeId: selectedVideo?.challengeId,
        })
      );
      formData.append("videoFile", recordedBlob, "record.webm");
      // const blob = new Blob(
      //   [
      //     JSON.stringify({
      //       userId: 5,
      //       challengeId: selectedVideo?.challengeId,
      //     }),
      //   ],
      //   {
      //     type: "application/json",
      //   }
      // );
      // formData.append("request", blob);
      // formData.append("videoFile", recordedBlob, "record.mp4");

      // 영상 제출 mutation 실행
      submitRecordedVideoMutation.mutate(formData);

      // 처리 후 초기화
      recordedChunksRef.current = [];
    }
  }, [isRecording, selectedVideo, submitRecordedVideoMutation, userProfile]);

  // 녹화 중지 함수
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("녹화 끝");
    }
  }, [isRecording]);

  // 카운트다운 및 영상 재생 로직
  useEffect(() => {
    let countdownInterval: NodeJS.Timeout;
    if (battleStart && countdown !== null) {
      if (countdown === 3) countdownAudio.current?.play();
      countdownInterval = setInterval(() => {
        setCountdown((prevCount) => {
          if (prevCount === null) return null;
          if (prevCount > 0) return prevCount - 1;
          else {
            clearInterval(countdownInterval);
            youtubePlayerRef.current?.playVideo();
            return null;
          }
        });
      }, 1000);
    }
    return () => {
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, [battleStart, countdown]);

  // 신호 처리를 위한 useEffect
  useEffect(() => {
    if (session) {
      const handleSignal = (event: SignalEvent) => {
        console.log("Received signal:", event);

        const signalType = event.type.replace("signal:", "");
        let signalData: SignalData;

        try {
          signalData =
            typeof event.data === "string"
              ? JSON.parse(event.data)
              : event.data;
        } catch (error) {
          console.error("Signal data parsing error:", error);
          return;
        }

        // 자신이 보낸 신호는 무시
        if (
          event.from &&
          session.connection &&
          event.from.connectionId === session.connection.connectionId
        ) {
          return;
        }

        switch (signalType) {
          case "user-ready":
            if (typeof signalData.ready === "boolean") {
              setPeerReady(signalData.ready);
              console.log("상대방 준비 상태:", signalData.ready);
            }
            break;
          case "video-selected":
            console.log("비디오 선택됨:", signalData);
            if (
              signalData.selectedVideoId !== null &&
              signalData.selectedVideoId !== undefined
            ) {
              const video = videoList?.data.find(
                (item: VideoDataItem) =>
                  item.challengeId === signalData.selectedVideoId
              );
              setSelectedVideo(video || null);
            } else {
              setSelectedVideo(null);
            }
            setIsVideoConfirmed(false);
            break;
          case "video-confirmed":
            console.log("비디오 확인됨:", signalData);
            if (signalData.isVideoConfirmed !== undefined) {
              setIsVideoConfirmed(signalData.isVideoConfirmed);
              if (signalData.selectedYoutubeId) {
                setSelectedYoutubeId(signalData.selectedYoutubeId);
              }
            }
            break;
          case "video-cancelled":
            console.log("비디오 취소됨");
            setIsVideoConfirmed(false);
            setSelectedVideo(null);
            break;
          case "battle-start":
            console.log("배틀 시작 신호 수신:", signalData);
            if (signalData.start) {
              startBattle();
            }
            break;
          default:
            console.log("알 수 없는 시그널 타입:", signalType);
        }
      };

      session.on("signal", handleSignal);

      return () => {
        session.off("signal", handleSignal);
      };
    }
  }, [session, startBattle, videoList]);

  // 컴포넌트가 마운트될때나 token이 변경될 때 실행
  useEffect(() => {
    // OpenVidu 객체 생성
    const OV = new OpenVidu();
    // 새 세션 초기화
    const session = OV.initSession();

    // 세션을 초기화 하는 비동기 함수
    const initializeSession = async () => {
      try {
        // 사용자 웹캠 접근 권한 요청
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });

        // 새 스트림이 생성될 때 실행될 이벤트 리스너
        session.on("streamCreated", (event: StreamEvent) => {
          // 새 스트림 구독
          const subscriber = session.subscribe(event.stream, "subscriber");
          // 구독자 목록에서 새 구독자 추가
          setSubscribers((prevSubscribers) => [...prevSubscribers, subscriber]);
        });
        // 세션에 연결
        await session.connect(token);

        // 로컬 비디오 스트림 발행자 초기화
        const publisher = await OV.initPublisherAsync(undefined, {
          audioSource: undefined,
          videoSource: undefined,
          publishAudio: true,
          publishVideo: true,
          resolution: "640x480",
          frameRate: 30,
          insertMode: "APPEND",
          mirror: false,
        });
        // 발행자를 세션에 게시
        await session.publish(publisher);
        // 세션과 발행자 상태를 업데이트
        setSession(session);
        setPublisher(publisher);
      } catch (error) {
        console.error("Error initializing session:", error);
        // setError("세션 초기화 중 오류가 발생했습니다.");
      }
    };
    // 세션 초기화 함수 실행
    initializeSession();

    // 클린업
    return () => {
      // 세션 연결 끊기
      setSession((currentSession: Session | null) => {
        if (currentSession) currentSession.disconnect();
        return null;
      });
      // 모든 구독자의 WebRTC 피어 연결 정리
      setSubscribers((currentSubscribers: Subscriber[]) => {
        currentSubscribers.forEach((subscriber) =>
          subscriber.stream.disposeWebRtcPeer()
        );
        return [];
      });
      // 발행자가 있으면 그 WebRTC 피어 연결도 정리
      setPublisher((currentPublisher: Publisher | null) => {
        if (currentPublisher) currentPublisher.stream.disposeWebRtcPeer();
        return null;
      });
    };
  }, [token]);

  // 검색어 처리
  const filteredVideoList = useMemo(() => {
    if (!videoList?.data) return [];
    return videoList.data.filter((item: VideoDataItem) =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [videoList?.data, searchTerm]);

  // BlazePose 데이터 그리기 함수
  const drawBlazePoseData = useCallback(
    (frameIndex: number) => {
      if (!webcamCanvasRef.current || !challengeQuery.data?.data?.landmarks)
        return;
      const ctx = webcamCanvasRef.current.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(
        0,
        0,
        webcamCanvasRef.current.width,
        webcamCanvasRef.current.height
      );
      const landmarks = challengeQuery.data.data.landmarks[frameIndex];
      if (!landmarks) return;

      const connections = [
        [11, 12],
        [11, 13],
        [13, 15],
        [12, 14],
        [14, 16],
        [11, 23],
        [12, 24],
        [23, 24],
        [23, 25],
        [25, 27],
        [27, 29],
        [29, 31],
        [24, 26],
        [26, 28],
        [28, 30],
        [30, 32],
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

      const bodyJoints = [
        11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32,
      ];
      bodyJoints.forEach((index) => {
        const landmark = landmarks[index];
        ctx.beginPath();
        ctx.arc(
          landmark.x * webcamCanvasRef.current!.width,
          landmark.y * webcamCanvasRef.current!.height,
          5,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = "red";
        ctx.fill();
      });
    },
    [challengeQuery.data]
  );

  // 캔버스 애니메이션 로직
  useEffect(() => {
    let animationFrameId: number;
    const fps = 30;
    const frameInterval = 1000 / fps;
    let lastTime = 0;

    const animate = (currentTime: number) => {
      if (
        !youtubePlayerRef.current ||
        !isYouTubePlaying ||
        !challengeQuery.data?.data?.landmarks ||
        challengeQuery.data.data.landmarks.length === 0
      ) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      if (currentTime - lastTime >= frameInterval) {
        const currentVideoTime = youtubePlayerRef.current.getCurrentTime();
        const frameIndex = Math.floor(currentVideoTime * fps);
        drawBlazePoseData(frameIndex);
        lastTime = currentTime;
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [isYouTubePlaying, challengeQuery.data, drawBlazePoseData]);

  // youtube 이벤트 핸들러
  const handleYouTubeStateChange = (e: {
    target: YouTubePlayer;
    data: number;
  }) => {
    setIsYouTubePlaying(e.data === YouTube.PlayerState.PLAYING);
    if (e.data === YouTube.PlayerState.PLAYING) {
      startRecording();
    } else if (e.data === YouTube.PlayerState.ENDED) {
      stopRecording();
    }
  };

  if (isCheckingHost) {
    return <div>방장 여부 확인 중...</div>;
  }

  if (hostCheckError) {
    return <div>방장 확인 중 오류가 발생했습니다.</div>;
  }

  return (
    <Container>
      <BattleArea>
        <LeftWebcamBox $isSmall={selectedVideo !== null && !isVideoConfirmed}>
          {subscribers[0] ? (
            <>
              <video
                autoPlay={true}
                ref={(video) => video && subscribers[0].addVideoElement(video)}
              />
              {peerReady && <ReadyOverlay>READY</ReadyOverlay>}
            </>
          ) : (
            <EmptyBoxContent>대기중...</EmptyBoxContent>
          )}
        </LeftWebcamBox>
        <DataBox
          $isShifted={selectedVideo !== null && !isVideoConfirmed}
          $isSelected={isVideoConfirmed && selectedVideo !== null}
        >
          {isVideoConfirmed && selectedVideo ? (
            <FullScreenYouTubeContainer>
              <BackIcon onClick={handleCancel}>&larr;</BackIcon>
              <YouTube
                videoId={selectedVideo.youtubeId}
                opts={{
                  height: "622",
                  width: "350",
                  playerVars: { autoplay: 0, controls: 0 },
                }}
                onReady={(e: YouTubePlayer) => {
                  youtubePlayerRef.current = e.target;
                }}
                onStateChange={handleYouTubeStateChange}
              />
              {countdown !== null && (
                <CountdownOverlay>
                  <CountdownText>
                    {countdown === 0 ? "START!" : countdown}
                  </CountdownText>
                </CountdownOverlay>
              )}
            </FullScreenYouTubeContainer>
          ) : (
            <>
              <Title>Battle!</Title>
              <SearchInput
                type="text"
                placeholder="검색어를 입력해주세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {isVideoLoading ? (
                <div>로딩중</div>
              ) : (
                <ScrollableList>
                  {filteredVideoList.map((item: VideoDataItem) => (
                    <ListItem
                      key={item.challengeId}
                      onClick={() => handleItemClick(item.challengeId)}
                      $isSelected={
                        selectedVideo?.challengeId === item.challengeId
                      }
                    >
                      {item.title}
                    </ListItem>
                  ))}
                </ScrollableList>
              )}
            </>
          )}
        </DataBox>
        {selectedVideo && !isVideoConfirmed && (
          <YouTubeBox $isVisible={true}>
            <CloseButton onClick={handleClose}>×</CloseButton>
            <YouTubeContainer>
              <YouTube
                videoId={selectedVideo.youtubeId}
                opts={{
                  height: "480",
                  width: "270",
                  playerVars: { autoplay: 1 },
                }}
              />
            </YouTubeContainer>
            <StartButton onClick={handleConfirm}>select</StartButton>
          </YouTubeBox>
        )}
        <RightWebcamBox $isSmall={selectedVideo !== null && !isVideoConfirmed}>
          {publisher ? (
            <>
              <video
                autoPlay={true}
                ref={(video) => video && publisher.addVideoElement(video)}
              />
              <WebcamCanvas ref={webcamCanvasRef} width={350} height={622} />
              {myReady && <ReadyOverlay>READY</ReadyOverlay>}
            </>
          ) : (
            <EmptyBoxContent>연결중...</EmptyBoxContent>
          )}
        </RightWebcamBox>

        {(!selectedVideo || isVideoConfirmed) && (
          <ButtonContainer>
            {isVideoConfirmed && selectedVideo ? (
              <>
                {isHost && myReady && peerReady && !isRecording && (
                  <ActionButton
                    onClick={handleStart}
                    disabled={!(myReady && peerReady)}
                  >
                    시작
                  </ActionButton>
                )}
                {!isRecording && (
                  <>
                    <ActionButton onClick={toggleReady}>
                      {myReady ? "준비 취소" : "준비"}
                    </ActionButton>
                    <ActionButton
                      onClick={() => {
                        if (session) {
                          exitSessionMutation.mutate(session.sessionId);
                        }
                      }}
                    >
                      나가기
                    </ActionButton>
                  </>
                )}
              </>
            ) : (
              <ActionButton
                onClick={() => {
                  if (session) {
                    exitSessionMutation.mutate(session.sessionId);
                  }
                }}
              >
                나가기
              </ActionButton>
            )}
          </ButtonContainer>
        )}
      </BattleArea>
    </Container>
  );
};

const Container = styled.div`
  min-width: 1120px;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const BattleArea = styled.div`
  min-width: 1080px;
  width: 90vw;
  margin: 20px 20px;
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
  align-items: center;
  position: relative;
  padding: 30px;
`;

const EmptyBoxContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100% - 40px);
  font-family: "Noto Sans KR", sans-serif;
  font-size: 18px;
  color: #a1a1a1;
`;

const LeftWebcamBox = styled.div<{ $isSmall: boolean }>`
  width: ${(props) => (props.$isSmall ? "220px" : "350px")};
  height: ${(props) => (props.$isSmall ? "391px" : "622px")};
  border-radius: 15px;
  border: 1px #fff;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease-in-out;
  position: absolute;
  left: ${(props) => (props.$isSmall ? "30px" : "calc(50% - 575px)")};
  bottom: ${(props) => (props.$isSmall ? "20px" : "50%")};
  transform: ${(props) => (props.$isSmall ? "none" : "translateY(50%)")};
  overflow: hidden;
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
  }
`;

const ReadyOverlay = styled.div`
  position: absolute;
  top: 10px;
  left: 10px;
  background-color: rgba(0, 255, 0, 0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-weight: bold;
  font-size: 18px;
  z-index: 10;
`;

const RightWebcamBox = styled.div<{ $isSmall: boolean }>`
  width: ${(props) => (props.$isSmall ? "220px" : "350px")};
  height: ${(props) => (props.$isSmall ? "391px" : "622px")};
  border-radius: 15px;
  border: 1px #fff;
  background: rgba(255, 255, 255, 0.7);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease-in-out;
  position: absolute;
  right: ${(props) => (props.$isSmall ? "30px" : "calc(50% - 575px)")};
  bottom: ${(props) => (props.$isSmall ? "20px" : "50%")};
  transform: ${(props) => (props.$isSmall ? "none" : "translateY(50%)")};
  overflow: hidden;
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transform: scaleX(-1);
  }
`;
const DataBox = styled.div<{ $isShifted: boolean; $isSelected: boolean }>`
  width: 350px;
  height: 622px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  text-align: center;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 8px 8px 4px 0px rgba(0, 0, 0, 0.1);
  z-index: 1;
  transition: all 0.3s ease-in-out;
  padding: ${(props) => (props.$isSelected ? "0" : "20px 10px")};
  position: ${(props) => (props.$isShifted ? "absolut" : "relative")};
  left: ${(props) => (props.$isShifted ? "50%" : "auto")};
  top: ${(props) => (props.$isShifted ? "50%" : "auto")};
  transform: ${(props) => (props.$isShifted ? "translate(-55%, 0%)" : "none")};
`;

const SearchInput = styled.input`
  width: 90%;
  padding: 10px;
  border: 1px solid #ddd;
  font-size: 16px;
  border-radius: 10px;
  margin: 10px 10px;
`;

const YouTubeBox = styled.div<{ $isVisible: boolean }>`
  width: 350px;
  height: 622px;
  border-radius: 15px;
  display: flex;
  flex-direction: column;
  text-align: center;
  padding: 20px 10px;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 8px 8px 4px 0px rgba(0, 0, 0, 0.1);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%)
    translateX(${(props) => (props.$isVisible ? "190px" : "0")});
  opacity: ${(props) => (props.$isVisible ? 1 : 0)};
  transition: all 0.3s ease-in-out;
  z-index: ${(props) => (props.$isVisible ? 2 : 0)};
  pointer-events: ${(props) => (props.$isVisible ? "auto" : "none")};
  align-items: center;
  justify-content: center;
  gap: 15px;
`;

const YouTubeContainer = styled.div`
  border-radius: 15px;
  overflow: hidden;
  margin-top: 30px;
`;

const StartButton = styled.button`
  border-radius: 8px;
  background: #f7f7f7;
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.15);
  border: none;
  color: #ee5050;
  cursor: pointer;
  width: 280px;
  height: 44px;
  padding-top: 4px;
  font-size: 24px;
  font-weight: 600;
  font-family: "Rajdhani", sans-serif;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 30px;
  cursor: pointer;
  color: #ee5050;
`;

const Title = styled.h1`
  color: #ee5050;
  font-family: Rajdhani;
  font-size: 60px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  letter-spacing: -0.6px;
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

const ListItem = styled.div<{ $isSelected: boolean }>`
  padding: 15px;
  margin: 10px 0;
  cursor: pointer;
  transition: background-color 0.3s;
  border-radius: 8px;
  background: ${(props) =>
    props.$isSelected
      ? "linear-gradient(90deg, #f3e7e7 0%, #ffd6e7 100%)"
      : "linear-gradient(90deg, #f7f7f7 0%, #ffedf6 100%)"};

  &:last-child {
    margin: 0;
  }
`;

const FullScreenYouTubeContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
  border-radius: 15px;
`;

const BackIcon = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  z-index: 10;
  transition: background 0.3s ease;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
`;

const ButtonContainer = styled.div`
  position: absolute;
  bottom: 20px;
  right: 18px;
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const ActionButton = styled.button`
  border-radius: 8px;
  background: #f7f7f7;
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.15);
  border: none;
  color: #ee5050;
  cursor: pointer;
  padding: 10px 15px;
  font-size: 15px;
  font-weight: 600;
  font-family: "Rajdhani", sans-serif;
  transition: all 0.3s ease;

  &:hover {
    background-color: #f0f0f0;
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

const CountdownText = styled.div`
  font-size: 100px;
  color: white;
  font-weight: bold;
`;

const WebcamCanvas = styled.canvas`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;
