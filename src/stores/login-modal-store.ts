"use client";

import { create } from "zustand";

type LoginModalState = {
  open: boolean;
  openLogin: () => void;
  closeLogin: () => void;
};

export const useLoginModalStore = create<LoginModalState>((set) => ({
  open: false,
  openLogin: () => set({ open: true }),
  closeLogin: () => set({ open: false }),
}));

export function useLoginModal() {
  return useLoginModalStore();
}

/** Always available (Zustand); kept for call-site compatibility. */
export function useLoginModalOptional() {
  return useLoginModalStore();
}

export function LoginModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
