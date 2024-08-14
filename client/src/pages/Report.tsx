import Header from "components/Header";
import styled from "styled-components";
import { Line } from "react-chartjs-2";
import { BsArrowCounterclockwise } from "react-icons/bs";
import { GrUpload } from "react-icons/gr";
import useCountNum from "hooks/useCountNum";
import UpdateModal from "features/report/UploadModal";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import { baseUrl } from "axiosInstance/constants";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ChunkArrayFunction = <T>(array: T[], chunkSize: number) => T[][];

interface scoreData {
  uuid: string;
  youtubeId: string;
  challengeId: string;
  totalScore: number;
  scoreHistory: number[];
  videoFile: string;
  originalFps: number;
}

interface ResponseData {
  code: number;
  message: string;
  data: scoreData;
  errors: object;
  isSuccess: boolean;
}

const Report = ({
  borderColor = "#ee5050",
  backgroundColor = "rgba(255, 255, 255, 0.5)",
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<scoreData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [isDataLoaded, setIsDataLoaded] = useState(false); // 데이터 로딩 상태 추가
  const [isModalOpen, setModalOpen] = useState(false); // 모달 열림 상태 추가
  const reportIdRef = useRef<string | null>(null); // 이전 요청 ID 저장

  const mutation = useMutation<scoreData, Error, string>({
    mutationFn: async (value: string): Promise<scoreData> => {
      const response = await axios.get<ResponseData>(
        `${baseUrl}/api/v1/userChallenge/report/${value}`
      );
      return response.data.data;
    },
    onSuccess: (data: scoreData) => {
      console.log(data);
      setReportData(data);
      setIsDataLoaded(true); // 데이터 로딩 완료 상태 설정
    },
    onError: (error: Error) => {
      console.error("Error fetching data:", error);
    },
  });

  useEffect(() => {
    const urlSegments = location.pathname.split("/");
    const reportIndex = urlSegments.indexOf("report");
    const value = reportIndex !== -1 ? urlSegments[reportIndex + 1] : "";
    if (value && value !== reportIdRef.current) {
      reportIdRef.current = value;
      mutation.mutate(value);
    }
  }, [location.pathname, mutation]);

  useEffect(() => {
    if (reportData && reportData.videoFile) {
      const base64String = reportData.videoFile;
      // base64 문자열을 Blob으로 변환
      const videoBlob = fetch(`data:video/mp4;base64,${base64String}`).then(
        (res) => res.blob()
      );
      // Blob에서 URL 생성
      videoBlob.then((blob) => {
        const videoUrl = URL.createObjectURL(blob);
        setVideoUrl(videoUrl);
      });
    }
  }, [reportData]);

  const chunkArray: ChunkArrayFunction = (array, chunkSize) => {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  };

  const calculateAverage = (array: number[]): number => {
    const total = array.reduce((sum, value) => sum + value, 0);
    return total / array.length;
  };

  const handleChartClick = (label: string) => {
    const seconds = parseFloat(label.replace("s", "")); // 라벨에서 초 단위 숫자 추출
    const videoElement = document.getElementById(
      "videoPlayer"
    ) as HTMLVideoElement;
    if (videoElement) {
      videoElement.currentTime = seconds;
      videoElement.play();
    }
  };

  const averagedData = reportData
    ? chunkArray(reportData.scoreHistory, reportData.originalFps).map(
        (chunk) => calculateAverage(chunk) * 100
      )
    : [];

  const chartData = {
    labels: averagedData.map((_, index) => `${index}s`), // 초 단위로 라벨 생성
    datasets: [
      {
        label: "match %",
        data: averagedData,
        borderColor: borderColor,
        backgroundColor: backgroundColor,
        fill: true,
        tension: 0.4, // 부드러운 곡선
        pointRadius: 5, // 포인트 크기 설정
        hoverRadius: 7, // 마우스 오버 시 포인트 크기
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ee5050",
        },
        grid: {
          color: "rgba(255, 255, 255, 0)",
        },
      },
      y: {
        ticks: {
          color: "#ee5050",
        },
        grid: {
          color: "#ffffff",
        },
        beginAtZero: true,
        max: 100,
      },
    },
    animation: {
      duration: 2000,
    },
    onClick: (_, elements, chart) => {
      if (elements.length > 0 && chart.data.labels) {
        const elementIndex = elements[0].index;
        const label = chart.data.labels[elementIndex];
        if (label) {
          handleChartClick(label.toString());
        }
      }
    },
  };

  const count = useCountNum(
    isDataLoaded && reportData ? Math.ceil(reportData.totalScore * 100) : 0, // 데이터 로딩 완료 후 카운트 시작
    0,
    2000
  );

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  const handleRetry = () => {
    if (reportData && reportData.youtubeId) {
      navigate(`/challenge/${reportData.youtubeId}`);
    }
  };

  const handleChallenge = () => {
    navigate(`/guide`);
  };

  return (
    <>
      <Header stickyOnly />
      <Container>
        <MainSection>
          <div>
            {videoUrl && (
              <video id="videoPlayer" width="300" controls loop>
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
          <ReportContainer>
            <div>
              <Score>
                {count}
                <div>/ 100</div>
              </Score>
              <GraphContainer>
                {isDataLoaded && reportData && (
                  <Line data={chartData} options={options} />
                )}{" "}
                {/* 데이터 로딩 완료 후 그래프 렌더링 */}
              </GraphContainer>
            </div>
            <BtnContainer>
              <div>
                <RetryBtn onClick={handleRetry}>
                  <StyledBsArrowCounterclockwise size="28" color="#9b9b9b" />
                  <div>
                    다시
                    <br />
                    연습하기
                  </div>
                </RetryBtn>
                <SearchBtn onClick={handleChallenge}>
                  다른 챌린지
                  <br />
                  도전하기
                </SearchBtn>
              </div>
              <UploadBtn onClick={openModal}>
                <StyledFiUpload size="22" color="#ee5050" />
                upload
              </UploadBtn>
            </BtnContainer>
          </ReportContainer>
        </MainSection>
      </Container>
      <UpdateModal
        isOpen={isModalOpen}
        onClose={closeModal}
        reportData={reportData}
      />
    </>
  );
};

const Container = styled.div`
  min-width: 1120px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 36px auto 0;
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
  flex-direction: row;
  justify-content: space-between;
  padding: 32px 48px;
  gap: 35px;

  & > div:first-child {
    width: 300px;
    height: 532px;
    border-radius: 8px;
    background-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0px 6px 5px 0px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
`;

const ReportContainer = styled.div`
  width: 630px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const GraphContainer = styled.div`
  width: 100%;
  margin-left: -10px;
`;

const BtnContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  flex-wrap: wrap;

  & > div {
    display: flex;
  }
`;

const RetryBtn = styled.div`
  width: 124px;
  height: 54px;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  font-family: "Noto Sans KR", sans-serif;
  cursor: pointer;

  &:hover {
    background-color: #f7f7f7;

    * {
      color: #6e6e6e;
    }

    div {
      color: #000000 !important;
    }
  }

  div {
    margin-top: -2px;
    margin-left: 12px;
    font-size: 13px;
    color: #7a7a7a;
    line-height: 1.2;
  }
`;

const StyledBsArrowCounterclockwise = styled(BsArrowCounterclockwise)`
  transition: color 0.3s ease;
`;

const StyledFiUpload = styled(GrUpload)`
  margin-top: 4px;
  margin-right: 12px;
`;

const SearchBtn = styled.div`
  width: 124px;
  height: 54px;
  margin-left: 20px;
  font-size: 13px;
  text-align: center;
  line-height: 1.4;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  font-family: "Noto Sans KR", sans-serif;
  cursor: pointer;

  &:hover {
    background-color: #f7f7f7;
    color: #ff0000;
  }
`;

const UploadBtn = styled.div`
  width: 190px;
  height: 54px;
  margin-left: 20px;
  font-size: 27px;
  font-weight: 600;
  font-family: "Noto Sans", sans-serif;
  text-align: center;
  line-height: 1.4;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: #ffffff;
  }
`;

const Score = styled.div`
  height: 80px;
  margin-bottom: 24px;
  color: #ee5050;
  display: flex;
  align-items: end;
  justify-content: center;
  font-size: 76px;
  font-weight: 700;
  font-family: "Noto Sans", sans-serif;

  & > div {
    font-size: 18px;
    font-weight: 600;
  }
`;

export default Report;
