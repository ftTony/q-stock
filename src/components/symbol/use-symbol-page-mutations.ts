"use client";

import { type FormEvent, type Dispatch, type SetStateAction } from "react";
import type { Session } from "next-auth";
import type { AssetType } from "@/lib/types";

type Args = {
  session: Session | null;
  symbol: string;
  assetType: AssetType;
  commentText: string;
  commentBusy: boolean;
  setCommentBusy: Dispatch<SetStateAction<boolean>>;
  setCommentText: Dispatch<SetStateAction<string>>;
  alertPrice: string;
  alertCondition: "gte" | "lte";
  alertBusy: boolean;
  setAlertBusy: Dispatch<SetStateAction<boolean>>;
  setAlertMsg: Dispatch<SetStateAction<string | null>>;
  setAlertPrice: Dispatch<SetStateAction<string>>;
  inWatchlist: boolean;
  setInWatchlist: Dispatch<SetStateAction<boolean>>;
  setWatchBusy: Dispatch<SetStateAction<boolean>>;
  loadTab: () => Promise<void>;
  tAlerts: (key: string) => string;
  tCommon: (key: string) => string;
};

/** Comment / alert / watchlist write paths for the symbol page. */
export function symbolPageMutations(a: Args) {
  async function postComment(e: FormEvent) {
    e.preventDefault();
    if (!a.commentText.trim() || a.commentBusy) return;
    a.setCommentBusy(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: a.symbol,
          assetType: a.assetType,
          content: a.commentText,
        }),
      });
      if (res.ok) {
        a.setCommentText("");
        await a.loadTab();
      }
    } finally {
      a.setCommentBusy(false);
    }
  }

  async function deleteComment(id: string) {
    await fetch(`/api/comments?id=${id}`, { method: "DELETE" });
    await a.loadTab();
  }

  async function createAlert(e: FormEvent) {
    e.preventDefault();
    a.setAlertMsg(null);
    if (!a.session?.user) {
      a.setAlertMsg(a.tAlerts("loginRequired"));
      return;
    }
    if (a.alertBusy) return;
    a.setAlertBusy(true);
    try {
      const res = await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol: a.symbol,
          assetType: a.assetType,
          condition: a.alertCondition,
          triggerPrice: Number(a.alertPrice),
        }),
      });
      if (!res.ok) {
        a.setAlertMsg(a.tCommon("error"));
        return;
      }
      a.setAlertMsg("OK");
      a.setAlertPrice("");
    } finally {
      a.setAlertBusy(false);
    }
  }

  async function toggleWatchlist() {
    if (!a.session?.user) {
      a.setAlertMsg(a.tAlerts("loginRequired"));
      return;
    }
    a.setWatchBusy(true);
    try {
      if (a.inWatchlist) {
        await fetch(
          `/api/watchlist?symbol=${a.symbol}&assetType=${a.assetType}`,
          { method: "DELETE" },
        );
        a.setInWatchlist(false);
      } else {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            symbol: a.symbol,
            assetType: a.assetType,
          }),
        });
        if (res.ok) a.setInWatchlist(true);
      }
    } finally {
      a.setWatchBusy(false);
    }
  }

  return { postComment, deleteComment, createAlert, toggleWatchlist };
}
