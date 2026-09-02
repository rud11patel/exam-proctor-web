import { Request, Response } from 'express';
import { checkDatabaseConnection } from '../config/database';
import { ApiResponseBuilder } from '../utils/apiResponse';

export async function getHealthStatus(req: Request, res: Response) {
  const dbStatus = await checkDatabaseConnection();

  const healthData = {
    status: dbStatus.connected ? 'healthy' : 'degraded',
    uptimeSeconds: Math.round(process.uptime() * 100) / 100,
    timestamp: new Date().toISOString(),
    database: {
      connected: dbStatus.connected,
      message: dbStatus.message,
    },
    service: 'ProctorAI Application Backend',
    version: '1.0.0',
  };

  const httpStatus = dbStatus.connected ? 200 : 503;
  return ApiResponseBuilder.success(res, healthData, httpStatus);
}
