"use client";

import { create } from "zustand";

type LoginModalState = {
  open: boolean;
  /** True only while LoginModalBridge is mounted (MainAppShell). */
  hostMounted: boolean;
  setHostMounted: (mounted: boolean) => void;
  openLogin: () => void;
  closeLogin: () => void;
};

export const useLoginModalStore = create<LoginModalState>((set, get) => ({
  open: false,
  hostMounted: false,
  setHostMounted: (mounted) => set({ hostMounted: mounted }),
  openLogin: () => {
    if (!get().hostMounted) return;
    set({ open: true });
  },
  closeLogin: () => set({ open: false }),
}));

export function useLoginModal() {
  return useLoginModalStore();
}

/**
 * Returns the store API only when a LoginModal host is mounted.
 * Marketing / auth pages have no host → callers should use `/login` Link.
 */
export function useLoginModalOptional() {
  const hostMounted = useLoginModalStore((s) => s.hostMounted);
  const api = useLoginModalStore();
  if (!hostMounted) return null;
  return api;
}

export function LoginModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
