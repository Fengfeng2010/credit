"use client";

import { useCallback, useMemo } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useLeaderboard } from "@/hooks/use-leaderboard";
import { LeaderboardPodium } from "@/components/leaderboard/leaderboard-podium";
import { LeaderboardTable } from "@/components/leaderboard/leaderboard-table";
import { UserRankCard } from "@/components/leaderboard/user-rank-card";
import type { PeriodType, MetricType } from "@/lib/services/leaderboard";

interface FilterParams {
  period?: PeriodType;
  metric?: MetricType;
}

const periodLabels: Record<PeriodType, string> = {
  day: "今日",
  week: "本周",
  month: "本月",
  all_time: "所有时间",
};

/** 格式化日期范围显示 */
function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const formatDate = (d: Date) =>
    `${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getDate().toString().padStart(2, "0")}`;
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

export default function LeaderboardPage() {
  const {
    data,
    items,
    metadata,
    myRank,
    loading,
    loadingMore,
    myRankLoading,
    params,
    hasMore,
    updateParams,
    loadNextPage,
  } = useLeaderboard({
    period: "all_time",
    metric: "volume_amount",
  });

  const filters: FilterParams = useMemo(
    () => ({
      period: (params.period ?? "all_time") as PeriodType,
      metric: (params.metric ?? "volume_amount") as MetricType,
    }),
    [params.period, params.metric],
  );

  const handlePeriodChange = useCallback(
    (period: PeriodType) => {
      updateParams({ period });
    },
    [updateParams],
  );

  const periods = metadata?.periods ?? ["day", "week", "month", "all_time"];

  return (
    <div className="container max-w-6xl py-8">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b">
        <h1 className="text-2xl font-bold">全局排行榜</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="text-primary gap-1">
              <HelpCircle className="h-4 w-4" />
              排行榜是如何运作的?
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>排行榜规则</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>排行榜根据用户在平台上的交易活动进行排名。</p>
              <p>
                <strong>统计范围：</strong>仅统计 payment、online、transfer
                类型的订单。
              </p>
              <p>
                <strong>排名指标：</strong>
                默认按交易总额排名，您可以切换不同的时间范围查看排名变化。
              </p>
              <p>
                <strong>自成交排除：</strong>用户向自己转账的交易不计入统计。
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 时间筛选 */}
      <div className="mb-6">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <span>{periodLabels[filters.period ?? "all_time"]}</span>
              {data?.period && filters.period !== "all_time" && (
                <span className="text-muted-foreground text-xs">
                  ({formatDateRange(data.period.start, data.period.end)})
                </span>
              )}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {periods.map((period) => (
              <DropdownMenuItem
                key={period}
                onClick={() => handlePeriodChange(period)}
              >
                {periodLabels[period] ?? period}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 领奖台 */}
      <LeaderboardPodium items={items.slice(0, 3)} loading={loading} />

      {/* 当前用户排名 */}
      <UserRankCard data={myRank} loading={myRankLoading} className="my-6" />

      {/* 排名列表 */}
      <LeaderboardTable
        items={items.slice(3)}
        loading={loading || loadingMore}
        currentUserId={myRank?.user.user_id}
        onLoadMore={loadNextPage}
        hasMore={hasMore}
      />
    </div>
  );
}
