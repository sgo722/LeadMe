import React, { useState, useEffect } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import styled from "styled-components";
import { ResponseData } from "types";
import { baseUrl } from "axiosInstance/constants";

interface KeywordProps {
  hashtagId: number;
  hashtagName: string;
}

const Admin = () => {
  const [formData, setFormData] = useState({
    youtubeId: "",
    url: "",
    title: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [keywords, setKeywords] = useState<KeywordProps[]>([]);
  const [selectedKeywordIds, setSelectedKeywordIds] = useState<number[]>([]);

  // 페이지 로드 시 해시태그 목록을 가져오기 위한 useEffect
  useEffect(() => {
    mutationKeyword.mutate();
  }, []);

  const mutationNew = useMutation<any, Error, string>({
    mutationFn: async (keyword: string) => {
      const response = await axios.post<any>(`${baseUrl}/api/v1/hashtag`, {
        hashtagName: keyword,
      });
      return response.data;
    },
    onSuccess: () => {
      // 키워드 추가 후 해시태그 목록 갱신
      mutationKeyword.mutate();
      console.log("키워드 추가 성공");
    },
    onError: (error) => {
      console.error("키워드 추가 실패", error);
    },
  });

  const mutationKeyword = useMutation<KeywordProps[], Error, void>({
    mutationFn: async () => {
      const response = await axios.get<ResponseData<KeywordProps[]>>(
        `${baseUrl}/api/v1/hashtag`
      );
      return response.data.data; // response.data.data에서 해시태그 배열 반환
    },
    onSuccess: (data) => {
      setKeywords(data);
    },
    onError: (error) => {
      console.error("해시태그 목록 불러오기 실패", error);
    },
  });

  const mutationForm = useMutation<ResponseData<any>, Error, FormData>({
    mutationFn: async (data: FormData) => {
      const response = await axios.post<ResponseData<any>>(
        `${baseUrl}/api/v1/admin/challenge`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("파일 업로드 성공:", data);
    },
    onError: (error) => {
      console.error("파일 업로드 실패:", error);
    },
  });

  const handleKeywordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (keywordInput.trim()) {
        mutationNew.mutate(keywordInput.trim());
        setKeywordInput("");
      }
    }
  };

  const toggleKeywordSelection = (id: number) => {
    if (selectedKeywordIds.includes(id)) {
      setSelectedKeywordIds(
        selectedKeywordIds.filter((keywordId) => keywordId !== id)
      );
    } else {
      setSelectedKeywordIds([...selectedKeywordIds, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || !file) {
      alert("모든 필드를 입력하고 파일을 첨부해주세요.");
      return;
    }

    const formDataObj = new FormData();

    const fileBlob = new Blob([file as File], { type: file.type });
    formDataObj.append("videoFile", fileBlob);

    const jsonBlob = new Blob(
      [
        JSON.stringify({
          youtubeId: formData.youtubeId,
          url: formData.url,
          title: formData.title,
          hashtags: selectedKeywordIds, // 선택된 해시태그 ID 전송
        }),
      ],
      { type: "application/json" }
    );
    formDataObj.append("request", jsonBlob);

    mutationForm.mutate(formDataObj);

    setFormData({ youtubeId: "", url: "", title: "" });
    setSelectedKeywordIds([]);
    setFile(null);
  };

  return (
    <Container>
      <New>
        키워드 추가
        <form>
          <input
            type="text"
            placeholder="키워드 입력"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={handleKeywordKeyDown}
          />
        </form>
      </New>
      <LeftContainer>
        <h2>해시태그 선택</h2>
        <HashtagContainer>
          {keywords.map((tag) => (
            <Hashtag
              key={tag.hashtagId}
              selected={selectedKeywordIds.includes(tag.hashtagId)}
              onClick={() => toggleKeywordSelection(tag.hashtagId)}
            >
              {tag.hashtagName}
            </Hashtag>
          ))}
        </HashtagContainer>
      </LeftContainer>
      <RightContainer>
        <h2>유튜브 정보 입력</h2>
        <Form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="youtubeId"
            value={formData.youtubeId}
            onChange={(e) =>
              setFormData({ ...formData, youtubeId: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
          />
          <input
            type="text"
            placeholder="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <input type="submit" value="제출" />
        </Form>
      </RightContainer>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  justify-content: space-around;
  padding: 20px;
`;

const LeftContainer = styled.div`
  width: 40%;
`;

const RightContainer = styled.div`
  width: 40%;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const HashtagContainer = styled.div`
  margin-top: 10px;
  background-color: #ffffff;
  padding: 10px;
  border-radius: 8px;
  min-height: 150px;
`;

const Hashtag = styled.span<{ selected: boolean }>`
  display: inline-block;
  background-color: ${({ selected }) => (selected ? "#c8e6c9" : "#f0f0f0")};
  color: black;
  padding: 5px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
`;

const New = styled.div``;

export default Admin;
