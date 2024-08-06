import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { OpenVidu } from "openvidu-browser";
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
      setSession((currentSession) => {
        if (currentSession) currentSession.disconnect();
        return null;
      });
      // 모든 구독자의 WebRTC 피어 연결 정리
      setSubscribers((currentSubscribers) => {
        currentSubscribers.forEach((subscriber) =>
          subscriber.stream.disposeWebRtcPeer()
        );
        return [];
      });
      // 발행자가 있으면 그 WebRTC 피어 연결도 정리
      setPublisher((currentPublisher) => {
        if (currentPublisher) currentPublisher.stream.disposeWebRtcPeer();
        return null;
      });
    };
  }, [token, roomName]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>{roomName}</h1>
      {publisher && (
        <div id="publisher">
          <p>내 비디오</p>
          <video
            autoPlay={true}
            ref={(video) => video && publisher.addVideoElement(video)}
          />
        </div>
      )}
      {subscribers.map((sub, index) => (
        <div key={index} id={`subscriber-${index}`}>
          <p>참가자 {index + 1}</p>
          <video
            autoPlay={true}
            ref={(video) => video && sub.addVideoElement(video)}
          />
        </div>
      ))}
    </div>
  );
};
