"use client";

import {
  useCallback,
  type FormEvent,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { Session } from "next-auth";
import type { AssetType } from "@/lib/types";

type MutateWatch = {
  mutateAsync: (vars: {
    symbol: string;
    assetType: AssetType;
  }) => Promise<unknown>;
};

type MutateAlert = {
  mutateAsync: (vars: {
    symbol: string;
    assetType: AssetType;
    condition: "gte" | "lte";
    triggerPrice: number;
  }) => Promise<unknown>;
};

type MutateComment = {
  mutateAsync: (vars: {
    symbol: string;
    assetType: AssetType;
    content: string;
  }) => Promise<unknown>;
};

type MutateDeleteComment = {
  mutateAsync: (id: string) => Promise<unknown>;
};

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
  setWatchBusy: Dispatch<SetStateAction<boolean>>;
  loadTab: () => Promise<void>;
  tAlerts: (key: string) => string;
  tCommon: (key: string) => string;
  createAlertMut: MutateAlert;
  addWatch: MutateWatch;
  removeWatch: MutateWatch;
  createCommentMut: MutateComment;
  deleteCommentMut: MutateDeleteComment;
};

/** Comment / alert / watchlist write paths for the symbol page (stable callbacks). */
export function useSymbolPageMutations(a: Args) {
  const postComment = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!a.commentText.trim() || a.commentBusy) return;
      a.setCommentBusy(true);
      try {
        await a.createCommentMut.mutateAsync({
          symbol: a.symbol,
          assetType: a.assetType,
          content: a.commentText,
        });
        a.setCommentText("");
        await a.loadTab();
      } catch {
        /* ignore */
      } finally {
        a.setCommentBusy(false);
      }
    },
    [
      a.commentText,
      a.commentBusy,
      a.setCommentBusy,
      a.createCommentMut,
      a.symbol,
      a.assetType,
      a.setCommentText,
      a.loadTab,
    ],
  );

  const deleteComment = useCallback(
    async (id: string) => {
      await a.deleteCommentMut.mutateAsync(id);
      await a.loadTab();
    },
    [a.deleteCommentMut, a.loadTab],
  );

  const createAlert = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      a.setAlertMsg(null);
      if (!a.session?.user) {
        a.setAlertMsg(a.tAlerts("loginRequired"));
        return;
      }
      if (a.alertBusy) return;
      a.setAlertBusy(true);
      try {
        await a.createAlertMut.mutateAsync({
          symbol: a.symbol,
          assetType: a.assetType,
          condition: a.alertCondition,
          triggerPrice: Number(a.alertPrice),
        });
        a.setAlertMsg("OK");
        a.setAlertPrice("");
      } catch {
        a.setAlertMsg(a.tCommon("error"));
      } finally {
        a.setAlertBusy(false);
      }
    },
    [
      a.setAlertMsg,
      a.session?.user,
      a.tAlerts,
      a.alertBusy,
      a.setAlertBusy,
      a.createAlertMut,
      a.symbol,
      a.assetType,
      a.alertCondition,
      a.alertPrice,
      a.setAlertPrice,
      a.tCommon,
    ],
  );

  const toggleWatchlist = useCallback(async () => {
    if (!a.session?.user) {
      a.setAlertMsg(a.tAlerts("loginRequired"));
      return;
    }
    a.setWatchBusy(true);
    try {
      if (a.inWatchlist) {
        await a.removeWatch.mutateAsync({
          symbol: a.symbol,
          assetType: a.assetType,
        });
      } else {
        await a.addWatch.mutateAsync({
          symbol: a.symbol,
          assetType: a.assetType,
        });
      }
    } finally {
      a.setWatchBusy(false);
    }
  }, [
    a.session?.user,
    a.setAlertMsg,
    a.tAlerts,
    a.setWatchBusy,
    a.inWatchlist,
    a.removeWatch,
    a.addWatch,
    a.symbol,
    a.assetType,
  ]);

  return { postComment, deleteComment, createAlert, toggleWatchlist };
}
