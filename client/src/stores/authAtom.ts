import { atom } from "recoil";

// accessToken
export const accessTokenState = atom<string | null>({
  key: "accessTokenState",
  default: sessionStorage.getItem("access_token"),
});

// accessToken 만료 시간
export const accessTokenExpireTimeState = atom<string | null>({
  key: "accessTokenExpireTimeState",
  default: sessionStorage.getItem("access_token_expire_time"),
});

// refreshToken
export const refreshTokenState = atom<string | null>({
  key: "refreshTokenState",
  default: sessionStorage.getItem("refresh_token"),
});

// refreshToken 만료 시간
export const refreshTokenExpireTimeState = atom<string | null>({
  key: "refreshTokenExpireTimeState",
  default: sessionStorage.getItem("refresh_token_expire_time"),
});
