import { useEffect, useRef, useCallback } from "react";
import { Client } from "@stomp/stompjs";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "stores/authAtom";
import { baseUrl } from "axiosInstance/constants";

const useWebSocket = () => {
  const clientRef = useRef<Client | null>(null);
  const accessToken = useRecoilValue(accessTokenState);

  useEffect(() => {
    if (!accessToken) return;

    const client = new Client({
      brokerURL: `${baseUrl}/ws-stomp`,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (str) => {
        console.log(new Date(), str);
      },
      onConnect: () => {
        console.log("Connected to WebSocket server");
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket server");
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

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [accessToken]);

  const sendMessage = useCallback(
    (destination: string, body: any) => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.publish({
          destination: destination,
          body: JSON.stringify(body),
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      }
    },
    [accessToken]
  );

  const connectWebSocket = useCallback(() => {
    if (clientRef.current && !clientRef.current.connected) {
      clientRef.current.activate();
    }
  }, []);

  const subscribeToChannel = useCallback(
    (channel: string, callback: (message: any) => void) => {
      if (clientRef.current && clientRef.current.connected) {
        clientRef.current.subscribe(channel, (message) => {
          callback(JSON.parse(message.body));
        });
      }
    },
    []
  );

  return { connectWebSocket, subscribeToChannel, sendMessage };
};

export default useWebSocket;
