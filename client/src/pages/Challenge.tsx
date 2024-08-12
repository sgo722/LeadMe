import { useEffect, useState } from "react";
import Header from "components/Header";
import styled from "styled-components";
import playButtonIcon from "assets/icons/playButton.png";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { ChallengeItem, ResponseData } from "types";
import { baseUrl } from "axiosInstance/constants";

const Challenge: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 관리

  const mutationChallenge = useMutation<ChallengeItem[], Error, void>({
    mutationFn: async () => {
      const response = await axios.get<ResponseData<ChallengeItem[]>>(
        `${baseUrl}/api/v1/challenge`
      );
      return response.data.data;
    },
    onSuccess: (data: ChallengeItem[]) => {
      console.log(data);
      setChallenges(data);
      setIsLoading(false); // 데이터 로드 완료
    },
    onError: (error: Error) => {
      console.error("Error fetching Challenge:", error);
      setIsLoading(false); // 에러 발생 시 로딩 종료
    },
  });

  useEffect(() => {
    mutationChallenge.mutate();
  }, []);

  const sections = [];
  for (let i = 0; i < challenges.length; i += 4) {
    sections.push(challenges.slice(i, i + 4));
  }

  return (
    <>
      <Header />
      <Container>
        {isLoading ? (
          <PlaceholderMainSection></PlaceholderMainSection>
        ) : (
          sections.map((section, index) => (
            <MainSection key={index}>
              {section.map((img) => (
                <ContentSection key={img.challengeId}>
                  <TitleSection>
                    <MainTitle>{img.title}</MainTitle>
                    <PlayButton src={playButtonIcon} />
                  </TitleSection>
                  <SubTitle>{img.hashtags.join(" ")}</SubTitle>{" "}
                  <FeedImage src={img.thumbnail} />
                </ContentSection>
              ))}
            </MainSection>
          ))
        )}
      </Container>
    </>
  );
};

export default Challenge;

const Container = styled.div`
  min-width: 1120px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px auto;
  flex-direction: column;
  gap: 30px;
`;

const PlayButton = styled.img`
  width: 50px;
  height: 50px;
  margin-bottom: -5px;
  margin-right: -6px;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const FeedImage = styled.img`
  width: 200px;
  height: 358px;
  border-radius: 8px;
  object-fit: cover;
  transition: transform 0.2s ease;
`;

const MainTitle = styled.h1`
  font-size: 19px;
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 600;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: transform 0.2s ease;
`;

const SubTitle = styled.div`
  font-size: 14px;
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 500;
  margin-top: -10px;
  margin-bottom: 18px;
  width: 100%;
  height: 20px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: transform 0.2s ease;
`;

const MainSection = styled.div`
  width: 1080px;
  border-radius: 20px;
  background: linear-gradient(
    118deg,
    rgba(255, 255, 255, 0.26) 5.72%,
    rgba(255, 255, 255, 0.07) 94.28%
  );
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(25px);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding: 35px 40px 40px;
`;

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  width: 201px;

  &:hover
    ${PlayButton},
    &:hover
    ${FeedImage},
    &:hover
    ${MainTitle},
    &:hover
    ${SubTitle} {
    transform: scale(1.05);
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  width: 200px;
  height: 40px;
  margin-bottom: 8px;
`;

const PlaceholderMainSection = styled(MainSection)`
  height: 529px;
  justify-content: space-between;
`;
