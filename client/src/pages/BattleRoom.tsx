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
        setError("세션 초기화 중 오류가 발생했습니다.");
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
      <h1>{roomName}</h1>
      <BattleArea>
        <WebcamBox>
          <p>상대방</p>
          {subscribers[0] ? (
            <video
              autoPlay={true}
              ref={(video) => video && subscribers[0].addVideoElement(video)}
            />
          ) : (
            <EmptyBoxContent>대기중...</EmptyBoxContent>
          )}
        </WebcamBox>
        <CenterBox>
          <BoxPlaceholder>추가 내용을 위한 빈 박스</BoxPlaceholder>
        </CenterBox>
        <WebcamBox>
          <p>내 비디오</p>
          {publisher ? (
            <video
              autoPlay={true}
              ref={(video) => video && publisher.addVideoElement(video)}
            />
          ) : (
            <EmptyBoxContent>연결중...</EmptyBoxContent>
          )}
        </WebcamBox>
      </BattleArea>
    </Container>
  );
};

const Container = styled.div`
  min-width: 1120px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px auto;
  flex-direction: column;
  gap: 30px;
`;

const BattleArea = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
  width: 100%;
  max-width: 1080px;
  height: 80vh;
`;

const WebcamBox = styled.div`
  width: 100%;
  height: 100%;
  background-color: #ddd;
  border-radius: 15px;
  overflow: hidden;

  p {
    text-align: center;
    margin: 10px 0;
  }

  video {
    width: 100%;
    height: calc(100% - 40px);
    object-fit: cover;
  }
`;

const CenterBox = styled.div`
  width: 100%;
  height: 100%;
`;

const BoxPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #e0e0e0;
  border-radius: 15px;
  font-size: 18px;
  color: #666;
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
