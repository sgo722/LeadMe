import styled from "styled-components";
export const FixedDOM = () => {
  return (
    <FixedDOMWrapper id="fixed">
      <h2>친구와 챌린지 배틀까지</h2>
      <p>친구와 실시간으로 춤 배틀을 펼쳐보세요!</p>
    </FixedDOMWrapper>
  );
};

const FixedDOMWrapper = styled.div`
  text-align: right;
  flex-direction: column;
  justify-content: center;
  width: 600px;
  height: 400px;
  position: fixed;
  font-size: 24px;
  top: 50%;
  right: 10px;
  transform: translate(-20%, -50%);
  display: none;
  color: #fff;
  z-index: 0;
  pointer-events: none;
  & > h2 {
    color: #f6efed;
    font-size: 50px;
    font-weight: 600;
    margin-bottom: 32px;
    font-family: "Noto Sans KR", sans-serif;
  }

  & > p {
    color: #c9c9c9;
    font-size: 27px;
    font-weight: 400;
    font-family: "Noto Sans KR", sans-serif;
  }
`;
