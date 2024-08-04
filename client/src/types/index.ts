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
  loginDateTime: string | null;
  userStatus: string;
}
