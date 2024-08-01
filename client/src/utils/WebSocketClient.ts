import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";

// 웹소켓 훅
const useWebSocket = (
  channel: string,
  onMessageReceived: (message: any) => void
) => {
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!channel) return;

    // WebSocket 클라이언트 설정
    const client = new Client({
      brokerURL: "ws://localhost:8090/ws-stomp", // WebSocket 서버 URL 설정
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
  }, [channel, onMessageReceived]);

  // 메시지 전송 함수
  const sendMessage = useCallback((body: any) => {
    if (clientRef.current && clientRef.current.connected) {
      clientRef.current.publish({
        destination: "/pub/chat/message", // 백엔드에 맞는 경로로 설정
        body: JSON.stringify(body),
      });
    }
  }, []);

  return { sendMessage };
};

export default useWebSocket;
