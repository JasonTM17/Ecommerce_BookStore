import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { SearchBar } from "@/components/ui/search-bar";

vi.mock("use-debounce", () => ({
  useDebouncedCallback: (callback: Function, delay = 0) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: unknown[]) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => callback(...args), delay);
    };
  },
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
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("renders clear button when keyword is entered", async () => {
    render(<SearchBar />);

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "test" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    expect(screen.getByLabelText("Xóa tìm kiếm")).toBeInTheDocument();
  });

  it("clears input when clear button is clicked", async () => {
    render(<SearchBar />);

    const input = screen.getByRole("searchbox") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "test" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });

    const clearButton = screen.getByLabelText("Xóa tìm kiếm");
    fireEvent.click(clearButton);

    expect(input.value).toBe("");
  });

  it("calls onSearch callback when search is triggered", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "javascript" } });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
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

  it("transitions to focused state on focus", () => {
    render(<SearchBar />);

    const input = screen.getByRole("searchbox");
    fireEvent.focus(input);

    expect(input.parentElement).toHaveClass("ring-2");
  });

  it("debounces search input", async () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);

    const input = screen.getByRole("searchbox");
    fireEvent.change(input, { target: { value: "java" } });

    expect(onSearch).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(onSearch).toHaveBeenCalledWith("java");
  });
});
