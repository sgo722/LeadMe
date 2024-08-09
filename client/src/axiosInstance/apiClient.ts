import axios, { AxiosRequestConfig } from "axios";
import { baseUrl } from "axiosInstance/constants";

// getJWTHeader 함수 : jwt 토큰을 받아 Authorization 헤더 객체를 생성
// 파라미터 : jwt토큰 넣어줘야함
// 반환값: { Authorization: "Bearer 토큰"}
export const getJWTHeader = (): Record<string, string> => {
  const token = sessionStorage.getItem("access_token");
  console.log("토큰값임: ", token);
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// config 객체에 baseURL 설정
const config: AxiosRequestConfig = { baseURL: baseUrl };
// axios.create()로 기본 설정이 적용된 axios 인스턴스 생성
export const axiosInstance = axios.create(config);

// 사용할때
// 인증 필요없는 요청
// axiosInstance.get('/endpoint');

// jwt 인증이 필요한 요청
// const token = 스토어에서 jwt토큰 가져오기
// axiosInstance.get('/endpoint', {headers:getJWTHeader()})
