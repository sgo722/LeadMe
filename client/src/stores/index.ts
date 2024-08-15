import { atom } from "recoil";

export const IsEnteredAtom = atom<boolean>({
  //atom은 제네릭을 지원해서 자동으로 타입 추정이 가능하지만 명시적으로 달아줘도 됨
  key: "IsEnteredAtom",
  default: false,
});

export const IsShortsVisibleAtom = atom<boolean>({
  key: "IsShortsVisibleAtom",
  default: false,
});

export const RecordedVideoUrlAtom = atom<string | null>({
  key: "RecordedVideoUrlAtom",
  default: null,
});
