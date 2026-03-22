import { render, screen, act, renderHook } from "@testing-library/react";
import { vi } from "vitest";

// ── Hoisted mocks ────────────────────────────────────────────
const { mockOnAuthStateChanged, mockIsSignInWithEmailLink } = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn(),
  mockIsSignInWithEmailLink: vi.fn().mockReturnValue(false),
}));

vi.mock("@/lib/firebase", () => ({ auth: {} }));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
  isSignInWithEmailLink: mockIsSignInWithEmailLink,
  signInWithEmailLink: vi.fn(),
}));

vi.mock("@/components/portal/ClientLogin/ClientLogin", () => ({
  default: () => <div>ClientLogin</div>,
  EMAIL_STORAGE_KEY: "emailForSignIn",
}));

vi.mock("@/components/portal/ClientShell/ClientShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>ClientShell: {children}</div>
  ),
}));

vi.mock("../ClientAuthProvider.module.css", () => ({ default: {} }));

// ── Component under test ─────────────────────────────────────
import ClientAuthProvider, { usePortalUser } from "../ClientAuthProvider";

function simulateAuth(user: object | null) {
  mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: object | null) => void) => {
    cb(user);
    return () => {};
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockIsSignInWithEmailLink.mockReturnValue(false);
});

// ── Tests ────────────────────────────────────────────────────
describe("ClientAuthProvider", () => {
  it("shows loading while auth state resolves", async () => {
    mockOnAuthStateChanged.mockImplementation(() => () => {});
    render(
      <ClientAuthProvider>
        <div>Protected</div>
      </ClientAuthProvider>
    );
    expect(screen.getByText("Loading portal…")).toBeInTheDocument();
  });

  it("renders ClientLogin when no user is signed in", async () => {
    simulateAuth(null);
    await act(async () => {
      render(
        <ClientAuthProvider>
          <div>Protected</div>
        </ClientAuthProvider>
      );
    });
    expect(screen.getByText("ClientLogin")).toBeInTheDocument();
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("renders ClientLogin when user lacks client claim", async () => {
    const mockUser = {
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { client: false } }),
    };
    simulateAuth(mockUser);
    await act(async () => {
      render(
        <ClientAuthProvider>
          <div>Protected</div>
        </ClientAuthProvider>
      );
    });
    expect(screen.getByText("ClientLogin")).toBeInTheDocument();
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("renders children inside ClientShell for client user", async () => {
    const mockUser = {
      uid: "uid-abc",
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { client: true } }),
    };
    simulateAuth(mockUser);
    await act(async () => {
      render(
        <ClientAuthProvider>
          <div>Protected</div>
        </ClientAuthProvider>
      );
    });
    expect(screen.getByText(/ClientShell/)).toBeInTheDocument();
    expect(screen.getByText("Protected")).toBeInTheDocument();
  });

  it("usePortalUser exposes user and clientId equal to uid", async () => {
    const mockUser = {
      uid: "uid-xyz",
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { client: true } }),
    };
    simulateAuth(mockUser);

    let portalUser: { user: unknown; clientId: string } | undefined;
    const Probe = () => {
      portalUser = usePortalUser();
      return null;
    };

    await act(async () => {
      render(
        <ClientAuthProvider>
          <Probe />
        </ClientAuthProvider>
      );
    });

    expect(portalUser?.clientId).toBe("uid-xyz");
    expect(portalUser?.user).toBe(mockUser);
  });
});
