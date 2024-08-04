import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "stores/authAtom";

// 커스텀 훅 정의
const useWebSocket = (
  channel: string, // 구독할 채널
  onMessageReceived: (message: any) => void // 메시지 수신 시 호출되는 콜백 함수
) => {
  const clientRef = useRef<Client | null>(null); // Client 객체를 저장할 ref
  const accessToken = useRecoilValue(accessTokenState); // Recoil을 사용하여 액세스 토큰 가져오기

  useEffect(() => {
    if (!channel || !accessToken) return; // 채널 또는 액세스 토큰이 없으면 실행하지 않음

    // WebSocket 클라이언트 설정
    const client = new Client({
      brokerURL: "ws://localhost:8090/ws-stomp", // WebSocket 서버 URL 설정
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`, // WebSocket 연결 시 토큰 포함
      },
      onConnect: () => {
        console.log(`Connected to WebSocket server on channel: ${channel}`);
        // 채널 구독
        client.subscribe(`/sub/chat/room/${channel}`, (message) => {
          onMessageReceived(JSON.parse(message.body)); // 메시지 수신 시 콜백 함수 호출
        });
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket server");
      },
      debug: (str) => {
        console.log(new Date(), str);
      },
      onStompError: (frame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
      onWebSocketError: (event) => {
        console.error("WebSocket error:", event);
      },
      onWebSocketClose: (event) => {
        console.log("WebSocket closed:", event);
      },
    });

    // 클라이언트 활성화
    client.activate();
    clientRef.current = client;

    // 컴포넌트 언마운트 시 클라이언트 비활성화
    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [channel, onMessageReceived, accessToken]);

  // 메시지 전송 함수
  const sendMessage = useCallback(
    (body: any) => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.publish({
          destination: "/pub/chat/message", // 메시지 전송 경로 설정
          body: JSON.stringify(body), // 전송할 메시지
          headers: {
            Authorization: `Bearer ${accessToken}`, // 메시지 전송 시 토큰 포함
          },
        });
      }
    },
    [accessToken]
  );

  return { sendMessage }; // sendMessage 함수 반환
};

export default useWebSocket;
