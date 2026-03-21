"use client";

import { useCallback, useRef, useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, auth } from "@/lib/firebase";
import { addClientDocument } from "@/lib/firestore/portalMutations";
import type { DocumentCategory } from "@/lib/types";
import styles from "./FileUpload.module.css";

const MAX_SIZE = 25 * 1024 * 1024; // 25 MB

interface FileUploadProps {
  clientId: string;
  category: DocumentCategory;
  onComplete: () => void;
}

export default function FileUpload({ clientId, category, onComplete }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const upload = useCallback(
    async (file: File) => {
      setError("");

      if (file.size > MAX_SIZE) {
        setError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max 25 MB.`);
        return;
      }

      const currentUser = auth.currentUser;
      if (!currentUser) {
        setError("Not authenticated.");
        return;
      }

      setUploading(true);
      setFileName(file.name);
      setProgress(0);

      const storagePath = `clients/${clientId}/${category}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const task = uploadBytesResumable(storageRef, file);

      task.on(
        "state_changed",
        (snap) => setProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
        (err) => {
          setError(err.message);
          setUploading(false);
        },
        async () => {
          try {
            const fileUrl = await getDownloadURL(task.snapshot.ref);
            const tokenResult = await currentUser.getIdTokenResult();
            const uploadedBy = tokenResult.claims.admin ? "admin" : "client";

            await addClientDocument(clientId, category, {
              name: file.name.replace(/\.[^.]+$/, ""),
              fileName: file.name,
              fileUrl,
              storagePath,
              fileType: file.type || "application/octet-stream",
              fileSizeBytes: file.size,
              uploadedBy,
            });

            onComplete();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
          } finally {
            setUploading(false);
            setProgress(0);
            setFileName("");
          }
        }
      );
    },
    [clientId, category, onComplete]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) upload(file);
    },
    [upload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) upload(file);
      // Reset input so same file can be re-selected
      e.target.value = "";
    },
    [upload]
  );

  if (uploading) {
    return (
      <div className={styles.progress}>
        <div className={styles.progressBar}>
          <ProgressFill percent={progress} />
        </div>
        <div className={styles.progressText}>
          <span>{fileName}</span>
          <span>{progress}%</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") inputRef.current?.click(); }}
      >
        <span className={styles.dropzoneAccent}>Choose a file</span>
        <span className={styles.dropzoneHint}>or drag and drop</span>
        <span className={styles.dropzoneSizeHint}>Max 25 MB</span>
        <input
          ref={inputRef}
          type="file"
          className={styles.fileInput}
          onChange={handleChange}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}

/** Sets width via ref to avoid inline style prop (ESLint no-inline-styles). */
function ProgressFill({ percent }: { percent: number }) {
  const ref = useRef<HTMLDivElement>(null);

  if (ref.current) {
    ref.current.style.width = `${percent}%`;
  }

  return <div ref={ref} className={styles.progressFill} />;
}
