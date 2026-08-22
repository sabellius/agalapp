import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
  },
}));

import { authClient } from "@/lib/auth-client";
import { DemoLogin } from "./demo-login";

const mockedSignIn = vi.mocked(authClient.signIn.email);

type SignInResult = Awaited<ReturnType<typeof authClient.signIn.email>>;

const signInSuccess = {} as SignInResult;
const signInFailure = {
  error: { code: "INVALID_EMAIL_OR_PASSWORD" },
} as SignInResult;

function stubLocationHref() {
  Object.defineProperty(window, "location", {
    value: { href: "" },
    writable: true,
  });
}

describe("DemoLogin", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    stubLocationHref();
  });

  it("renders three demo account buttons", () => {
    render(<DemoLogin />);

    expect(screen.getByText("כניסה כמשתמש")).toBeInTheDocument();
    expect(screen.getByText("כניסה כבעל עגלה")).toBeInTheDocument();
    expect(screen.getByText("כניסה כמנהל")).toBeInTheDocument();
  });

  it("redirects to dashboard on successful login", async () => {
    mockedSignIn.mockResolvedValue(signInSuccess);
    const user = userEvent.setup();

    render(<DemoLogin />);
    await user.click(screen.getByText("כניסה כמנהל"));

    await waitFor(() => {
      expect(window.location.href).toBe("/dashboard");
    });
  });

  it("shows error with reseed hint on failed login", async () => {
    mockedSignIn.mockResolvedValue(signInFailure);
    const user = userEvent.setup();

    render(<DemoLogin />);
    await user.click(screen.getByText("כניסה כמנהל"));

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(
      "הכניסה נכשלה - ודא שמסד הנתונים מאוכלס (pnpm run seed)",
    );
    expect(window.location.href).toBe("");
  });

  it("clears the error on the next attempt", async () => {
    mockedSignIn.mockResolvedValueOnce(signInFailure);
    const user = userEvent.setup();

    render(<DemoLogin />);
    await user.click(screen.getByText("כניסה כמנהל"));
    expect(await screen.findByRole("alert")).toBeInTheDocument();

    mockedSignIn.mockResolvedValue(signInSuccess);
    await user.click(screen.getByText("כניסה כמנהל"));

    await waitFor(() => {
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });
});
