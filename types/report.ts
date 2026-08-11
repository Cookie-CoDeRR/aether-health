export type ParseStatus = 'pending' | 'ok' | 'low_confidence' | 'failed';

export interface Report {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  parseStatus: ParseStatus;
  parsedMetrics: string | null;
  plainSummary: string | null;
  rawOcrText: string | null;
  createdAt: Date;
  updatedAt: Date;
}
