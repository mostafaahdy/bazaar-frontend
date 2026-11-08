'use client';

interface SkeletonProps {
  layout?: 'grid' | 'list';
}

export default function ProductCardSkeleton({ layout = 'grid' }: SkeletonProps) {
  if (layout === 'list') {
    return (
      <div className="flex flex-col sm:flex-row bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 p-4 gap-4 animate-pulse">
        <div className="sm:w-60 h-48 bg-zinc-200 dark:bg-zinc-800 rounded-xl" />
        <div className="flex-1 space-y-3 py-2">
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
        </div>
        <div className="sm:w-52 space-y-3 py-2 sm:border-l border-zinc-100 dark:border-zinc-800 sm:pl-4">
          <div className="h-7 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
          <div className="h-10 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-full mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden animate-pulse">
      <div className="h-56 bg-zinc-200 dark:bg-zinc-800 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3" />
          <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
        </div>
        <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/2" />
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
          <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-2/5" />
          <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}

