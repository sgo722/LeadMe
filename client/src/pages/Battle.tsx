import Header from "components/Header";
import styled from "styled-components";
import { useEffect, useState } from "react";
import { SearchBar } from "components/SearchBar";
import { MdLock } from "react-icons/md";
import { CreateRoomModal } from "features/battle/CreateRoomModal";
import { InputPasswordModal } from "features/battle/InputPasswordModal";
import { axiosInstance } from "axiosInstance/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "features/battle/Pagination";
import { useNavigate } from "react-router-dom";
import { AxiosResponse } from "axios";
import { getJWTHeader } from "axiosInstance/apiClient";
// 로딩 새로고침
// 타입 제대로 지정 꼼꼼히
// 비밀번호 로직 추가
// 방 입장 로직 추가

// 방 목록 & 검색 api
const fetchRooms = async (
  page: number,
  searchKeyword: string = ""
): Promise<{ competitions: Room[]; totalPages: number }> => {
  const res = await axiosInstance.get(
    // 검색어가 있으면 파라미터에 추가, 없으면 빼고 요청
    `/api/v1/competitions?page=${page}${
      searchKeyword ? `&searchKeyword=${searchKeyword}` : "&searchKeyword="
    }`
  );
  return res.data.data;
};

interface Room {
  competitionId: number;
  createdDate: string;
  nickname: string | null;
  profileImg: string | null;
  public: boolean;
  roomName: string;
  sessionId: string;
}

