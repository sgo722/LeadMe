import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "stores/authAtom";

const useWebSocket = (
  channel: string,
  onMessageReceived: (message: any) => void
) => {
  const clientRef = useRef<Client | null>(null);
  const accessToken = useRecoilValue(accessTokenState); // Recoil을 사용하여 토큰 가져오기

  useEffect(() => {
    if (!channel || !accessToken) return;

    // WebSocket 클라이언트 설정
    const client = new Client({
      brokerURL: "ws://localhost:8090/ws-stomp", // WebSocket 서버 URL 설정
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`, // WebSocket 연결 시 토큰 포함
      },
      onConnect: () => {
        console.log(`Connected to WebSocket server on channel: ${channel}`);
        // 백엔드에 맞는 경로로 설정
        client.subscribe(`/sub/chat/room/${channel}`, (message) => {
          onMessageReceived(JSON.parse(message.body));
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
          destination: "/pub/chat/message", // 백엔드에 맞는 경로로 설정
          body: JSON.stringify(body),
          headers: {
            Authorization: `Bearer ${accessToken}`, // 메시지 전송 시 토큰 포함
          },
        });
      }
    },
    [accessToken]
  );

  return { sendMessage };
};

export default useWebSocket;
