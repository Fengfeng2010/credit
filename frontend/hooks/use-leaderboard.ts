"use client";

import * as React from "react";
import { LeaderboardService } from "@/lib/services/leaderboard";
import type {
  LeaderboardListResponse,
  LeaderboardListRequest,
  LeaderboardMetadataResponse,
  LeaderboardEntry,
  UserRankResponse,
  PeriodType,
  MetricType,
} from "@/lib/services/leaderboard";

interface UseLeaderboardParams {
  period?: PeriodType;
  metric?: MetricType;
}

export const useLeaderboard = (initialParams?: UseLeaderboardParams) => {
  const [data, setData] = React.useState<LeaderboardListResponse | null>(null);
  const [allItems, setAllItems] = React.useState<LeaderboardEntry[]>([]);
  const [metadata, setMetadata] =
    React.useState<LeaderboardMetadataResponse | null>(null);
  const [myRank, setMyRank] = React.useState<UserRankResponse | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [myRankLoading, setMyRankLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);
  const [params, setParams] = React.useState<UseLeaderboardParams>(
    initialParams ?? {},
  );

  const currentPageRef = React.useRef(1);

  const fetchData = React.useCallback(
    async (
      queryParams: LeaderboardListRequest,
      append = false,
      ignore?: { current: boolean },
    ) => {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setAllItems([]);
        currentPageRef.current = 1;
      }
      setError(null);

      try {
        const response = await LeaderboardService.getList(queryParams);

        if (ignore?.current) return;

        setData(response);
        if (append) {
          setAllItems((prev) => [...prev, ...response.items]);
        } else {
          setAllItems(response.items);
        }
        currentPageRef.current = response.page;
      } catch (err) {
        if (ignore?.current) return;
        if (err instanceof Error) {
          setError(err);
        }
      } finally {
        if (!ignore?.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  const fetchMyRank = React.useCallback(
    async (
      queryParams: Pick<LeaderboardListRequest, "period" | "metric">,
      ignore?: { current: boolean },
    ) => {
      setMyRankLoading(true);
      try {
        const response = await LeaderboardService.getMyRank(queryParams);
        if (!ignore?.current) {
          setMyRank(response);
        }
      } catch (err) {
        if (!ignore?.current) {
          console.error("Failed to fetch my rank:", err);
          setMyRank(null);
        }
      } finally {
        if (!ignore?.current) {
          setMyRankLoading(false);
        }
      }
    },
    [],
  );

  const fetchMetadata = React.useCallback(async () => {
    try {
      const response = await LeaderboardService.getMetadata();
      setMetadata(response);
    } catch (err) {
      console.error("Failed to fetch leaderboard metadata:", err);
    }
  }, []);

  React.useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  React.useEffect(() => {
    const ignore = { current: false };
    const queryParams = { period: params.period, metric: params.metric };
    fetchData(queryParams, false, ignore);
    fetchMyRank(queryParams, ignore);
    return () => {
      ignore.current = true;
    };
  }, [params.period, params.metric, fetchData, fetchMyRank]);

  const loadNextPage = React.useCallback(() => {
    if (
      data &&
      currentPageRef.current * data.page_size < data.total &&
      !loadingMore
    ) {
      const nextPage = currentPageRef.current + 1;
      fetchData({ ...params, page: nextPage, page_size: data.page_size }, true);
    }
  }, [data, params, loadingMore, fetchData]);

  const updateParams = React.useCallback(
    (newParams: Partial<UseLeaderboardParams>) => {
      setParams((prev) => ({ ...prev, ...newParams }));
    },
    [],
  );

  const refresh = React.useCallback(() => {
    const queryParams = { period: params.period, metric: params.metric };
    fetchData(queryParams, false);
    fetchMyRank(queryParams);
  }, [fetchData, fetchMyRank, params]);

  const hasMore = data
    ? currentPageRef.current * data.page_size < data.total
    : false;

  return {
    data,
    items: allItems,
    metadata,
    myRank,
    loading,
    loadingMore,
    myRankLoading,
    error,
    params,
    hasMore,
    updateParams,
    loadNextPage,
    refresh,
  };
};
