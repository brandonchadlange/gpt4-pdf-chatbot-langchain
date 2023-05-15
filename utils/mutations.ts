import axios from 'axios';
import { AWS_API_URL } from '../config/aws-amplify';

const axiosInstance = axios.create({
  baseURL: AWS_API_URL,
});

const makeMutation = <T = any>(options: {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  url: string;
}) => {
  return async (body?: T) => {
    return await axiosInstance.request({
      method: options.method,
      url: options.url,
      data: body,
    });
  };
};

type PostChatBody = {
  question: string;
  model: string;
  history: [string, string][];
};

const chat = makeMutation<PostChatBody>({
  method: 'POST',
  url: '/api/chat',
});

export const makePostChat = (handlers: {
  onSuccess(response: any, question: string): void;
  onError(response: any): void;
}) => {
  return async (body: PostChatBody) => {
    try {
      const chatResponse = await chat(body);
      handlers.onSuccess(chatResponse, body.question);
    } catch (err: any) {
      handlers.onError(err.response);
    }
  };
};

export const postUploadFiles = makeMutation<File[]>({
  method: 'POST',
  url: '/api/upload',
});

export const postSendUrl = makeMutation<{ url: string }>({
  method: 'POST',
  url: '/api/add',
});

export const postPurgeDocuments = makeMutation({
  method: 'POST',
  url: '/api/purge',
});
