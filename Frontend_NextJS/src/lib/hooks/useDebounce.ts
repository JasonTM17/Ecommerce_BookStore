"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface DebounceOptions {
  wait?: number;
}

export function useDebounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  { wait = 500 }: DebounceOptions = {}
) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, wait);
    },
    [callback, wait]
  );
}

interface ThrottleOptions {
  wait?: number;
  leading?: boolean;
  trailing?: boolean;
}

export function useThrottle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  { wait = 500, leading = true, trailing = true }: ThrottleOptions = {}
) {
  const lastCallRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallRef.current;

      if (timeSinceLastCall >= wait) {
        if (leading) {
          lastCallRef.current = now;
          callback(...args);
        }
      } else if (trailing) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          lastCallRef.current = Date.now();
          callback(...args);
        }, wait - timeSinceLastCall);
      }
    },
    [callback, wait, leading, trailing]
  );
}
