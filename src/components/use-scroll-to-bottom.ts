import { useEffect, useRef, RefObject, useCallback } from "react";

// Distance (px) from the bottom within which we consider the user "at bottom"
// and keep auto-scrolling. Scroll further up than this and auto-scroll pauses.
const BOTTOM_THRESHOLD = 100;

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
  () => void
] {
  const containerRef = useRef<T | null>(null);
  const endRef = useRef<T | null>(null);

  // Whether auto-scroll is active. Flips off when the user scrolls up,
  // back on when they return to the bottom.
  const shouldAutoScrollRef = useRef(true);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end && shouldAutoScrollRef.current) {
      // Use smooth scrolling for better UX
      end.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "nearest"
      });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
      // Initial scroll to bottom
      scrollToBottom();

      // Observe DOM changes for new content
      const observer = new MutationObserver(() => {
        // Add a small delay to ensure content is rendered
        setTimeout(scrollToBottom, 50);
      });

      observer.observe(container, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true,
      });

      // Track the user's scroll position to decide whether to keep
      // auto-scrolling. If they swipe up, pause; if they return to the
      // bottom, resume.
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom =
          scrollTop + clientHeight >= scrollHeight - BOTTOM_THRESHOLD;

        shouldAutoScrollRef.current = isNearBottom;
      };

      container.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        observer.disconnect();
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [scrollToBottom]);

  return [containerRef, endRef, scrollToBottom];
}
