import styled from "styled-components";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  return (
    <PaginationWrapper>
      <PageButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 0}
      >
        {"<"}
      </PageButton>
      {[...Array(totalPages)].map((_, index) => (
        <PageButton
          key={index}
          onClick={() => onPageChange(index)}
          $active={currentPage === index}
        >
          {index + 1}
        </PageButton>
      ))}
      <PageButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages - 1}
      >
        {">"}
      </PageButton>
    </PaginationWrapper>
  );
};

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const PageButton = styled.button<{ $active?: boolean }>`
  margin: 0 5px;
  padding: 5px 10px;
  background-color: ${(props) => (props.$active ? "#ee5050" : "white")};
  color: ${(props) => (props.$active ? "white" : "#333")};
  cursor: pointer;

  border-radius: 8px;
  border: 1px #fff;
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
