import { pdf } from '@react-pdf/renderer';
import type { ServiceReport } from '../types/serviceReport';
import { ServiceReportDocument } from './ServiceReportDocument';

/** Loaded on demand (the PDF renderer is large), so importing this module is what pulls it in. */
export function renderServiceReportPdf(report: ServiceReport): Promise<Blob> {
  return pdf(<ServiceReportDocument report={report} />).toBlob();
}
