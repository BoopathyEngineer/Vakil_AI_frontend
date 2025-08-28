import { create } from "zustand";
import { Message } from "./api";

interface MessageStore {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (newMessage: Message) => void;
  clearMessages: () => void;
}

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (newMessage) => set((state) => ({ messages: [...state.messages, newMessage] })),
  clearMessages: () => set({ messages: [] }),
}));
