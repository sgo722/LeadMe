import { Video } from "../types";
import img1 from "assets/image/img1.png";
import img2 from "assets/image/img2.png";

// 임시 데이터

export const videoData: Video[] = [
  {
    id: 1,
    src: img1,
    title: "이주은 챌린지",
    comments: [
      { id: 1, text: "와 정말 멋져요!", user: "댄스팬1" },
      { id: 2, text: "춤 실력이 대단해요", user: "음악매니아" },
      { id: 3, text: "다음 영상도 기대됩니다", user: "챌린지러버" },
      { id: 4, text: "이주은 선수 최고!", user: "치어리더팬" },
    ],
    likes: 1543,
  },
  {
    id: 2,
    src: img2,
    title: "카리나 챌린지",
    comments: [
      { id: 1, text: "카리나 춤선 진짜 예뻐요", user: "aespa팬" },
      { id: 2, text: "이 챌린지 너무 재밌어 보여요", user: "댄스챌린저" },
      { id: 3, text: "저도 따라해보고 싶어요!", user: "kpop팬" },
      { id: 4, text: "카리나 영상 더 올려주세요~", user: "뮤직비디오팬" },
    ],
    likes: 2100,
  },
  {
    id: 3,
    src: img1,
    title: "뉴진스 하입보이 챌린지",
    comments: [
      { id: 1, text: "뉴진스 노래 중에 최고인 것 같아요", user: "하입보이팬" },
      { id: 2, text: "안무가 너무 중독적이에요", user: "댄스매니아" },
      { id: 3, text: "이 챌린지 진짜 유행이네요", user: "트렌드워처" },
      { id: 4, text: "다들 너무 잘하시는 것 같아요", user: "일반인" },
    ],
    likes: 3200,
  },
  {
    id: 4,
    src: img2,
    title: "윈터 챌린지",
    comments: [
      { id: 1, text: "윈터 춤 실력 대박이에요", user: "aespa사랑해" },
      { id: 2, text: "이 부분 안무가 진짜 예뻐요", user: "댄스학도" },
      { id: 3, text: "윈터 표정 연기도 일품!", user: "연기덕후" },
      { id: 4, text: "다음에는 카리나 버전도 보고 싶어요", user: "올라운더팬" },
    ],
    likes: 1876,
  },
  {
    id: 5,
    src: img1,
    title: "아이브 러브다이브 챌린지",
    comments: [
      { id: 1, text: "아이브 노래는 항상 중독적이에요", user: "음악중독자" },
      { id: 2, text: "이 안무 진짜 따라하기 어려워요ㅠㅠ", user: "춤린이" },
      { id: 3, text: "원주민 버전도 보고 싶어요!", user: "아이브팬" },
      {
        id: 4,
        text: "이 챌린지 덕분에 노래가 더 좋아졌어요",
        user: "일반청취자",
      },
    ],
    likes: 4150,
  },
  {
    id: 6,
    src: img2,
    title: "챌린지",
    comments: [
      { id: 1, text: "카리나 춤선 진짜 예뻐요", user: "aespa팬" },
      { id: 2, text: "이 챌린지 너무 재밌어 보여요", user: "댄스챌린저" },
      { id: 3, text: "저도 따라해보고 싶어요!", user: "kpop팬" },
      { id: 4, text: "카리나 영상 더 올려주세요~", user: "뮤직비디오팬" },
    ],
    likes: 2100,
  },
];
