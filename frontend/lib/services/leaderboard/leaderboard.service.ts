import { BaseService } from "../core/base.service";
import type {
  LeaderboardListRequest,
  LeaderboardListResponse,
  UserRankResponse,
  LeaderboardMetadataResponse,
} from "./types";

/**
 * 排行榜服务
 * 处理排行榜相关的 API 请求
 */
export class LeaderboardService extends BaseService {
  protected static readonly basePath = "/api/v1/leaderboard";

  /**
   * 获取排行榜列表
   * @param params - 查询参数
   * @returns 排行榜列表响应
   */
  static async getList(
    params?: LeaderboardListRequest,
  ): Promise<LeaderboardListResponse> {
    return this.get<LeaderboardListResponse>("", params);
  }

  /**
   * 获取当前用户排名
   * @param params - 查询参数（period, metric）
   * @returns 用户排名响应
   */
  static async getMyRank(
    params?: Pick<LeaderboardListRequest, "period" | "metric">,
  ): Promise<UserRankResponse> {
    return this.get<UserRankResponse>("/me", params);
  }

  /**
   * 获取指定用户排名
   * @param userId - 用户 ID
   * @param params - 查询参数（period, metric）
   * @returns 用户排名响应
   */
  static async getUserRankById(
    userId: number,
    params?: Pick<LeaderboardListRequest, "period" | "metric">,
  ): Promise<UserRankResponse> {
    return this.get<UserRankResponse>(`/users/${userId}`, params);
  }

  /**
   * 获取排行榜元数据
   * @returns 可用的周期、指标等配置信息
   */
  static async getMetadata(): Promise<LeaderboardMetadataResponse> {
    return this.get<LeaderboardMetadataResponse>("/metadata");
  }
}
