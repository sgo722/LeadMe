import Header from "components/Header";
import styled from "styled-components";
import { Line } from "react-chartjs-2";
import { BsArrowCounterclockwise } from "react-icons/bs";
import { GrUpload } from "react-icons/gr";
import useCountNum from "hooks/useCountNum";
import Modal from "features/report/UploadModal";
import { useState } from "react";
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

const Report = ({
                  borderColor = "#ee5050",
                  backgroundColor = "rgba(255, 255, 255, 0.5)",
                }) => {
  const dumData = {
    score: 76,
    uuid: 123,
    scoreHistory: [
      0.6514554604614342, 0.5944909215051594, 0.6368836823221795,
      0.6998438671205898, 0.5953920845209554, 0.7135288056907988,
      0.7331496751918729, 0.7613696700132012, 0.7905459324275065,
      0.7549484061639825, 0.7714971517980684, 0.7511656464966262,
      0.6579547438150881, 0.3827891324800133, 0.4706439826965807,
      0.4619981305734156, 0.5057929718750941, 0.36123209183626576,
      0.40146415415736203, 0.403326310306029, 0.5088859455132726,
      0.5202585447179908, 0.5272654007268207, 0.6312479461836551,
      0.6343927571034245, 0.6369836481476692, 0.7547929095649643,
      0.751784954427918, 0.7477519992499874, 0.6865113219717429,
      0.7323917423979104, 0.7340512197783295, 0.7557609392751801,
      0.754585541393791, 0.7512925519921904, 0.7568538748017197,
      0.7620456756426077, 0.7079967753100668, 0.6998807193462476,
      0.7037010205315511, 0.7766833937342805, 0.7459723147415209,
      0.5538833193234479, 0.5096831650742877, 0.5066518404271089,
      0.5430935372139333, 0.4511483261305674, 0.6229592605559431,
      0.585906961050424, 0.5800937386086916, 0.645027548890902,
      0.6335669812915979, 0.7046269718678498, 0.7013970744334921,
      0.7133015914605058, 0.7307238851548657, 0.7258506271724912,
      0.7276617602691391, 0.7200027972898327, 0.7254803712880444,
      0.7345832400941508, 0.7223249431212577, 0.6957854657870024,
      0.6584398039904454, 0.6598637598812388, 0.6392737389967276,
      0.669702278413749, 0.6464794842247545, 0.6577907318906301,
      0.7226835325748365, 0.741957898212081, 0.6962466020090865,
      0.7050092301749264, 0.7282905035586764, 0.6808106233768219,
      0.6822042187548158, 0.5424921021458604, 0.5810853677689065,
      0.6754412155627154, 0.6213341039803326, 0.5686323748754719,
      0.5695506298974281, 0.6130705696631774, 0.5549430094144332,
      0.537126557944283, 0.46939836194282863, 0.5855612182957993,
      0.6083563692187466, 0.6383703495659032, 0.6860601546385755,
      0.6960162560651251, 0.6738754578780977, 0.6559493710472283,
      0.5473539427214653, 0.5291360335234158, 0.6008572124233903,
      0.6197246197662597, 0.6187175545538508, 0.6083757382197142,
      0.5945829160059216, 0.6838853961819484, 0.7351657062692631,
      0.7342268643793217, 0.6914761725425124, 0.7108672630496978,
      0.7045182518590968, 0.7049009985549936, 0.6921492029913378,
      0.6847029578253732, 0.6985855699751946, 0.694240198111317,
      0.6929414198243129, 0.6798949503709308, 0.6698040480124413,
      0.663549296499154, 0.655578633114335, 0.6714887949587451,
      0.6764852696825145, 0.6559240267647559, 0.6848447388110206,
      0.7207580055193509, 0.7452042867812828, 0.7137902889574657,
      0.7030077587467992, 0.692273342890003, 0.7231887614038831,
      0.643353661802063, 0.6064024346652085, 0.5440863981746066,
      0.5948398643594294, 0.6729765898879156, 0.6551015453636052,
      0.6575377077305653, 0.5946245114161628, 0.5948409967619915,
      0.6336604415126246, 0.6034034525040027, 0.6153877905386652,
      0.6332433635941963, 0.6231257614272397, 0.6170411881223651,
      0.5792169337311996, 0.572063871696075, 0.5392228150905883,
      0.548638440135254, 0.515769820632195, 0.681395374280482,
      0.5967157785261068, 0.6585721382773283, 0.7207949238947328,
      0.7584508888413447, 0.6696000633833578, 0.6449229289610275,
      0.6687833312516123, 0.69006337789153, 0.5019200279558316,
      0.4281962282731502, 0.4301805070087026, 0.39040241570498635,
      0.5539498588115044, 0.7404294099712028, 0.8107439582501518,
      0.8228604687810436, 0.7257470488034089, 0.5887640617877755,
      0.6453702117253007, 0.6783892377543904, 0.8252507341890007,
      0.7794802142255246, 0.7728163710056483, 0.6867818018675399,
      0.582603366810287, 0.6905079108035528, 0.7811014560751247,
      0.7338949747635404, 0.818965135812881, 0.8052285191124086,
      0.8301032070930259, 0.8171490691042386, 0.7833450663285606,
      0.8198462419229698, 0.8370341738663657, 0.8278901801995696,
      0.8048272020216896, 0.7118895155483047, 0.7071896553106048,
      0.719682834779209, 0.7436349080571926, 0.763010560238351,
      0.8074757127290576, 0.8222718761433272, 0.8272506152898277,
      0.8240057959372292, 0.8256190269185447, 0.7954508623379162,
      0.7634584095576105, 0.7957611480843025, 0.7983635137656416,
      0.7595170424241615, 0.772741846053139, 0.802998846183466,
      0.8319251120912315, 0.7992576785982746, 0.8033796988532015,
      0.7954950694607992, 0.7809822880478278, 0.7710954737518081,
      0.8047609004048487, 0.7612548596217306, 0.7808489662521851,
      0.7854670490354206, 0.80715665227679, 0.8202035618090165,
      0.8251197096881627, 0.8278707710364134, 0.8116154986590589,
      0.8409830033487018, 0.8670711242695667, 0.8617657362592487,
      0.9046317186755359, 0.8658752605565071, 0.8118165144560916,
      0.800906552097258, 0.7726021857597472, 0.7786160002362957,
      0.8111963946693813, 0.7782720952908144, 0.8128859163976354,
      0.7967002299933401, 0.7804925258743732, 0.8037693592994113,
      0.8007076770182977, 0.84373225095371, 0.7525653932743447,
      0.7558142494378991, 0.7891258383261058, 0.7371501641188191,
      0.7378223121494996, 0.6529861036635354, 0.7250954235171645,
      0.6768130103190743, 0.6797830940349806, 0.6303999609837235,
      0.7479551506735146, 0.7322802416915277, 0.7247288434457276,
      0.6780518706254566, 0.6575812201111527, 0.6448920931405687,
      0.6808668054995246, 0.7134689567487499, 0.7697731285871466,
      0.6909359271142113, 0.7634441584649341, 0.7787330576321264,
      0.7134743556771855, 0.7471966559638583, 0.773944959048755,
      0.7725697318681093, 0.7797114303892727, 0.7972229987782875,
      0.8064380202624448, 0.79394319756939, 0.7469994425574917,
      0.7344343982233215, 0.7859270740038543, 0.7890267611333378,
      0.7623475161114737, 0.7532031088900016, 0.738497492147942,
      0.6939508982437623, 0.6994312125932485,
    ],
  };

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

  const averagedData = chunkArray(dumData.scoreHistory, 30).map(
      (chunk) => calculateAverage(chunk) * 100
  );

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
          color: "#ee5050", // x축 눈금 글씨
        },
        grid: {
          color: "rgba(255, 255, 255, 0)", // x축 눈금선
        },
      },
      y: {
        ticks: {
          color: "#ffffff", // y축 눈금 글씨
        },
        grid: {
          color: "#ffffff", // y축 눈금선
        },
        beginAtZero: true,
        max: 100,
      },
    },
    animation: {
      duration: 2000,
    },
  };

  const count = useCountNum(dumData.score, 0, 2000);
  const [isModalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);

  return (
      <>
        <Header stickyOnly />
        <Container>
          <MainSection>
            <div>동영상</div>
            <ReportContainer>
              <div>
                <Score>
                  {count}
                  <div>/ 100</div>
                </Score>
                <GraphContainer>
                  <Line data={chartData} options={options} />
                </GraphContainer>
              </div>
              <BtnContainer>
                <div>
                  <RetryBtn>
                    <StyledBsArrowCounterclockwise size="28" color="#9b9b9b" />
                    <div>
                      다시
                      <br />
                      연습하기
                    </div>
                  </RetryBtn>
                  <SearchBtn>
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
        <Modal isOpen={isModalOpen} onClose={closeModal} />
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
    height: 533px;
    border-radius: 20px;
    background-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0px 6px 5px 0px rgba(0, 0, 0, 0.1);
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
