import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'DOSIyagiMedium';
    src: url('https://fastly.jsdelivr.net/gh/projectnoonnu/noonfonts_2304-2@1.0/DOSIyagiMedium.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
  }
    body{
        color:${(props) => props.theme.colors.primary} // 기본 글자색 설정
    }
`;

export default GlobalStyle;
