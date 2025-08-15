import React, { useMemo, useCallback } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { MessageSkeleton } from '../loading-skeleton';

interface VirtualMessageListProps {
  elements: React.ReactNode[];
  isLoading: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const ITEM_HEIGHT = 120; // Estimated height of each message
const BUFFER_SIZE = 5; // Number of items to render outside viewport

export const VirtualMessageList = React.memo(({ 
  elements, 
  isLoading, 
  containerRef 
}: VirtualMessageListProps) => {
  const messageItems = useMemo(() => {
    return elements.map((element, index) => ({
      id: `message-${index}`,
      element,
      index,
    }));
  }, [elements]);

  const rowVirtualizer = useVirtualizer({
    count: messageItems.length + (isLoading ? 1 : 0),
    getScrollElement: () => containerRef.current,
    estimateSize: () => ITEM_HEIGHT,
    overscan: BUFFER_SIZE,
  });

  const renderMessage = useCallback((virtualRow: VirtualItem) => {
    const index = virtualRow.index;
    
    if (index >= messageItems.length) {
      // Loading skeleton
      return (
        <div
          key={virtualRow.key}
          data-index={virtualRow.index}
          ref={rowVirtualizer.measureElement}
          className="absolute top-0 left-0 w-full"
          style={{
            transform: `translateY(${virtualRow.start}px)`,
          }}
        >
          <MessageSkeleton />
        </div>
      );
    }

    const messageItem = messageItems[index];
    
    return (
      <div
        key={virtualRow.key}
        data-index={virtualRow.index}
        ref={rowVirtualizer.measureElement}
        className="absolute top-0 left-0 w-full"
        style={{
          transform: `translateY(${virtualRow.start}px)`,
        }}
      >
        {messageItem.element}
      </div>
    );
  }, [messageItems, rowVirtualizer]);

  if (elements.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map(renderMessage)}
    </div>
  );
});

VirtualMessageList.displayName = 'VirtualMessageList'; 