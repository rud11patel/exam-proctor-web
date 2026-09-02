import { Request, Response } from 'express';
import { AnalyticsRepository } from '../repositories/analyticsRepository';
import { ResultRepository } from '../repositories/resultRepository';
import { ApiResponseBuilder } from '../utils/apiResponse';

export async function getFacultyDashboard(req: Request, res: Response) {
  const stats = await AnalyticsRepository.getFacultyDashboardStats(req.user?.id);
  return ApiResponseBuilder.success(res, { stats });
}

export async function getAdminDashboard(req: Request, res: Response) {
  const stats = await AnalyticsRepository.getAdminDashboardStats();
  return ApiResponseBuilder.success(res, { stats });
}

export async function getExamAnalytics(req: Request, res: Response) {
  const { id } = req.params;
  const analytics = await AnalyticsRepository.getExamAnalytics(id);
  return ApiResponseBuilder.success(res, analytics);
}

export async function exportExamCsv(req: Request, res: Response) {
  const { id: examId } = req.params;
  const results = await ResultRepository.getFacultyExamResults(examId);

  const header = 'Candidate Name,Email,Roll Number,Total Marks,Obtained Marks,Percentage,Status,Calculated At\n';
  const rows = results
    .map(
      (r) =>
        `"${r.student_name}","${r.student_email}","${r.roll_number || 'N/A'}",${r.total_marks},${r.obtained_marks},${r.percentage}%,"${
          r.is_passed ? 'PASSED' : 'FAILED'
        }","${r.calculated_at}"`
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="exam_results_${examId}.csv"`);
  return res.status(200).send(header + rows);
}
