import Header from "components/Header";
import styled from "styled-components";
import { SearchBar } from "components/SearchBar";
import { MdLock } from "react-icons/md";

const Battle = () => {
  return (
    <>
      <Header />
      <Container>
        <MainSection>
          <SearchBar width={560} icon />
          <RoomContainer>
            <Room>
              <Profile></Profile>
              <div>
                <div>
                  <div>userId</div>
                  <div>에스파 챌린지 같이 추실 분</div>
                </div>
                <div>2024-07-30 17:34</div>
              </div>
              <div>
                <MdLock />
                <div>join</div>
              </div>
            </Room>
          </RoomContainer>
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
  gap: 30px;
`;

const MainSection = styled.div`
  width: 1080px;
  border-radius: 20px;
  background: linear-gradient(
    108deg,
    rgba(255, 255, 255, 0.26) 0%,
    rgba(255, 255, 255, 0.07) 100%
  );
  box-shadow: 0px 6px 5px 0px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  padding: 35px;
  gap: 35px;
`;

const RoomContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  border: 1px solid white;
`;

const Room = styled.div`
  width: 46%;
  border: 1px solid black;
  display: flex;
  flex-direction: row;
  padding: 20px 30px;
`;

const Profile = styled.div`
  width: 60px;
  height: 60px;
  background-color: #e6e6e6;
  border-radius: 50%;
  margin-right: 16px;
`;

export default Battle;
