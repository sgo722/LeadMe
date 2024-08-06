import styled from "styled-components";
import React, { ChangeEvent, useState } from "react";
import { IoSearchSharp } from "react-icons/io5";
import { useNavigate } from "react-router-dom";

interface SearchBarProps {
  width?: number;
  icon?: boolean;
  navigation?: boolean;
  onSearch?: (searchTerm: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  width,
  icon = false,
  navigation = false,
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const nav = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      if (navigation) {
        nav(`/search?q=${encodeURIComponent(searchTerm)}`);
      } else if (onSearch) {
        onSearch(searchTerm);
        setSearchTerm("");
      }
    }
  };

  return (
    <SearchForm $width={width} $icon={icon}>
      <SearchField
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder="검색어를 입력하세요"
      />
      <SearchButton type="submit" onClick={handleSearch}>
        {icon ? <IoSearchSharp /> : "search"}
      </SearchButton>
    </SearchForm>
  );
};

interface SearchFormProps {
  $width?: number;
  $icon?: boolean;
}

const SearchForm = styled.form<SearchFormProps>`
  width: ${({ $width }) => ($width ? `${$width}px` : "100%")};
  height: 43px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  border-radius: 15px;
  border: 1px solid #efefef;
  margin: 0 auto;
  padding-right: ${({ $icon }) => ($icon ? "10px" : "30px")};
  background: linear-gradient(
    108deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(255, 255, 255, 0.2) 100%
  );
  backdrop-filter: blur(10px);
`;

const SearchField = styled.input`
  border: none;
  font-family: "Noto Sans KR", sans-serif;
  flex-grow: 1;
  background: transparent;
  font-size: 18px;
  outline: none;
  padding-left: 25px;
  position: relative;

  &::placeholder {
    color: #d6d6d6;
    font-size: 14px;
    position: absolute;
    top: 3px;
  }
`;

const SearchButton = styled.button`
  font-size: 18px;
  background: none;
  border: none;
  cursor: pointer;
  color: #ee5050;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
  &:hover {
    transform: scale(1.1);
  }
`;
