import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

vi.mock("next/image", () => ({
  default: (props: {
    src: string | object;
    alt: string;
    fill?: boolean;
    className?: string;
    onLoad?: () => void;
    priority?: boolean;
    unoptimized?: boolean;
    [key: string]: unknown;
  }) => {
    const { priority: _priority, unoptimized: _unoptimized, ...rest } = props;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        data-testid={rest["data-testid"]}
        src={typeof rest.src === "string" ? rest.src : ""}
        alt={String(rest.alt ?? "")}
        className={typeof rest.className === "string" ? rest.className : undefined}
      />
    );
  },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
  redirect: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
  setAuthTokens: vi.fn(),
  clearAuthTokens: vi.fn(),
  apiPublic: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("@/components/providers/auth-provider", () => ({
  useAuth: () => ({
    user: { id: 1, email: "test@example.com", fullName: "Test User" },
    isAuthenticated: true,
    isLoading: false,
  }),
}));

vi.mock("@/components/providers/language-provider", () => ({
  useLanguage: () => ({
    locale: "vi",
    setLocale: vi.fn(),
    t: (key: string) => key,
    isLoading: false,
  }),
}));

global.fetch = vi.fn();
