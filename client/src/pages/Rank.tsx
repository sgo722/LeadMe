import Header from "components/Header";
import styled from "styled-components";
import { SearchBar } from "components/SearchBar";

interface TempData {
  rank: number;
  id: string;
  likes: number;
  followers: number;
}

const tempData: TempData[] = [
  { rank: 1, id: "user1", likes: 1000, followers: 5100 },
  { rank: 2, id: "user2", likes: 950, followers: 480 },
  { rank: 3, id: "user3", likes: 900, followers: 460 },
  { rank: 4, id: "user4", likes: 850, followers: 440 },
  { rank: 5, id: "user5", likes: 800, followers: 420 },
  { rank: 6, id: "user6", likes: 750, followers: 400 },
  { rank: 7, id: "user7", likes: 700, followers: 380 },
  { rank: 8, id: "user8", likes: 650, followers: 360 },
  { rank: 9, id: "user9", likes: 600, followers: 340 },
  { rank: 10, id: "user10", likes: 550, followers: 320 },
];

const Rank: React.FC = () => {
  return (
    <>
      <Header />
      <Container>
        <MainSection>
          <SearchBar width={464} icon />
          <TableWrapper>
            <Table>
              <thead>
                <TableRow>
                  <TableHeader>순위</TableHeader>
                  <TableHeader>아이디</TableHeader>
                  <TableHeader>좋아요</TableHeader>
                  <TableHeader>팔로워</TableHeader>
                </TableRow>
              </thead>
              <tbody>
                {tempData.map((item: TempData) => (
                  <TableRow key={item.rank}>
                    <TableCell>{item.rank}</TableCell>
                    <TableCell>{item.id}</TableCell>
                    <TableCell>{item.likes}</TableCell>
                    <TableCell>{item.followers}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        </MainSection>
      </Container>
    </>
  );
};

export default Rank;

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

const TableWrapper = styled.div`
  text-align: center;
  border-radius: 15px;
  border: 1px solid #fff;
  background: linear-gradient(
    108deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.2) 100%
  );

  backdrop-filter: blur(10px);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  tbody > tr:last-child {
    border-bottom: none;
  }
`;

const TableRow = styled.tr`
  font-family: "Noto Sans KR", sans-serif;
  font-weight: 400;
  border-bottom: 1px solid #fff;
`;

const TableHeader = styled.th`
  padding: 10px;
  font-size: 12px;
  font-weight: 700;
`;

const TableCell = styled.td`
  padding: 14px;
  font-size: 16px;
`;
