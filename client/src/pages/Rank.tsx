import { useState, useEffect } from "react";
import Header from "components/Header";
import styled from "styled-components";
import { SearchBar } from "components/SearchBar";
import { ResponseData } from "types";
import { baseUrl } from "axiosInstance/constants";
import { useMutation } from "@tanstack/react-query";
import { IoChevronBackSharp } from "react-icons/io5";
import axios from "axios";

interface ListData {
  userId: number;
  userNickname: string;
  liked: number;
  followers: number;
  profileImg: string;
}

const generateDummyData = (total: number): ListData[] => {
  return Array.from({ length: total }, (_, idx) => ({
    userId: idx + 1,
    userNickname: `user${idx + 1}`,
    liked: Math.floor(Math.random() * 1000),
    followers: Math.floor(Math.random() * 500),
    profileImg: `https://placeimg.com/100/100/people?${idx + 1}`,
  }));
};

const Rank: React.FC = () => {
  const [total, setTotal] = useState<number>(0);
  const [rankList, setRankList] = useState<ListData[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const usersPerPage = 10; // 페이지당 유저 수

  const mutationTotal = useMutation<number, Error>({
    mutationFn: async () => {
      const response = await axios.get<ResponseData<number>>(
        `${baseUrl}/api/v1/rank/list`
      );
      return response.data.data;
    },
    onSuccess: (data: number) => {
      console.log(data);
      setTotal(data);
    },
    onError: (error: Error) => {
      console.error("Error fetching totalNum:", error);
    },
  });

  const mutationRank = useMutation<ListData[], Error, number>({
    mutationFn: async (pageNo: number) => {
      const response = await axios.get<ResponseData<ListData[]>>(
        `${baseUrl}/api/v1/rank`,
        {
          params: { pageNo },
        }
      );
      return response.data.data;
    },
    onSuccess: (data: ListData[]) => {
      console.log(data);
      setRankList(data);
    },
    onError: (error: Error) => {
      console.error("Error fetching paging list:", error);
    },
  });

  useEffect(() => {
    mutationTotal.mutate();
    mutationRank.mutate(currentPage);

    setTotal(50);
    const allUsers = generateDummyData(total);
    const startIdx = (currentPage - 1) * usersPerPage;
    const pagedUsers = allUsers.slice(startIdx, startIdx + usersPerPage);
    setRankList(pagedUsers);
  }, [currentPage, total]);

  const handlePageClick = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    setCurrentPage((prevPage) =>
      Math.min(prevPage + 1, Math.ceil(total / usersPerPage))
    );
  };

  const handlePreviousPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const totalPages = Math.ceil(total / usersPerPage);

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
                {rankList.map((item, idx) => (
                  <TableRow key={item.userId}>
                    <TableCell>
                      {(currentPage - 1) * usersPerPage + idx + 1}
                    </TableCell>
                    <TableCell>{item.userNickname}</TableCell>
                    <TableCell>{item.liked}</TableCell>
                    <TableCell>{item.followers}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
          <Pagination>
            <div>
              <SideButton
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <IoChevronBackSharp />
              </SideButton>
              {Array.from({ length: totalPages }, (_, idx) => (
                <PageButton
                  key={idx + 1}
                  onClick={() => handlePageClick(idx + 1)}
                  disabled={currentPage === idx + 1}
                >
                  {idx + 1}
                </PageButton>
              ))}
              <SideButton
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <IoChevronBackSharp />
              </SideButton>
            </div>
          </Pagination>
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

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
`;

const PageButton = styled.button`
  width: 24px;
  padding: 4px 0;
  margin: 0 2px;
  border: none;
  border-radius: 5px;
  color: #ee5050;
  background-color: inherit;
  cursor: pointer;

  &:hover {
    background-color: #ffffff;
  }
`;

const SideButton = styled.button`
  width: 40px;
  padding: 8px 0;
  margin: 0 14px;
  border: none;
  border-radius: 5px;
  color: #ee5050;
  background-color: inherit;
  cursor: pointer;
`;
