"use client";
import {
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import type { ClientFormData } from "@/lib/types";

// ── Client profile (admin) ─────────────────────────────────────

export async function updateClient(uid: string, data: Partial<ClientFormData>): Promise<void> {
  await updateDoc(doc(db, "clients", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteClient(uid: string): Promise<void> {
  await deleteDoc(doc(db, "clients", uid));
}

// ── Messages ───────────────────────────────────────────────────

export async function sendMessage(
  clientUid: string,
  body: string,
  attachmentUrls: string[] = []
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error("Not authenticated");

  const tokenResult = await currentUser.getIdTokenResult();
  const senderRole = tokenResult.claims.admin ? "admin" : "client";

  await addDoc(collection(db, "clients", clientUid, "messages"), {
    senderRole,
    senderEmail: currentUser.email ?? "",
    body,
    attachmentUrls,
    isRead: false,
    createdAt: serverTimestamp(),
  });
}

export async function markMessageRead(clientUid: string, messageId: string): Promise<void> {
  await updateDoc(doc(db, "clients", clientUid, "messages", messageId), {
    isRead: true,
  });
}

// ── Invoices (admin) ───────────────────────────────────────────

export async function createInvoice(
  clientUid: string,
  data: {
    type: "one-time" | "recurring";
    amountCents: number;
    currency: string;
    description: string;
    dueDate: Date | null;
  }
): Promise<string> {
  const ref = await addDoc(collection(db, "clients", clientUid, "invoices"), {
    ...data,
    status: "draft",
    mercuryInvoiceId: null,
    mercuryPaymentUrl: null,
    paidAt: null,
    dueDate: data.dueDate ?? null,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateInvoiceStatus(
  clientUid: string,
  invoiceId: string,
  status: "draft" | "sent" | "pending" | "paid" | "failed" | "refunded"
): Promise<void> {
  await updateDoc(doc(db, "clients", clientUid, "invoices", invoiceId), { status });
}

// ── Documents (admin uploads metadata after Storage upload) ───

export async function addClientDocument(
  clientUid: string,
  category: "contracts" | "deliverables" | "assets" | "files",
  data: {
    name: string;
    fileName: string;
    fileUrl: string;
    storagePath: string;
    fileType: string;
    fileSizeBytes: number;
    uploadedBy?: "client" | "admin";
    signatureUrl?: string | null;
  }
): Promise<string> {
  const payload: Record<string, unknown> = {
    name: data.name,
    fileName: data.fileName,
    fileUrl: data.fileUrl,
    storagePath: data.storagePath,
    fileType: data.fileType,
    fileSizeBytes: data.fileSizeBytes,
    uploadedBy: data.uploadedBy ?? "admin",
    createdAt: serverTimestamp(),
  };

  if (category === "contracts") {
    payload.signatureStatus = "none";
    payload.signatureUrl = data.signatureUrl ?? null;
  }

  const ref = await addDoc(collection(db, "clients", clientUid, category), payload);
  return ref.id;
}

export async function deleteClientDocument(
  clientUid: string,
  category: "contracts" | "deliverables" | "assets" | "files",
  docId: string
): Promise<void> {
  await deleteDoc(doc(db, "clients", clientUid, category, docId));
}

// ── Contract Signature (admin) ──────────────────────────────────

export async function updateContractSignature(
  clientUid: string,
  docId: string,
  signatureUrl: string | null,
  signatureStatus: "none" | "pending" | "signed"
): Promise<void> {
  await updateDoc(doc(db, "clients", clientUid, "contracts", docId), {
    signatureUrl,
    signatureStatus,
    updatedAt: serverTimestamp(),
  });
}
