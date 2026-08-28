import type { FastifyRequest } from 'fastify'
import { insertActivityLog, listActivityLogs } from '../repositories/activityLogRepository.js'
import type { ActivityLogRecord, UserRecord } from '../types/index.js'

/**
 * Best-effort audit trail. Never throws — a logging hiccup must not fail the
 * user's actual request.
 */
export function logActivity(
  request: FastifyRequest,
  action: string,
  details = '',
  user: UserRecord | { id: number | null; username: string } | null = request.user ?? null,
): void {
  void insertActivityLog({
    userId: user?.id ?? null,
    username: user?.username ?? '',
    action,
    details,
    ip: request.ip,
  }).catch((err) => request.log.warn({ err }, 'activity log insert failed'))
}

export async function getActivityLogs(limit?: number): Promise<ActivityLogRecord[]> {
  return listActivityLogs(limit)
}
