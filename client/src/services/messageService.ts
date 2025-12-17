import api from './axios';

export const markMessagesAsRead = async (threadId: string) => {
  await api.patch(`/messages/read/${threadId}`);
};

export const fetchMessagesByReadState = async (threadId: string, read: boolean) => {
  const { data } = await api.get(`/messages/by-read-state`, {
    params: { threadId, read }
  });
  return data;
};
