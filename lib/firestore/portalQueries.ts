"use client";
import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  where,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Client,
  ClientDocument,
  ClientContract,
  ClientMessage,
  ClientInvoice,
} from "@/lib/types";

function withId<T>(id: string, data: Record<string, unknown>): T {
  return { id, ...data } as T;
}

// ── Clients (admin) ────────────────────────────────────────────

export async function getAllClients(): Promise<Client[]> {
  const q = query(collection(db, "clients"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Client>(d.id, d.data()));
}

export async function getClient(uid: string): Promise<Client | null> {
  const snap = await getDoc(doc(db, "clients", uid));
  if (!snap.exists()) return null;
  return withId<Client>(snap.id, snap.data());
}

// ── Sub-collections ────────────────────────────────────────────

export async function getClientDocuments(
  uid: string,
  category: "deliverables" | "assets" | "files"
): Promise<ClientDocument[]> {
  const q = query(
    collection(db, "clients", uid, category),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<ClientDocument>(d.id, d.data()));
}

export async function getClientContracts(uid: string): Promise<ClientContract[]> {
  const q = query(
    collection(db, "clients", uid, "contracts"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<ClientContract>(d.id, d.data()));
}

export async function getClientInvoices(uid: string): Promise<ClientInvoice[]> {
  const q = query(
    collection(db, "clients", uid, "invoices"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<ClientInvoice>(d.id, d.data()));
}

// ── Real-time messages ─────────────────────────────────────────

export function subscribeToMessages(
  uid: string,
  callback: (messages: ClientMessage[]) => void
): Unsubscribe {
  const q = query(
    collection(db, "clients", uid, "messages"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => withId<ClientMessage>(d.id, d.data())));
  });
}

// ── Unread message counts ──────────────────────────────────────

/**
 * Portal: subscribe to unread messages sent by admin for a given client.
 * Used in ClientShell to show badge on Messages nav item.
 */
export function subscribeToUnreadMessageCount(
  clientId: string,
  callback: (count: number) => void
): Unsubscribe {
  const q = query(
    collection(db, "clients", clientId, "messages"),
    where("isRead", "==", false),
    where("senderRole", "==", "admin")
  );
  return onSnapshot(q, (snap) => callback(snap.size));
}

/**
 * Admin (single client): subscribe to unread messages sent by this client.
 * Used in admin client view to show badge on Messages tab.
 */
export function subscribeToClientUnreadForAdmin(
  clientId: string,
  callback: (count: number) => void
): Unsubscribe {
  const q = query(
    collection(db, "clients", clientId, "messages"),
    where("isRead", "==", false),
    where("senderRole", "==", "client")
  );
  return onSnapshot(q, (snap) => callback(snap.size));
}

/**
 * Admin (all clients): subscribe to unread client message counts across all clients.
 * Uses a COLLECTION_GROUP query on "messages".
 * Returns map of clientId -> unread count (only clients with > 0 unread).
 * Requires composite COLLECTION_GROUP index: isRead ASC + senderRole ASC + createdAt DESC.
 */
export function subscribeToAdminUnreadCounts(
  callback: (counts: Record<string, number>) => void
): Unsubscribe {
  const q = query(
    collectionGroup(db, "messages"),
    where("isRead", "==", false),
    where("senderRole", "==", "client"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const counts: Record<string, number> = {};
    snap.docs.forEach((d) => {
      // Path: clients/{clientId}/messages/{messageId}
      const clientId = d.ref.parent.parent?.id;
      if (clientId) {
        counts[clientId] = (counts[clientId] ?? 0) + 1;
      }
    });
    callback(counts);
  });
}
