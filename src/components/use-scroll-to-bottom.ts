import { useEffect, useRef, RefObject, useCallback } from "react";

export function useScrollToBottom<T extends HTMLElement>(): [
  RefObject<T | null>,
  RefObject<T | null>,
  () => void
] {
  const containerRef = useRef<T | null>(null);
  const endRef = useRef<T | null>(null);

  const scrollToBottom = useCallback(() => {
    const container = containerRef.current;
    const end = endRef.current;

    if (container && end) {
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

      // Also listen for scroll events to handle dynamic content loading
      const handleScroll = () => {
        // If user scrolls near bottom, auto-scroll to very bottom
        const { scrollTop, scrollHeight, clientHeight } = container;
        const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
        
        if (isNearBottom) {
          scrollToBottom();
        }
      };

      container.addEventListener('scroll', handleScroll);

      return () => {
        observer.disconnect();
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [scrollToBottom]);

  return [containerRef, endRef, scrollToBottom];
}
