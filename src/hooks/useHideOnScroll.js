import { useEffect, useRef, useState } from "react";

export function useHideOnScroll({ topThreshold = 8, delta = 6 } = {}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY || 0;

    const onScroll = () => {
      const y = window.scrollY || 0;
      const diff = y - lastY.current;

      // 🔝 arriba: siempre visible
      if (y <= topThreshold) {
        setHidden(false);
        lastY.current = y;
        return;
      }

      // evita parpadeo por micro-scroll
      if (Math.abs(diff) < delta) return;

      // ⬇️ baja = esconder, ⬆️ sube = mostrar
      if (diff > 0) setHidden(true);
      else setHidden(false);

      lastY.current = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [topThreshold, delta]);

  return hidden;
}
