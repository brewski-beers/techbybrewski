"use client";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
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
