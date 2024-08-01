// src/stores/authAtom.ts
import { atom } from "recoil";
import { UserProfile } from "types"; // UserProfile 인터페이스 가져오기

export const userProfileState = atom<UserProfile | null>({
  key: "userProfileState",
  default: null,
});

export const accessTokenState = atom<string | null>({
  key: "accessTokenState",
  default: null,
});

export const accessTokenExpireTimeState = atom<string | null>({
  key: "accessTokenExpireTimeState",
  default: null,
});

export const refreshTokenState = atom<string | null>({
  key: "refreshTokenState",
  default: null,
});

export const refreshTokenExpireTimeState = atom<string | null>({
  key: "refreshTokenExpireTimeState",
  default: null,
});
