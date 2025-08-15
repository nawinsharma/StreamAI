import { Skeleton } from '@/components/ui/skeleton';

export const MessageSkeleton = () => (
  <div className="flex justify-start mb-6 animate-in slide-in-from-left-2 duration-300">
    <div className="flex flex-col items-start space-y-2 max-w-[85%]">
      <div className="px-6 py-4 rounded-3xl rounded-bl-lg">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </div>
  </div>
);

export const UserMessageSkeleton = () => (
  <div className="flex justify-end mb-6 animate-in slide-in-from-right-2 duration-300">
    <div className="flex flex-col items-end space-y-2 max-w-[85%]">
      <div className="px-6 py-4 rounded-3xl rounded-br-lg bg-gradient-to-br from-blue-600 to-blue-700">
        <Skeleton className="h-4 w-32 bg-blue-400" />
      </div>
    </div>
  </div>
);

export const ChatInputSkeleton = () => (
  <div className="border-t border-border bg-background">
    <div className="max-w-4xl mx-auto p-4">
      <div className="flex items-end gap-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="flex-1 relative">
          <Skeleton className="h-[60px] w-full rounded-lg" />
          <Skeleton className="absolute right-2 bottom-2 h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  </div>
);

export const WelcomeSkeleton = () => (
  <div className="h-full flex items-center justify-center px-6">
    <div className="text-center max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-4 w-96 mx-auto" />
      <Skeleton className="h-4 w-80 mx-auto" />
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export const SuggestionSkeleton = () => (
  <div className="mb-4">
    <div className="flex gap-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-24 rounded-full" />
      ))}
    </div>
  </div>
); 