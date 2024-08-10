import { useEffect, useState } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import {
  accessTokenState,
  accessTokenExpireTimeState,
  refreshTokenState,
  refreshTokenExpireTimeState,
} from "../stores/authAtom";
import { baseUrl } from "axiosInstance/constants";

interface RefreshTokenResponse {
  accessToken: string;
  accessTokenExpireTime: string;
}

interface ResponseData {
  code: number;
  message: string;
  data: RefreshTokenResponse;
  errors: object;
  isSuccess: boolean;
}

const useAuth = () => {
  const setAccessToken = useSetRecoilState(accessTokenState);
  const [accessTokenExpireTime, setAccessTokenExpireTime] = useRecoilState(
    accessTokenExpireTimeState
  );
  const [refreshToken, setRefreshToken] = useRecoilState(refreshTokenState);
  const [refreshTokenExpireTime, setRefreshTokenExpireTime] = useRecoilState(
    refreshTokenExpireTimeState
  );
  const [timerId, setTimerId] = useState<NodeJS.Timeout | null>(null);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // 로그아웃
  const logout = () => {
    axios
      .post(`${baseUrl}/api/v1/user/session/remove`)
      .then(() => {
        // 세션 삭제 및 토큰 제거
        setAccessToken(null);
        setAccessTokenExpireTime(null);
        setRefreshToken(null);
        setRefreshTokenExpireTime(null);
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token_expire_time");
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("refresh_token_expire_time");
        sessionStorage.removeItem("timer_started");
        sessionStorage.removeItem("user_profile");

        if (timerId) {
          clearTimeout(timerId);
          setTimerId(null);
        }
        if (intervalId) {
          clearInterval(intervalId);
          setIntervalId(null);
        }

        navigate("/home");
      })
      .catch((error) => {
        console.error("Failed to logout:", error);
      });
  };

  // refreshToken 유효성 체크
  const isRefreshTokenValid = (): boolean => {
    if (!refreshTokenExpireTime) {
      return false;
    }

    const expireTimeInMs = new Date(refreshTokenExpireTime).getTime();
    const currentTimeInMs = new Date().getTime();
    return expireTimeInMs > currentTimeInMs;
  };

  // accessToken 재발급
  const mutation = useMutation<RefreshTokenResponse, Error, void>({
    mutationFn: async (): Promise<RefreshTokenResponse> => {
      if (!isRefreshTokenValid()) {
        alert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
        logout();
        throw new Error("Invalid refresh token");
      }

      const response = await axios.post<ResponseData>(
        `${baseUrl}/api/token/issue`,
        {},
        {
          headers: { Authorization: `Bearer ${refreshToken}` },
        }
      );
      return response.data.data;
    },
    onSuccess: (data: RefreshTokenResponse) => {
      setAccessToken(data.accessToken);
      setAccessTokenExpireTime(data.accessTokenExpireTime);
      sessionStorage.setItem("access_token", data.accessToken);
      sessionStorage.setItem(
        "access_token_expire_time",
        data.accessTokenExpireTime
      );

      if (timerId) {
        clearTimeout(timerId);
        setTimerId(null);
      }
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      // 새로운 타이머 시작
      startTokenExpiryTimer(data.accessTokenExpireTime);
    },
    onError: (error: Error) => {
      console.error("Failed to refresh access token:", error);
      if (error.message !== "Invalid refresh token") {
        alert("로그인 세션이 만료되었습니다. 다시 로그인해 주세요.");
        logout();
      }
    },
  });

  // 타이머
  const startTokenExpiryTimer = (expireTime: string) => {
    if (timerId) {
      clearTimeout(timerId);
    }
    if (intervalId) {
      clearInterval(intervalId);
    }

    const expireTimeInMs =
      new Date(expireTime).getTime() - new Date().getTime();
    const timer = setTimeout(() => {
      mutation.mutate();
    }, expireTimeInMs - 10 * 60 * 1000); // 만료 시간 10분 전 재발급
    setTimerId(timer);

    sessionStorage.setItem("timer_started", "true");
  };

  useEffect(() => {
    if (accessTokenExpireTime && !sessionStorage.getItem("timer_started")) {
      startTokenExpiryTimer(accessTokenExpireTime);
    }
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [accessTokenExpireTime]);

  return { logout };
};

export default useAuth;
