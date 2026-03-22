import { render, screen, act } from "@testing-library/react";
import { vi } from "vitest";

// ── Hoisted mocks ────────────────────────────────────────────
const { mockOnAuthStateChanged } = vi.hoisted(() => ({
  mockOnAuthStateChanged: vi.fn(),
}));

vi.mock("@/lib/firebase", () => ({ auth: {} }));

vi.mock("firebase/auth", () => ({
  onAuthStateChanged: mockOnAuthStateChanged,
}));

vi.mock("@/components/admin/AdminLogin/AdminLogin", () => ({
  default: () => <div>AdminLogin</div>,
}));

vi.mock("@/components/admin/AdminShell/AdminShell", () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div>AdminShell: {children}</div>
  ),
}));

vi.mock("../AdminAuthProvider.module.css", () => ({ default: {} }));

// ── Helper ───────────────────────────────────────────────────
import AdminAuthProvider from "../AdminAuthProvider";

function simulateAuth(user: object | null) {
  mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: object | null) => void) => {
    cb(user);
    return () => {};
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ────────────────────────────────────────────────────
describe("AdminAuthProvider", () => {
  it("shows loading while auth state resolves", async () => {
    // Never invoke the callback → stays in loading state
    mockOnAuthStateChanged.mockImplementation(() => () => {});
    render(
      <AdminAuthProvider>
        <div>Protected</div>
      </AdminAuthProvider>
    );
    expect(screen.getByText("Checking access...")).toBeInTheDocument();
  });

  it("renders AdminLogin when no user is signed in", async () => {
    simulateAuth(null);
    await act(async () => {
      render(
        <AdminAuthProvider>
          <div>Protected</div>
        </AdminAuthProvider>
      );
    });
    expect(screen.getByText("AdminLogin")).toBeInTheDocument();
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("renders AdminLogin when user lacks admin claim", async () => {
    const mockUser = {
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { admin: false } }),
    };
    simulateAuth(mockUser);
    await act(async () => {
      render(
        <AdminAuthProvider>
          <div>Protected</div>
        </AdminAuthProvider>
      );
    });
    expect(screen.getByText("AdminLogin")).toBeInTheDocument();
    expect(screen.queryByText("Protected")).not.toBeInTheDocument();
  });

  it("renders children inside AdminShell for admin user", async () => {
    const mockUser = {
      getIdTokenResult: vi.fn().mockResolvedValue({ claims: { admin: true } }),
    };
    simulateAuth(mockUser);
    await act(async () => {
      render(
        <AdminAuthProvider>
          <div>Protected</div>
        </AdminAuthProvider>
      );
    });
    expect(screen.getByText(/AdminShell/)).toBeInTheDocument();
    expect(screen.getByText("Protected")).toBeInTheDocument();
  });
});
