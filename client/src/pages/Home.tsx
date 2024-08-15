import styled, { keyframes } from "styled-components";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ChallengeItem, ResponseData } from "types";
import { baseUrl } from "axiosInstance/constants";
import { useNavigate } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";

const Home: React.FC = () => {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const navigate = useNavigate();

  const mutationChallenge = useMutation<ChallengeItem[], Error, void>({
    mutationFn: async () => {
      const response = await axios.get<ResponseData<ChallengeItem[]>>(
        `${baseUrl}/api/v1/challenge`
      );
      return response.data.data;
    },
    onSuccess: (data: ChallengeItem[]) => {
      setChallenges(data);
    },
    onError: (error: Error) => {
      console.error("Error fetching Challenge:", error);
    },
  });

  useEffect(() => {
    mutationChallenge.mutate();
  }, []);

  const handleClickMore = () => {
    navigate("/guide");
  };

  const renderImages = (indexes: number[]) => {
    return indexes.map((index) => {
      if (challenges.length > index) {
        const challenge = challenges[index];
        return (
          <Image
            key={index}
            onClick={() => navigate(`/challenge/${challenge.youtubeId}`)}
            src={challenge.thumbnail}
            alt={challenge.title}
          />
        );
      }
      return null;
    });
  };

  return (
    <>
      <Header showGuide={true} />
      <Container>
        <MainSection>
          <SearchBar navigation />
          <TitleSection>
            <SubTitle onClick={handleClickMore}>
              more guide
              <StyledChevronIcon />
            </SubTitle>
          </TitleSection>
          <FeedGrid>
            {challenges.length >= 21 ? (
              renderImages([21, 17, 10, 20])
            ) : (
              <None>Loading</None>
            )}
          </FeedGrid>
        </MainSection>
      </Container>
    </>
  );
};

const Container = styled.div`
  min-width: 1120px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 50px auto;
`;

const MainSection = styled.div`
  width: 760px;
  height: 470px;
  border-radius: 20px;
  background: linear-gradient(
    118deg,
    rgba(255, 255, 255, 0.26) 5.72%,
    rgba(255, 255, 255, 0.07) 94.28%
  );
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(25px);
  display: flex;
  flex-direction: column;
  padding: 35px;
  gap: 20px;
`;

const TitleSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row-reverse;
`;

const SubTitle = styled.h2`
  width: 112px;
  padding: 2px 0 4px;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
  margin: 10px 0 4px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
`;

const moveIcon = keyframes`
  0%, 100% {
    transform: translateX(0) scaleX(-1);
  }
  50% {
    transform: translateX(-5px) scaleX(-1);
  }
`;

const StyledChevronIcon = styled(IoChevronBackOutline)`
  transform: scaleX(-1);
  margin-left: 6px;
  margin-bottom: -4px;
  color: #ee5050;
  font-size: 16px;
  animation: ${moveIcon} 1.5s infinite ease-in-out;
`;

const FeedGrid = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const Image = styled.img`
  width: 154px;
  height: 280px;
  object-fit: cover;
  border-radius: 8px;
  cursor: pointer;
`;

const None = styled.div`
  margin-top: 100px;
  width: 100%;
  text-align: center;
  color: #ee5050;
`;

export default Home;
