import React, { useState } from "react";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import styled from "styled-components";
import { ResponseData } from "types";
import { baseUrl } from "axiosInstance/constants";

const Admin = () => {
  const [formData, setFormData] = useState({
    youtubeId: "",
    url: "",
    title: "",
  });
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation<ResponseData<any>, Error, FormData>({
    mutationFn: async (data: FormData) => {
      console.log(data);
      const response = await axios.post<ResponseData<any>>(
        `${baseUrl}/api/v1/upload`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
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

  const handleHashtagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (hashtagInput.trim() && !hashtags.includes(hashtagInput)) {
        setHashtags([...hashtags, hashtagInput.trim()]);
        setHashtagInput("");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.title || !file) {
      alert("모든 필드를 입력하고 파일을 첨부해주세요.");
      return;
    }

    const data = new FormData();

    // 파일은 그대로 FormData에 추가
    data.append("file", file as File);

    // 나머지 데이터를 JSON으로 변환하여 Blob으로 추가
    const jsonBlob = new Blob(
      [
        JSON.stringify({
          youtubeId: formData.youtubeId,
          url: formData.url,
          title: formData.title,
          hashtags: hashtags,
        }),
      ],
      { type: "application/json" }
    );
    data.append("request", jsonBlob);

    // FormData 내용을 콘솔에 출력
    console.log("전송한 데이터 내용:");
    for (let [key, value] of data.entries()) {
      if (value instanceof Blob && key === "request") {
        const reader = new FileReader();
        reader.onload = () => {
          console.log(`${key}:`, reader.result);
        };
        reader.readAsText(value);
      } else {
        console.log(`${key}:`, value);
      }
    }

    mutation.mutate(data);

    setFormData({ youtubeId: "", url: "", title: "" });
    setHashtags([]);
    setFile(null);
  };

  return (
    <Container>
      <LeftContainer>
        <h2>해시태그 입력</h2>
        <input
          type="text"
          placeholder="해시태그 입력"
          value={hashtagInput}
          onChange={(e) => setHashtagInput(e.target.value)}
          onKeyDown={handleHashtagKeyDown}
        />
        <HashtagContainer>
          {hashtags.map((tag, index) => (
            <Hashtag key={index}>{tag}</Hashtag>
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

const Hashtag = styled.span`
  display: inline-block;
  background-color: #f0f0f0;
  color: black;
  padding: 5px;
  margin: 5px;
  border-radius: 5px;
`;

export default Admin;
