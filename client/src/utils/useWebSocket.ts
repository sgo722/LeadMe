import { useEffect, useRef, useCallback, useState } from "react";
import { Client, StompSubscription, IFrame, IMessage } from "@stomp/stompjs";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "stores/authAtom";
import { sockUrl } from "axiosInstance/constants";

export interface ChatMessageDto {
  type: string;
  roomId: number;
  userId: number;
  nickname: string;
  message: string;
  time: string;
  status: string;
}
interface WebSocketHook {
  connectWebSocket: () => void;
  subscribeToChannel: (
    channel: string,
    callback: (message: ChatMessageDto) => void
  ) => void;
  sendMessage: (destination: string, body: ChatMessageDto) => void;
}

const useWebSocket = (): WebSocketHook => {
  const clientRef = useRef<Client | null>(null);
  const accessToken = useRecoilValue(accessTokenState);
  const [subscriptions, setSubscriptions] = useState<
    Record<string, StompSubscription>
  >({});

  useEffect(() => {
    if (!accessToken || (clientRef.current && clientRef.current.connected))
      return;

    const client = new Client({
      brokerURL: `${sockUrl}/ws-stomp`,
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (str: string) => {
        console.log(new Date(), str);
      },
      onConnect: () => {
        console.log("Connected to WebSocket server");
      },
      onDisconnect: () => {
        console.log("Disconnected from WebSocket server");
      },
      onStompError: (frame: IFrame) => {
        console.error("Broker reported error: " + frame.headers["message"]);
        console.error("Additional details: " + frame.body);
      },
      onWebSocketError: (event: Event) => {
        console.error("WebSocket error:", event);
      },
      onWebSocketClose: (event: CloseEvent) => {
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
    (destination: string, body: ChatMessageDto) => {
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
    } else if (clientRef.current && clientRef.current.connected) {
      console.log("WebSocket is already connected");
    }
  }, []);

  const subscribeToChannel = useCallback(
    (channel: string, callback: (message: ChatMessageDto) => void) => {
      if (clientRef.current && clientRef.current.connected) {
        if (subscriptions[channel]) {
          console.log(`Already subscribed to channel ${channel}`);
          return;
        }

        const subscription = clientRef.current.subscribe(
          channel,
          (message: IMessage) => {
            console.log(`Message received from ${channel}:`, message.body);
            callback(JSON.parse(message.body) as ChatMessageDto);
          }
        );

        setSubscriptions((prevSubscriptions) => ({
          ...prevSubscriptions,
          [channel]: subscription,
        }));
        console.log("구독 중인 채널", Object.keys(subscriptions));

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