export const Battle: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>(""); // 검색어
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [showCreateRoomModal, setShowCreateRoomModal] =
    useState<boolean>(false);
  const [showInputPasswordModal, setShowInputPasswordModal] =
    useState<boolean>(false); // 비밀번호 입력 모달 표시 여부
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isPasswordError, setIsPasswordError] = useState<boolean>(false); // 비밀번호 틀렸는지에 대한 상태

  const nav = useNavigate();

  useEffect(() => {
    if (isPasswordError) {
      const timer = setTimeout(() => {
        setIsPasswordError(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isPasswordError]);

  // 방 조회
  const {
    data: rooms,
    isError,
    error,
  } = useQuery<{ competitions: Room[]; totalPages: number }, Error>({
    queryKey: ["rooms", searchTerm, currentPage],
    queryFn: () => fetchRooms(currentPage, searchTerm),
    staleTime: 5 * 60 * 1000, // 5분
  });

  // 방 검색
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(0);
    console.log("검색어", term);
  };

  const queryClient = useQueryClient();

  // 방 생성을 위한 뮤테이션
  const createRoomMutation = useMutation({
    mutationFn: (roomData: {
      roomName: string;
      isPublic: boolean;
      password?: string;
    }): Promise<AxiosResponse> =>
      axiosInstance.post("/api/v1/sessions", roomData, {
        headers: getJWTHeader(),
      }),
    onSuccess: () => {
      // 쿼리무효화로 방목록 최신화
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
      // 방생성 모달창 닫기
      setShowCreateRoomModal(false);
    },
    onError: (error) => {
      console.error("방 생성 중 요류:", error);
    },
  });

  // public 방 토큰을 가져와서 입장시키는 mutation
  const enterPublicRoomMutation = useMutation({
    mutationFn: (room: Room) =>
      axiosInstance.post(`api/v1/sessions/${room.sessionId}/connections`),
    onSuccess: (data, room) => {
      console.log("이거봐야돼:", data);
      console.log("공개 방 토근 발급 성공", data.data.data.token);
      console.log("세션아이디:", room.sessionId);
      console.log("방이름:", room.roomName);
      nav(`/battleRoom/${room.sessionId}`, {
        state: {
          token: data.data.data.token,
          sessionId: room.sessionId,
          roomName: room.roomName,
        },
      });
    },
    onError: (error) => {
      console.error("공개 방 토큰 발급 요류:", error);
    },
  });

  // private 방 토큰을 가져와서 입장시키는 mutation
  const enterPrivateRoomMutation = useMutation({
    mutationFn: ({ room, password }: { room: Room; password: string }) =>
      axiosInstance.post(`/api/v1/sessions/${room.sessionId}/connections`, {
        competitionId: room.competitionId.toString(),
        password,
      }),
    onSuccess: (data, { room }) => {
      if (data.data.data.validation) {
        console.log("이거봐야돼:", data);
        console.log("비공개방 토큰 발급 성공", data.data.data.token);
        setShowInputPasswordModal(false);
        setIsPasswordError(false);
        nav(`/battleRoom/${room.sessionId}`, {
          state: {
            token: data.data.data.token,
            sessionId: room.sessionId,
            roomNamd: room.roomName,
          },
        });
      }
      if (!data.data.data.validation) {
        console.log("비밀번호 틀림");
        setIsPasswordError(true);
      }
    },
    onError: (error) => {
      console.error("비공개방 토큰 발급 오류:", error);
    },
  });

  // 페이지 변경
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };
  // 방 입장
  const handleEnterRoom = (room: Room) => {
    if (room.public) {
      // 공개 방이면 바로 입장 시도
      enterPublicRoomMutation.mutate(room);
    }
    if (!room.public) {
      // 비공개 방이면 선택한 방 정보 저장 후 비밀번호 입력 모달 표시
      setSelectedRoom(room);
      setIsPasswordError(false);
      setShowInputPasswordModal(true);
    }
  };

  const handlePasswordEnter = (password: string) => {
    if (selectedRoom) {
      // 선택된 방이 있을때 비공개 방 입장 시도
      enterPrivateRoomMutation.mutate({
        room: selectedRoom,
        password,
      });
    }
    // 비번입력모달 닫기
  };

  // 방 생성 날짜 포멧팅
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${month}-${day} ${hours}:${minutes}`;
  };
  // if (isLoading) return <div>로딩중</div>;
  if (isError) return <div>Error: {(error as Error).message}</div>;
  return (
    <>
      <Header />
      <Container>
        <MainSection>
          <SearchBar width={560} icon onSearch={handleSearch} />
          <RoomContainer>
            {rooms?.competitions.map((room: Room) => (
              <Room key={room.competitionId}>
                <RoomTop>
                  <div>{room.nickname || "수정하셈"}</div>
                  <div>{!room.public && <MdLock />}</div>
                </RoomTop>
                <RoomMid>{room.roomName}</RoomMid>
                <RoomBottom>
                  <RoomCreatedAt>{formatDate(room.createdDate)}</RoomCreatedAt>
                  <EnterButton onClick={() => handleEnterRoom(room)}>
                    enter
                  </EnterButton>
                </RoomBottom>
              </Room>
            ))}
          </RoomContainer>
        </MainSection>
        <Footer>
          <PaginationContainer>
            <Pagination
              currentPage={currentPage}
              totalPages={rooms?.totalPages || 1}
              onPageChange={handlePageChange}
            />
          </PaginationContainer>
          <CreateRoomButtonContainer>
            <CreateRoomButton onClick={() => setShowCreateRoomModal(true)}>
              방만들기
            </CreateRoomButton>
          </CreateRoomButtonContainer>
        </Footer>
      </Container>
      {showCreateRoomModal && (
        <CreateRoomModal
          onCreateRoom={(roomData) => createRoomMutation.mutate(roomData)}
          onClose={() => setShowCreateRoomModal(false)}
        />
      )}
      {showInputPasswordModal && selectedRoom && (
        <InputPasswordModal
          onClose={() => {
            setShowInputPasswordModal(false);
            setIsPasswordError(false);
          }}
          onEnter={handlePasswordEnter}
          roomTitle={selectedRoom.roomName}
          isError={isPasswordError}
        />
      )}
    </>
  );
};

const Container = styled.div`
  min-width: 1120px;
  display: flex;
  flex-direction: column;
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
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  min-height: 400px;
`;

const Room = styled.div`
  display: flex;
  flex-direction: column;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  height: 180px; // 고정 높이 설정
  border-radius: 15px;
  border: 1px #fff;
  background: linear-gradient(
    108deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.2) 100%
  );
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
`;

const RoomTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  color: #929292;
`;

const RoomMid = styled.h1`
  margin-top: 10px;
  margin-bottom: auto;
  font-size: 20px;
  color: black;
`;

const RoomBottom = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RoomCreatedAt = styled.div`
  color: #c1c1c1;
  text-align: center;
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: 15px;
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 1080px;
  gap: 20px; // 페이징과 버튼 사이의 간격
`;

const EnterButton = styled.button`
  width: 80px;
  height: 30px;
  border-radius: 4px;
  background: #f7f7f7;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.15);
  border: none;
  cursor: pointer;
  color: #ee5050;
  text-align: center;
  font-size: 18px;
  font-style: normal;
  font-weight: 500;
  line-height: 23px;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const CreateRoomButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

const CreateRoomButton = styled.button`
  width: 96px;
  height: 31px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.55);
  border: none;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.15);
  color: #ee5050;
  font-size: 16px;
  font-weight: 400;
  cursor: pointer;
`;
