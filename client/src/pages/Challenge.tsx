import Header from "components/Header";
import styled from "styled-components";
import playButtonIcon from "assets/icons/playButton.png";
import img1 from "assets/image/img1.png";
import img2 from "assets/image/img2.png";

interface ImageData {
  id: number;
  src: string;
  title: string;
  tag: string;
}

const imageData: ImageData[] = [
  { id: 1, src: img1, title: "이주은 챌린지이주은챌린지", tag: "#기아" },
  { id: 2, src: img2, title: "카리나 챌린지", tag: "#에스파" },
  { id: 3, src: img1, title: "이주은 챌린지", tag: "#치어리더 #기아" },
  { id: 4, src: img2, title: "카리나 챌린지", tag: "#윈터 #카리나" },
];

const Challenge: React.FC = () => {
  return (
    <>
      <Header />
      <Container>
        <MainSection>
          {imageData.map((img) => (
            <ContentSection key={img.id}>
              <TitleSection>
                <MainTitle>{img.title}</MainTitle>
                <PlayButton src={playButtonIcon} />
              </TitleSection>
              <SubTitle>{img.tag}</SubTitle>
              <FeedImage src={img.src} />
            </ContentSection>
          ))}
        </MainSection>
        <MainSection>
          {imageData.map((img) => (
            <ContentSection key={img.id}>
              <TitleSection>
                <MainTitle>{img.title}</MainTitle>
                <PlayButton src={playButtonIcon} />
              </TitleSection>
              <SubTitle>{img.tag}</SubTitle>
              <FeedImage src={img.src} />
            </ContentSection>
          ))}
        </MainSection>
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

  &:hover {
    img {
      transform: scale(1.05);
    }
  }
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  width: 200px;
`;

const MainTitle = styled.h1`
  font-size: 21px;
  font-weight: 600;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PlayButton = styled.img`
  width: 55px;
  height: 55px;
  margin-bottom: -8px;
  margin-right: -8px;
  cursor: pointer;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.2);
  }
`;

const SubTitle = styled.div`
  font-size: 16px;
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 500;
  margin-top: -6px;
  margin-bottom: 22px;
`;
const FeedImage = styled.img`
  width: 200px;
  height: 355.5px;
  border-radius: 8px;
  object-fit: cover;
  transition: transform 0.3s ease;
`;
