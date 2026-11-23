import { create } from "zustand";

interface UserState {
  User: string;
  setUser: (newUser: string) => void;
}

export const ReaderInfo = create<UserState>((set) => ({
  User: "",
  setUser: (newUser) => set({ User: newUser }),
}));
