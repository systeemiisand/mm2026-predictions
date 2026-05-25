"use client";

// React lifecycle hook
import { useEffect } from "react";

// Next.js router for refreshing server components/data
import { useRouter } from "next/navigation";

/**
 * AutoRefresh component
 *
 * Purpose:
 * Automatically refreshes current page data every 60 seconds.
 *
 * Useful for:
 * - live scores
 * - leaderboard updates
 * - match status changes
 * - synced Supabase data
 *
 * This component renders nothing visually.
 */
export default function AutoRefresh() {
  const router = useRouter();

  useEffect(() => {
    /**
     * Refresh current route every 60 seconds.
     *
     * router.refresh() re-fetches server component data
     * without full browser reload.
     */
    const interval = setInterval(() => {
      router.refresh();
    }, 60000);

    /**
     * Cleanup interval when component unmounts.
     *
     * Prevents memory leaks and duplicate intervals.
     */
    return () => clearInterval(interval);
  }, [router]);

  // No visible UI
  return null;
}
