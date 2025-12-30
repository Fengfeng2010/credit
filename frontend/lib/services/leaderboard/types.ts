/**
 * Leaderboard 服务类型定义
 */

/**
 * 时间周期类型
 */
export type PeriodType = "day" | "week" | "month" | "all_time";

/**
 * 指标类型
 */
export type MetricType =
  | "receive_amount"
  | "payment_amount"
  | "transfer_in_amount"
  | "transfer_out_amount"
  | "volume_amount"
  | "net_amount";

/**
 * 排名趋势类型
 */
export type TrendType = "up" | "down" | "same" | "new";

/**
 * 时间周期信息
 */
export interface LeaderboardPeriod {
  /** 周期类型 */
  type: PeriodType;
  /** 开始日期，格式: YYYY-MM-DD */
  start: string;
  /** 结束日期，格式: YYYY-MM-DD */
  end: string;
}

/**
 * 排行榜条目
 */
export interface LeaderboardEntry {
  /** 排名 */
  rank: number;
  /** 用户ID */
  user_id: number;
  /** 用户名 */
  username: string;
  /** 头像URL */
  avatar_url: string;
  /** 分数（金额） */
  score: string;
  /** 上期排名 */
  previous_rank?: number;
  /** 排名趋势 */
  trend?: TrendType;
}

/**
 * 排行榜列表请求参数
 */
export interface LeaderboardListRequest {
  /** 时间周期 */
  period?: PeriodType;
  /** 指定日期，格式: YYYY-MM-DD */
  date?: string;
  /** 排行指标 */
  metric?: MetricType;
  /** 页码 */
  page?: number;
  /** 每页数量 */
  page_size?: number;
  /** 索引签名（兼容 BaseService.get 参数类型） */
  [key: string]: unknown;
}

/**
 * 排行榜列表响应
 */
export interface LeaderboardListResponse {
  /** 时间周期信息 */
  period: LeaderboardPeriod;
  /** 当前指标 */
  metric: MetricType;
  /** 快照时间 */
  snapshot_at: string;
  /** 当前页码 */
  page: number;
  /** 每页数量 */
  page_size: number;
  /** 总数 */
  total: number;
  /** 排行榜条目列表 */
  items: LeaderboardEntry[];
}

/**
 * 用户排名信息
 */
export interface UserRankInfo {
  /** 用户ID */
  user_id: number;
  /** 排名 */
  rank: number;
  /** 分数（金额） */
  score: string;
  /** 上期排名 */
  previous_rank?: number;
  /** 排名趋势 */
  trend?: TrendType;
}

/**
 * 用户排名响应
 */
export interface UserRankResponse {
  /** 时间周期信息 */
  period: LeaderboardPeriod;
  /** 当前指标 */
  metric: MetricType;
  /** 快照时间 */
  snapshot_at: string;
  /** 用户排名信息 */
  user: UserRankInfo;
}

/**
 * 指标信息
 */
export interface MetricInfo {
  /** 指标键名 */
  key: MetricType;
  /** 指标显示名称 */
  name: string;
}

/**
 * 排行榜元数据响应
 */
export interface LeaderboardMetadataResponse {
  /** 可用的时间周期列表 */
  periods: PeriodType[];
  /** 可用的指标列表 */
  metrics: MetricInfo[];
  /** 时区 */
  timezone: string;
  /** 默认值 */
  defaults: {
    /** 默认时间周期 */
    period: PeriodType;
    /** 默认指标 */
    metric: MetricType;
    /** 默认每页数量 */
    page_size: number;
  };
}
