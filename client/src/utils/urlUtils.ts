// Mixed Content 경고 해결 : HTTPS 페이지에서 HTTP 리소스를 로드하려고 할때 발생
export const ensureHttps = (url: string) => {
  return url.replace(/^http:/, "https:");
};
