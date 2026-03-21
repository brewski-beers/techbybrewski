"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeToMessages } from "@/lib/firestore/portalQueries";
import { sendMessage, markMessageRead } from "@/lib/firestore/portalMutations";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui";
import type { ClientMessage } from "@/lib/types";
import styles from "@/styles/chat.module.css";

interface MessageThreadProps {
  clientId: string;
  /** Viewer role — determines which bubbles are "mine" */
  viewerRole: "client" | "admin";
}

export default function MessageThread({ clientId, viewerRole }: MessageThreadProps) {
  const [messages, setMessages] = useState<ClientMessage[]>([]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Real-time subscription
  useEffect(() => {
    const unsub = subscribeToMessages(clientId, (msgs) => {
      setMessages(msgs);

      // Mark unread messages from the other side as read
      msgs.forEach((m) => {
        if (!m.isRead && m.senderRole !== viewerRole) {
          markMessageRead(clientId, m.id).catch(console.error);
        }
      });
    });
    return unsub;
  }, [clientId, viewerRole]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async () => {
    const trimmed = body.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      await sendMessage(clientId, trimmed);
      setBody("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (msg: ClientMessage) => {
    if (!msg.createdAt?.toDate) return "";
    const d = msg.createdAt.toDate();
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" }) +
      " " +
      d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className={styles.messagesPage}>
      {messages.length === 0 ? (
        <div className={styles.emptyThread}>No messages yet. Start the conversation below.</div>
      ) : (
        <div className={styles.thread}>
          {messages.map((msg) => {
            const isMine = msg.senderRole === viewerRole;
            return (
              <div
                key={msg.id}
                className={isMine ? styles.bubbleClient : styles.bubbleAdmin}
              >
                <div>{msg.body}</div>
                <div className={styles.bubbleMeta}>
                  <span>{formatTime(msg)}</span>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      {auth.currentUser && (
        <div className={styles.composer}>
          <textarea
            className={styles.composerInput}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message…"
            rows={1}
          />
          <Button onClick={handleSend} loading={sending} disabled={!body.trim()}>
            Send
          </Button>
        </div>
      )}
    </div>
  );
}
