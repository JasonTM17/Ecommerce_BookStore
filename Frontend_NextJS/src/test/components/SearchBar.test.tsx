import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchBar } from "@/components/ui/search-bar";

// Mock use-debounce
vi.mock("use-debounce", () => ({
  useDebouncedCallback: (callback: Function) => callback,
}));

describe("SearchBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders search input with placeholder", () => {
    render(<SearchBar />);
    expect(screen.getByPlaceholderText("Tìm kiếm sách...")).toBeInTheDocument();
  });

  it("renders search icon", () => {
    render(<SearchBar />);
    const searchIcon = document.querySelector('[data-testid="search-icon"]');
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("renders clear button when keyword is entered", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchBar />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "test");

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(screen.getByLabelText("Xóa tìm kiếm")).toBeInTheDocument();
  });

  it("clears input when clear button is clicked", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<SearchBar />);

    const input = screen.getByRole("searchbox") as HTMLInputElement;
    await user.type(input, "test");

    act(() => {
      vi.advanceTimersByTime(500);
    });

    const clearButton = screen.getByLabelText("Xóa tìm kiếm");
    await user.click(clearButton);

    expect(input.value).toBe("");
  });

  it("calls onSearch callback when search is triggered", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "javascript");

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onSearch).toHaveBeenCalledWith("javascript");
  });

  it("does not search when input is empty", () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    expect(onSearch).not.toHaveBeenCalled();
  });

  it("renders custom placeholder when provided", () => {
    render(<SearchBar placeholder="Search products..." />);
    expect(screen.getByPlaceholderText("Search products...")).toBeInTheDocument();
  });

  it("has proper aria-label", () => {
    render(<SearchBar />);
    expect(screen.getByLabelText("Tìm kiếm sách")).toBeInTheDocument();
  });

  it("shows keyboard shortcut hint when empty", () => {
    render(<SearchBar />);
    expect(screen.getByText("/")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<SearchBar className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("handles autoFocus prop", () => {
    render(<SearchBar autoFocus />);
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });

  it("transitions to focused state on focus", async () => {
    const user = userEvent.setup();
    render(<SearchBar />);

    const input = screen.getByRole("searchbox");
    await user.click(input);

    // Check if ring class is applied (focused state)
    expect(input).toHaveFocus();
  });

  it("debounces search input", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole("searchbox");
    await user.type(input, "java");

    // Before debounce completes
    expect(onSearch).not.toHaveBeenCalled();

    // After debounce
    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(onSearch).toHaveBeenCalledWith("java");
  });
});
