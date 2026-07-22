import { useState, useEffect } from 'react';

/**
 * Core Signal Reactive Primitive.
 * Implements a clean, standalone reactive state manager matching Angular Signals API.
 */
export interface Signal<T> {
  (): T;
  set(value: T): void;
  update(fn: (prev: T) => T): void;
  subscribe(callback: (value: T) => void): () => void;
}

export function signal<T>(initialValue: T): Signal<T> {
  let value = initialValue;
  const subscribers = new Set<(value: T) => void>();

  const sig = () => {
    return value;
  };

  sig.set = (newValue: T) => {
    if (value !== newValue) {
      value = newValue;
      subscribers.forEach(sub => sub(value));
    }
  };

  sig.update = (fn: (prev: T) => T) => {
    sig.set(fn(value));
  };

  sig.subscribe = (callback: (value: T) => void) => {
    subscribers.add(callback);
    callback(value);
    return () => {
      subscribers.delete(callback);
    };
  };

  return sig as Signal<T>;
}

/**
 * Presentation Hook to consume a Signal within Standalone components,
 * automatically handling mounting/unmounting subscriptions.
 */
export function useSignal<T>(sig: Signal<T>): T {
  const [val, setVal] = useState(sig());

  useEffect(() => {
    const unsubscribe = sig.subscribe((latestValue) => {
      setVal(latestValue);
    });
    return unsubscribe;
  }, [sig]);

  return val;
}
