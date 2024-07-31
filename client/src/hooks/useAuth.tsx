import { useRecoilState } from "recoil";
import {
  accessTokenState,
  accessTokenExpireTimeState,
  refreshTokenState,
  refreshTokenExpireTimeState,
} from "../stores/authAtom";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "axiosInstance/constants";

interface RefreshTokenResponse {
  access_token: string;
  access_token_expire_time: string;
}

const useAuth = () => {
  const [accessToken, setAccessToken] = useRecoilState(accessTokenState);
  const [accessTokenExpireTime, setAccessTokenExpireTime] = useRecoilState(
    accessTokenExpireTimeState
  );
  const [refreshToken, setRefreshToken] = useRecoilState(refreshTokenState);
  const [refreshTokenExpireTime, setRefreshTokenExpireTime] = useRecoilState(
    refreshTokenExpireTimeState
  );
  const navigate = useNavigate();

  // accessToken 유효성 검사
  const isTokenExpired = (expireTime: string | null): boolean => {
    if (!expireTime) return true;
    return new Date().getTime() > new Date(expireTime).getTime();
  };

  const refreshAccessTokenMutation = useMutation<
    RefreshTokenResponse,
    Error,
    void
  >({
    mutationFn: async (): Promise<RefreshTokenResponse> => {
      const response = await fetch(`${baseUrl}/api/token/issue`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`, // Header에 refresh token 추가
        },
      });

      if (!response.ok) {
        throw new Error("Failed to refresh access token");
      }

      return response.json();
    },
    onSuccess: (data: RefreshTokenResponse) => {
      sessionStorage.setItem("access_token", data.access_token);
      sessionStorage.setItem(
        "access_token_expire_time",
        data.access_token_expire_time
      );
      setAccessToken(data.access_token);
      setAccessTokenExpireTime(data.access_token_expire_time);
    },
    onError: (error: Error) => {
      console.error("Failed to refresh access token", error);
    },
  });

  const logout = () => {
    setAccessToken(null);
    setAccessTokenExpireTime(null);
    setRefreshToken(null);
    setRefreshTokenExpireTime(null);
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("access_token_expire_time");
    sessionStorage.removeItem("refresh_token");
    sessionStorage.removeItem("refresh_token_expire_time");
  };

  const refreshAccessToken = async (): Promise<void> => {
    if (isTokenExpired(refreshTokenExpireTime)) {
      logout();
      navigate("/home");
      alert("로그인 세션이 만료되었습니다. 재로그인 해주세요.");
      return;
    }

    try {
      await refreshAccessTokenMutation.mutateAsync();
    } catch (error) {
      console.error("Failed to refresh access token", error);
    }
  };

  const getAccessToken = async (): Promise<string | null> => {
    if (isTokenExpired(accessTokenExpireTime)) {
      await refreshAccessToken();
    }
    return accessToken;
  };

  return { getAccessToken, logout };
};

export default useAuth;
