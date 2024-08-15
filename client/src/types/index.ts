// VideoDetail
export interface Comment {
  id: number;
  text: string;
  user: string;
}

// VideoDetail
export interface Video {
  id: number;
  src: string;
  title: string;
  comments: Comment[];
  likes: number;
}

// response 데이터 타입
export interface ResponseData<T> {
  code: number;
  message: string;
  data: T;
  errors: object;
  isSuccess: boolean;
}

// 유저 프로필
export interface UserProfile {
  id: number;
  name: string;
  nickname: string;
  email: string;
  gender: string | null;
  age: number | null;
  roleType: string;
  profileImg: string;
  profileComment: string | null;
  follower: number;
  following: number;
  loginDateTime: string | null;
  userStatus: string;
}

// 피드 영상
export interface Feed {
  title: string;
  userChallengeId: number;
  thumbnail: string;
}

// 피드 댓글
export interface Comment {
  username: string;
  profileImg: string;
  content: string;
  createdData: string;
  lastModifiedDate: string;
}

// 챌린지영상
export interface ChallengeItem {
  challengeId: number;
  youtubeId: string;
  url: string;
  title: string;
  thumbnail: string;
  hashtags: string[];
}

export interface FeedDetail {
  isLiked: boolean;
  nickname: string;
  profileImg: string;
  userId: number;
  title: string;
  userChallengeId: number;
  video: string;
  likes: number;
}
