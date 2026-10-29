"use client";

import { EmailCredentialsForm } from "@/components/settings/email-credentials-form";
import { NotifyWebhookSettings } from "@/components/settings/notify-webhook-settings";
import { PushNotifySettings } from "@/components/settings/push-notify-settings";

/** Settings → 通知: email, PWA, Feishu, overseas webhooks. */
export function NotificationsSettingsPanel() {
  return (
    <div className="settings-ui space-y-0">
      <EmailCredentialsForm compact />
      <PushNotifySettings />
      <NotifyWebhookSettings kind="feishu" />
      <NotifyWebhookSettings kind="overseas" />
    </div>
  );
}
