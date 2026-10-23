"use client";

import dynamic from "next/dynamic";
import {
  SettingsModalProvider,
  useSettingsModal,
} from "@/components/settings/settings-modal-context";
import {
  LoginModalProvider,
  useLoginModal,
} from "@/components/auth/login-modal-context";

const SettingsModal = dynamic(
  () =>
    import("@/components/settings/settings-modal").then((m) => ({
      default: m.SettingsModal,
    })),
  { ssr: false },
);

const LoginModal = dynamic(
  () =>
    import("@/components/auth/login-modal").then((m) => ({
      default: m.LoginModal,
    })),
  { ssr: false },
);

function SettingsModalBridge() {
  const { open, setupKeys, closeSettings } = useSettingsModal();
  return (
    <SettingsModal
      open={open}
      setupKeys={setupKeys}
      onClose={closeSettings}
      onSetupKeysDone={closeSettings}
    />
  );
}

function LoginModalBridge() {
  const { open, closeLogin } = useLoginModal();
  return <LoginModal open={open} onClose={closeLogin} />;
}

/** Providers + lazy modals for MainAppShell (settings + login). */
export function SettingsModalHost({ children }: { children: React.ReactNode }) {
  return (
    <LoginModalProvider>
      <SettingsModalProvider>
        {children}
        <SettingsModalBridge />
        <LoginModalBridge />
      </SettingsModalProvider>
    </LoginModalProvider>
  );
}
