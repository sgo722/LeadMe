import styled from "styled-components";
// import { SiNaver } from "react-icons/si";
import { FcGoogle } from "react-icons/fc";
import { RiKakaoTalkFill } from "react-icons/ri";
import { baseUrl } from "axiosInstance/constants";
interface LoginModalProps {
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  return (
    <Overlay onClick={onClose}>
      <Container onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <Title>Login</Title>

        <SNSLink href={`${baseUrl}/oauth2/authorization/kakao`}>
          <SNSBox $bgColor="#FFF039" $hoverColor="#FFEC00">
            <IconWrapper>
              <RiKakaoTalkFill style={{ color: "#533030" }} />
            </IconWrapper>
            <span>Kakao 로그인</span>
          </SNSBox>
        </SNSLink>

        {/* <SNSLink href={`${baseUrl}/oauth2/authorization/naver`}>
          <SNSBox $bgColor="#03CF5D" $hoverColor="#0ec25c">
            <IconWrapper>
              <SiNaver
                style={{ color: "#ffffff", width: "17px", height: "17px" }}
              />
            </IconWrapper>
            <span style={{ color: "#ffffff" }}>Naver 로그인</span>
          </SNSBox>
        </SNSLink> */}

        <SNSLink href={`${baseUrl}/oauth2/authorization/google`}>
          <SNSBox $bgColor="#ffffff" $hoverColor="#f3f3f3">
            <IconWrapper>
              <FcGoogle />
            </IconWrapper>
            <span>Google 로그인</span>
          </SNSBox>
        </SNSLink>
      </Container>
    </Overlay>
  );
};

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  min-width: 1120px;
`;

const Container = styled.div`
  width: 400px;
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  padding: 20px;
  gap: 10px;
  z-index: 9999;
  border-radius: 10px;
  border: 3px solid rgba(223, 223, 223, 0.4);
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
  position: relative;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 24px;
  color: #ee5050;
  cursor: pointer;
`;

const Title = styled.h1`
  font-family: "Rajdhani", sans-serif;
  font-size: 40px;
  font-weight: 600;
  margin-bottom: 30px;
`;

interface BgProps {
  $bgColor: string;
  $hoverColor: string;
}

const SNSLink = styled.a`
  display: block;
  width: 100%;
  text-decoration: none;
`;

const SNSBox = styled.div<BgProps>`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  margin-bottom: 10px;
  transition: 0.3s ease;
  background-color: ${(props) => props.$bgColor};
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.15);
  cursor: pointer;

  span {
    flex: 1;
    text-align: center;
    color: #444444;
    font-family: Roboto;
    font-size: 18px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
  }

  &:hover {
    background-color: ${(props) => props.$hoverColor};
  }
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 8px 0 0 8px;

  svg {
    width: 24px;
    height: 24px;
  }
`;

export default LoginModal;
