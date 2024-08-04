import { useRecoilValue } from "recoil";
import { IsEnteredAtom } from "stores/index";
import { useRef } from "react";
import { Scroll, useScroll } from "@react-three/drei";
import styled from "styled-components";
import { useFrame } from "@react-three/fiber";
import { useNavigate } from "react-router-dom";

export const MovingDOM = () => {
  const isEntered = useRecoilValue(IsEnteredAtom);
  const fixed = document.getElementById("fixed"); // FixedDOM에서 아이디가 fixed인거 찾아옴
  const scroll = useScroll();
  const nav = useNavigate();
  const articleRef1 = useRef<HTMLDivElement>(null);
  const articleRef2 = useRef<HTMLDivElement>(null);
  const articleRef3 = useRef<HTMLDivElement>(null);
  const articleRef4 = useRef<HTMLDivElement>(null);
  const articleRef8 = useRef<HTMLDivElement>(null);

  useFrame(() => {
    if (
      !isEntered ||
      !fixed ||
      !articleRef1.current ||
      !articleRef2.current ||
      !articleRef3.current ||
      !articleRef4.current ||
      !articleRef8.current
    )
      return;
    articleRef1.current.style.opacity = `${1 - scroll.range(0, 1 / 8)}`;
    articleRef2.current.style.opacity = `${1 - scroll.range(1 / 8, 1 / 8)}`; // 1/8에서 1/8 스크롤 할동안 사용
    articleRef3.current.style.opacity = `${scroll.curve(2 / 8, 1 / 8)}`; // 2/8에서 1/8 스크롤 할동안 사용
    articleRef4.current.style.opacity = `${scroll.curve(3 / 8, 1 / 8)}`; // 2/8에서 1/8 스크롤 할동안 사용

    if (scroll.visible(4 / 8, 3 / 8)) {
      fixed.style.display = "flex";
      fixed.style.opacity = `${scroll.curve(4 / 8, 3 / 8)}`;
    } else {
      fixed.style.display = "none";
    }
    articleRef8.current.style.opacity = `${scroll.range(7 / 8, 1 / 8)}`; // 2/8에서 1/8 스크롤 할동안 사용
  });

  if (!isEntered) return null;

  return (
    <Scroll html>
      <ArticleWrapper ref={articleRef1}>
        <TitleBox>
          <H1 className="rajdhani-semibold">LeadMe</H1>
        </TitleBox>
      </ArticleWrapper>
      <ArticleWrapper ref={articleRef2}>
        <RightBox>
          <H2>플랫폼 검색을 한 번에</H2>
          <P>유튜브, 틱톡의 모든 숏츠 영상을 한 번의 검색으로</P>
        </RightBox>
      </ArticleWrapper>
      <ArticleWrapper ref={articleRef3}>
        <LeftBox>
          <H2>AI 기반 분석 레포트 제공</H2>
          <P>AI 기술을 활용한 분석 보고서로 춤 연습을 더욱 효율적으로</P>
        </LeftBox>
      </ArticleWrapper>
      <ArticleWrapper className="height-4" ref={articleRef4}></ArticleWrapper>
      <ArticleWrapper ref={articleRef8}>
        <EnterBtn onClick={() => nav("/home")}>START</EnterBtn>
      </ArticleWrapper>
    </Scroll>
  );
};

const ArticleWrapper = styled.div`
  font-family: "Rajdhani", sans-serif;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  opacity: 0;
  width: 100vw;
  height: 100vh;
  &.height-4 {
    height: 400vh;
  }
  background-color: transparent;
  font-size: 24px;
  padding: 40px;
`;

const TitleBox = styled.div`
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  align-self: flex-start;
  min-width: fit-content;
  height: 400px;
`;

const H1 = styled.h1`
  color: #f6efed;
  font-size: 140px;
`;

const H2 = styled.h2`
  color: #f6efed;
  font-size: 54px;
  font-weight: 600;
  margin-bottom: 32px;
`;

const P = styled.p`
  color: #c9c9c9;
  font-size: 30px;
  font-weight: 400;
`;

const LeftBox = styled.div`
  padding: 50px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: flex-start;
  min-width: fit-content;
  height: 400px;
`;

const RightBox = styled.div`
  text-align: right;
  padding: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-self: flex-end;
  min-width: fit-content;
  height: 400px;
  & > h1 {
    margin-bottom: 30px;
    font-size: 40px;
    font-weight: bold;
  }
`;

const EnterBtn = styled.button`
  color: #fffaec;
  position: relative;
  bottom: -200px;
  font-size: 40px;
  font-weight: 600;
  font-family: "Rajdhani", sans-serif;
  flex-direction: column;
  justify-content: center;
  background-color: rgba(234, 234, 234, 0.4);
  border: none;
  border-radius: 8px;
  padding: 12px 80px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.1);
    background-color: rgba(246, 239, 237, 0.8);
  }
`;
