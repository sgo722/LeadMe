// 일단 때려박고 나중에 리팩토링 ㄱㄱ

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
