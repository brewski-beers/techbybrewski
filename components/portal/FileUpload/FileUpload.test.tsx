import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const {
  mockRef,
  mockUploadBytesResumable,
  mockAddClientDocument,
  mockAuth,
} = vi.hoisted(() => {
  const mockTask = { on: vi.fn(), snapshot: { ref: {} } };
  return {
    mockRef: vi.fn(() => ({})),
    mockUploadBytesResumable: vi.fn(() => mockTask),
    mockAddClientDocument: vi.fn(() => Promise.resolve("doc-id")),
    mockAuth: {
      currentUser: null as null | {
        getIdTokenResult: () => Promise<{ claims: Record<string, unknown> }>;
      },
    },
  };
});

vi.mock("firebase/storage", () => ({
  ref: mockRef,
  uploadBytesResumable: mockUploadBytesResumable,
  getDownloadURL: vi.fn(() => Promise.resolve("https://cdn.example.com/file.pdf")),
}));

vi.mock("@/lib/firebase", () => ({
  storage: {},
  auth: mockAuth,
}));

vi.mock("@/lib/firestore/portalMutations", () => ({
  addClientDocument: mockAddClientDocument,
}));

vi.mock("./FileUpload.module.css", () => ({ default: {} }));

import FileUpload from "./FileUpload";

function makeFile(name: string, size: number, type = "application/pdf"): File {
  const file = new File(["x"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

describe("FileUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.currentUser = null;
  });

  it("renders the upload dropzone", () => {
    // Given: the FileUpload component is mounted
    // When: it renders
    render(<FileUpload clientId="client-1" category="files" onComplete={vi.fn()} />);

    // Then: an upload dropzone/button is visible
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText(/choose a file/i)).toBeInTheDocument();
  });

  it("calls uploadBytesResumable when a valid file is selected by an authenticated user", () => {
    // Given: a user is authenticated
    mockAuth.currentUser = {
      getIdTokenResult: () => Promise.resolve({ claims: { client: true } }),
    };

    render(<FileUpload clientId="client-1" category="files" onComplete={vi.fn()} />);

    const input = document.querySelector("input[type='file']") as HTMLInputElement;

    // When: the file input changes with a valid file
    const file = makeFile("report.pdf", 1024);
    fireEvent.change(input, { target: { files: [file] } });

    // Then: uploadBytesResumable is invoked with the file
    expect(mockUploadBytesResumable).toHaveBeenCalledWith(expect.anything(), file);
  });

  it("shows an error and does not upload when file exceeds 25 MB", () => {
    // Given: the user is authenticated
    mockAuth.currentUser = {
      getIdTokenResult: () => Promise.resolve({ claims: { client: true } }),
    };

    render(<FileUpload clientId="client-1" category="files" onComplete={vi.fn()} />);

    const input = document.querySelector("input[type='file']") as HTMLInputElement;

    // When: a file larger than 25 MB is selected
    const bigFile = makeFile("huge.zip", 26 * 1024 * 1024);
    fireEvent.change(input, { target: { files: [bigFile] } });

    // Then: an error message is shown
    expect(screen.getByText(/file too large/i)).toBeInTheDocument();

    // And: no upload was initiated
    expect(mockUploadBytesResumable).not.toHaveBeenCalled();
  });

  it("shows an error when no user is authenticated", () => {
    // Given: no user is signed in (currentUser is null)
    mockAuth.currentUser = null;

    render(<FileUpload clientId="client-1" category="files" onComplete={vi.fn()} />);

    const input = document.querySelector("input[type='file']") as HTMLInputElement;

    // When: a file is selected
    const file = makeFile("doc.pdf", 1024);
    fireEvent.change(input, { target: { files: [file] } });

    // Then: "Not authenticated." error is shown
    expect(screen.getByText("Not authenticated.")).toBeInTheDocument();

    // And: no upload was initiated
    expect(mockUploadBytesResumable).not.toHaveBeenCalled();
  });
});
