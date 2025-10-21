import { useEffect, useRef, useState } from 'react';
import { onNetworkActivity } from '@/lib/storage';

// Simple top loading bar (like YouTube). It animates while network is in-flight.
export default function GlobalLoadingBar() {
  const [active, setActive] = useState(false);
  const [value, setValue] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const off = onNetworkActivity((count) => {
      if (count > 0) {
        setActive(true);
        // kick progress if it was at 0
        setValue((v) => (v === 0 ? 10 : v));
      } else {
        // finish animation
        setValue(100);
        // slight delay, then hide and reset
        window.setTimeout(() => {
          setActive(false);
          setValue(0);
        }, 250);
      }
    });
    return off;
  }, []);

  // auto-increment progress while active
  useEffect(() => {
    if (active) {
      timerRef.current = window.setInterval(() => {
        setValue((v) => {
          if (v >= 95) return v; // wait for completion
          // ease out increments
          const delta = v < 60 ? 5 : v < 85 ? 3 : 1;
          return Math.min(95, v + delta);
        });
      }, 200);
      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
      };
    }
  }, [active]);

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 9999,
        pointerEvents: 'none',
        opacity: active ? 1 : 0,
        transition: 'opacity 150ms ease',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${value}%`,
          background: 'var(--primary)',
          boxShadow: '0 0 8px rgba(0,0,0,0.15)',
          transform: `translateX(0)`
        }}
      />
    </div>
  );
}
