import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { OpenVidu } from "openvidu-browser";
import styled from "styled-components";
import type {
  Publisher,
  Session,
  Subscriber,
  StreamEvent,
} from "openvidu-browser";

const dummyData = [
  { id: 1, title: "첫 번째 동작" },
  { id: 2, title: "두 번째 동작" },
  { id: 3, title: "세 번째 동작" },
  { id: 4, title: "네 번째 동작" },
  { id: 6, title: "다섯 번째 동작" },
  { id: 7, title: "다섯 번째 동작" },
  { id: 8, title: "다섯 번째 동작" },
  { id: 9, title: "다섯 번째 동작" },
  { id: 10, title: "다섯 번째 동작" },
  { id: 11, title: "다섯 번째 동작" },
  { id: 12, title: "다섯 번째 동작" },
  { id: 13, title: "다섯 번째 동작" },
];

// 세션 : 화상 회의 가상 공간
// 발행자(publisher) : 자신의 오디오/비디오 스트림을 세션에 전송하는 참가자
// 구독자(Subscriber) : 다른 참가자가 발행한 스트림을 수신하는 참가자, 한 참가자는 여러 스트림을 동시에 구독 가능
// 스트림 : 실시간으로 전송되는 오디오, 비디오 등 발행자가 생성하고 구독자가 수신
// 로컬 비디오 스트림 : 사용자 자신의 웹캠에서 캡처된 비디오 스트림, 이는 사용자가 발행하는 스트림으로 다른 참가자들에게 전송
// 피어 : WebRTC에서 직접 연결되는 두 엔드포인트,

export const BattleRoom: React.FC = () => {
  const location = useLocation();
  const { token, roomName } = location.state as {
    token: string;
    roomName: string;
  };
  const [session, setSession] = useState<Session | null>(null); //OpenVidu 세션 상태 관리
  const [publisher, setPublisher] = useState<Publisher | null>(null); // 로컬 비디오 스트림 발행자 상태 관리
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]); // 원격 비디오 스트림 구독자 목록 상태 관리
  const [error, setError] = useState<string | null>(null); // 에러 상태 관리

  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  const handleItemClick = (id: number) => {
    setSelectedItem(id);
  };

  const handleClose = () => {
    setSelectedItem(null);
  };

  // 걍 임시로 썻음 빌드할때 에러나서
  useEffect(() => {
    if (session) {
      console.log("세션이 설정되었습니다:", session);
      // 여기서 session을 사용한 추가 로직을 구현할 수 있습니다.
    }
  }, [session]);

  // 컴포넌트가 마운트될때나 token, roomName이 변경될 때 실행
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
  }, [token, roomName]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container>
      <BattleArea>
        <LeftWebcamBox $isSmall={selectedItem !== null}>
          {subscribers[0] ? (
            <video
              autoPlay={true}
              ref={(video) => video && subscribers[0].addVideoElement(video)}
            />
          ) : (
            <EmptyBoxContent>대기중...</EmptyBoxContent>
          )}
        </LeftWebcamBox>
        <DataBox $isShifted={selectedItem !== null}>
          <Title>Battle!</Title>
          <ScrollableList>
            {dummyData.map((item) => (
              <ListItem
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                $isSelected={selectedItem === item.id}
              >
                {item.title}
              </ListItem>
            ))}
          </ScrollableList>
        </DataBox>
        {selectedItem && (
          <YouTubeBox $isVisible={selectedItem !== null}>
            <CloseButton onClick={handleClose}>×</CloseButton>
          </YouTubeBox>
        )}
        <RightWebcamBox $isSmall={selectedItem !== null}>
          {publisher ? (
            <video
              autoPlay={true}
              ref={(video) => video && publisher.addVideoElement(video)}
            />
          ) : (
            <EmptyBoxContent>연결중...</EmptyBoxContent>
          )}
        </RightWebcamBox>
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
  gap: 50px;
  padding: 20px;
`;

const EmptyBoxContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: calc(100% - 40px);
  font-size: 18px;
  color: #666;
`;

const LeftWebcamBox = styled.div<{ $isSmall: boolean }>`
  width: ${(props) => (props.$isSmall ? "250px" : "350px")};
  height: ${(props) => (props.$isSmall ? "444px" : "622px")};
  background-color: #943636;
  border-radius: 15px;
  transition: all 0.3s ease-in-out;
  position: absolute;
  left: ${(props) => (props.$isSmall ? "20px" : "calc(50% - 575px)")};
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

const RightWebcamBox = styled.div<{ $isSmall: boolean }>`
  width: ${(props) => (props.$isSmall ? "250px" : "350px")};
  height: ${(props) => (props.$isSmall ? "444px" : "622px")};
  background-color: #943636;
  border-radius: 15px;
  transition: all 0.3s ease-in-out;
  position: absolute;
  right: ${(props) => (props.$isSmall ? "20px" : "calc(50% - 575px)")};
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
const DataBox = styled.div<{ $isShifted: boolean }>`
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
  z-index: 1;
  transition: all 0.3s ease-in-out;
  position: ${(props) => (props.$isShifted ? "absolut" : "relative")};
  left: ${(props) => (props.$isShifted ? "50%" : "auto")};
  top: ${(props) => (props.$isShifted ? "50%" : "auto")};
  transform: ${(props) => (props.$isShifted ? "translate(-55%, 0%)" : "none")};
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
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #333;
  &:hover {
    color: #ee5050;
  }
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
  overflow-y: auto;
  border-radius: 10px;
  padding: 10px;
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
`;
