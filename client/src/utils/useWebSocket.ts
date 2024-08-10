import { useEffect, useRef, useCallback, useState } from "react";
import { Client } from "@stomp/stompjs";
import { useRecoilValue } from "recoil";
import { accessTokenState } from "stores/authAtom";
import { sockUrl } from "axiosInstance/constants";

const useWebSocket = () => {
  const clientRef = useRef<Client | null>(null);
  const accessToken = useRecoilValue(accessTokenState);
  const [subscriptions, setSubscriptions] = useState<Record<string, any>>({});

  const unsubscribeFromChannel = useCallback(
    (channel: string) => {
      if (subscriptions[channel]) {
        subscriptions[channel].unsubscribe();
        setSubscriptions((prevSubscriptions) => {
          const newSubscriptions = { ...prevSubscriptions };
          delete newSubscriptions[channel];
          return newSubscriptions;
        });
        console.log(`Unsubscribed from channel ${channel}`);
      }
    },
    [subscriptions]
  );

  const disconnectWebSocket = useCallback(() => {
    if (clientRef.current) {
      Object.keys(subscriptions).forEach(unsubscribeFromChannel);
      clientRef.current.deactivate();
      console.log("WebSocket connection deactivated");
    }
  }, [subscriptions, unsubscribeFromChannel]);

  useEffect(() => {
    return () => {
      // 컴포넌트가 언마운트될 때 모든 구독을 해제하고 소켓을 비활성화합니다.
      if (clientRef.current) {
        Object.keys(subscriptions).forEach(unsubscribeFromChannel);
        clientRef.current.deactivate();
        console.log("WebSocket connection deactivated");
      }
    };
  }, [unsubscribeFromChannel]);

  const connectWebSocket = useCallback(() => {
    if (!clientRef.current) {
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
    } else if (!clientRef.current.connected) {
      clientRef.current.activate();
      console.log("WebSocket connection activated");
    }
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

  const subscribeToChannel = useCallback(
    (channel: string, callback: (message: any) => void) => {
      if (clientRef.current && clientRef.current.connected) {
        if (subscriptions[channel]) {
          console.log(`Already subscribed to channel ${channel}`);
          return;
        }

        const subscription = clientRef.current.subscribe(channel, (message) => {
          console.log(
            `받은 메세지 / Message received from ${channel}:`,
            message.body
          );
          callback(JSON.parse(message.body));
        });

        setSubscriptions((prevSubscriptions) => ({
          ...prevSubscriptions,
          [channel]: subscription,
        }));
        console.log("구독 중인 채널", subscribeToChannel);

        console.log(`Subscribed to channel ${channel}`);
      } else {
        console.error("WebSocket is not connected");
      }
    },
    [subscriptions]
  );

  return {
    connectWebSocket,
    disconnectWebSocket,
    subscribeToChannel,
    unsubscribeFromChannel,
    sendMessage,
  };
};

export default useWebSocket;
