import styled from "styled-components";
import Header from "components/Header";
import { SearchBar } from "components/SearchBar";
import { SearchResult } from "features/search/SearchResult";

export const Search: React.FC = () => {
  return (
    <>
      <Header />
      <Container>
        <SearchBar width={750} navigation />
        <SearchResult platform={"YouTube"} />
        {/* <FakeSearchResult platform={"TikTok"} /> */}
        {/* <FakeSearchResult platform={"Instagram"} /> */}
      </Container>
    </>
  );
};

const Container = styled.div`
  min-width: 1120px;
  margin: 50px auto;
`;
