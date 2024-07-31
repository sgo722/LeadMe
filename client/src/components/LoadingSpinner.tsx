import styled from "styled-components";

export const LoadingSpinner: React.FC = () => {
  return (
    <LoadingWrapper>
      <LoadingContent />
    </LoadingWrapper>
  );
};

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
`;

const LoadingContent = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #ee5050;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;
