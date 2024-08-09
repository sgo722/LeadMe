import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "stores/authAtom";
import { sockUrl } from "axiosInstance/constants";

const useWebSocket = () => {
  const clientRef = useRef<Client | null>(null);
  const accessToken = useRecoilValue(accessTokenState);
  const [subscriptions, setSubscriptions] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!accessToken) return;

    const client = new Client({
      brokerURL: `${sockUrl}/ws-stomp`,
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
        console.log(`Message sent to ${destination}:`, body);
      } else {
        console.error("WebSocket is not connected");
      }
    },
    [accessToken]
  );

  const connectWebSocket = useCallback(() => {
    if (clientRef.current && !clientRef.current.connected) {
      clientRef.current.activate();
      console.log("WebSocket connection activated");
    }
  }, []);

  const subscribeToChannel = useCallback(
    (channel: string, callback: (message: any) => void) => {
      if (clientRef.current && clientRef.current.connected) {
        // 이미 구독된 채널이 있으면 새 구독을 만들지 않음
        if (subscriptions[channel]) {
          console.log(`Already subscribed to channel ${channel}`);
          return;
        }

        const subscription = clientRef.current.subscribe(channel, (message) => {
          console.log(`Message received from ${channel}:`, message.body);
          callback(JSON.parse(message.body));
        });

        setSubscriptions((prevSubscriptions) => ({
          ...prevSubscriptions,
          [channel]: subscription,
        }));

        console.log(`Subscribed to channel ${channel}`);
      } else {
        console.error("WebSocket is not connected");
      }
    },
    [subscriptions]
  );

  return { connectWebSocket, subscribeToChannel, sendMessage };
};

export default useWebSocket;
