/**
 * Leaderboard 服务模块
 *
 * @description
 * 提供排行榜相关的服务，包括：
 * - 排行榜列表查询
 * - 用户排名查询
 * - 元数据获取
 *
 * @example
 * ```typescript
 * import { LeaderboardService } from '@/lib/services/leaderboard';
 *
 * // 获取本周交易总额排行榜
 * const list = await LeaderboardService.getList({
 *   period: 'week',
 *   metric: 'volume_amount',
 *   page: 1,
 *   page_size: 20,
 * });
 *
 * // 获取当前用户排名
 * const myRank = await LeaderboardService.getMyRank({
 *   period: 'week',
 *   metric: 'volume_amount',
 * });
 * ```
 */

export { LeaderboardService } from "./leaderboard.service";
export type {
  PeriodType,
  MetricType,
  TrendType,
  LeaderboardPeriod,
  LeaderboardEntry,
  LeaderboardListRequest,
  LeaderboardListResponse,
  UserRankInfo,
  UserRankResponse,
  MetricInfo,
  LeaderboardMetadataResponse,
} from "./types";
