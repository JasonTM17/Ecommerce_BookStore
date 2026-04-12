import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useDebounce, useThrottle } from "@/lib/hooks/useDebounce";

describe("useDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it("returns a function", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce(callback, { wait: 500 }));

    expect(typeof result.current).toBe("function");
  });

  it("does not call callback immediately", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce(callback, { wait: 500 }));

    act(() => {
      result.current("test");
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("calls callback after wait time", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce(callback, { wait: 500 }));

    act(() => {
      result.current("test");
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledWith("test");
  });

  it("calls callback only once for multiple rapid calls", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce(callback, { wait: 500 }));

    act(() => {
      result.current("a");
      result.current("b");
      result.current("c");
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("c");
  });

  it("resets timer when called again within wait time", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce(callback, { wait: 500 }));

    act(() => {
      result.current("first");
      vi.advanceTimersByTime(300);
      result.current("second");
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(callback).toHaveBeenCalledWith("second");
  });

  it("uses default wait time of 500ms", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useDebounce(callback));

    act(() => {
      result.current("test");
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalled();
  });

  it("cleans up timer on unmount", () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() => useDebounce(callback, { wait: 500 }));

    act(() => {
      result.current("test");
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});

describe("useThrottle", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllTimers();
  });

  it("returns a function", () => {
    const callback = vi.fn();
    const { result } = renderHook(() => useThrottle(callback, { wait: 500 }));

    expect(typeof result.current).toBe("function");
  });

  it("calls callback immediately with leading=true", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useThrottle(callback, { wait: 500, leading: true, trailing: false })
    );

    act(() => {
      result.current("test");
    });

    expect(callback).toHaveBeenCalledWith("test");
  });

  it("does not call callback immediately with leading=false", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useThrottle(callback, { wait: 500, leading: false, trailing: true })
    );

    act(() => {
      result.current("test");
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it("throttles rapid calls", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useThrottle(callback, { wait: 500, leading: true, trailing: false })
    );

    act(() => {
      result.current("a");
      result.current("b");
      result.current("c");
    });

    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith("a");
  });

  it("allows call again after wait time with trailing=true", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useThrottle(callback, { wait: 500, leading: true, trailing: true })
    );

    act(() => {
      result.current("first");
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      result.current("second");
    });

    expect(callback).toHaveBeenCalledTimes(2);
  });

  it("uses default wait time of 500ms", () => {
    const callback = vi.fn();
    const { result } = renderHook(() =>
      useThrottle(callback, { leading: false, trailing: true })
    );

    act(() => {
      result.current("test");
    });

    act(() => {
      vi.advanceTimersByTime(400);
    });

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(callback).toHaveBeenCalled();
  });

  it("cleans up on unmount", () => {
    const callback = vi.fn();
    const { result, unmount } = renderHook(() =>
      useThrottle(callback, { wait: 500, leading: false, trailing: true })
    );

    act(() => {
      result.current("test");
    });

    unmount();

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
