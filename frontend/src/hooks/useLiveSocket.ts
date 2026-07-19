"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { LiveSocketMessage, Match } from "@/lib/types";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";

interface UseLiveSocketOptions {
  enabled?: boolean;
  onMatchUpdate?: (match: Match, event?: string) => void;
  onMessage?: (msg: LiveSocketMessage) => void;
}

export function useLiveSocket({
  enabled = true,
  onMatchUpdate,
  onMessage,
}: UseLiveSocketOptions = {}) {
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<LiveSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const onMatchUpdateRef = useRef(onMatchUpdate);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMatchUpdateRef.current = onMatchUpdate;
    onMessageRef.current = onMessage;
  }, [onMatchUpdate, onMessage]);

  const connect = useCallback(() => {
    if (typeof window === "undefined" || !enabled) return;

    const url = `${WS_BASE.replace(/\/$/, "")}/ws/live/`;
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      retryRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as LiveSocketMessage;
        setLastMessage(data);
        onMessageRef.current?.(data);
        if (data.type === "match_update" && data.match) {
          onMatchUpdateRef.current?.(data.match, data.event);
        }
      } catch {
        // ignore malformed payloads
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      if (!enabled) return;
      const delay = Math.min(1000 * 2 ** retryRef.current, 15000);
      retryRef.current += 1;
      window.setTimeout(connect, delay);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      wsRef.current?.close();
      setConnected(false);
      return;
    }
    connect();
    return () => {
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [connect, enabled]);

  return { connected, lastMessage };
}

export default useLiveSocket;
