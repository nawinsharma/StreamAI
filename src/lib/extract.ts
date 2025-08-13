export async function extractTextFromFile(buffer: Buffer, mimeType: string, filename: string): Promise<string | null> {
  try {
    if (mimeType.startsWith('text/')) {
      return buffer.toString('utf-8');
    }

    if (mimeType === 'application/json') {
      return buffer.toString('utf-8');
    }

    if (mimeType === 'text/markdown' || filename.toLowerCase().endsWith('.md')) {
      return buffer.toString('utf-8');
    }

    if (mimeType === 'application/pdf' || filename.toLowerCase().endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse')).default as (b: Buffer) => Promise<{ text: string }>;
      const data = await pdfParse(buffer);
      return data.text || null;
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      filename.toLowerCase().endsWith('.docx')
    ) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value || null;
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel' ||
      filename.toLowerCase().endsWith('.xlsx') ||
      filename.toLowerCase().endsWith('.xls')
    ) {
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetNames = workbook.SheetNames;
      const texts: string[] = [];
      for (const name of sheetNames) {
        const sheet = workbook.Sheets[name];
        const csv = XLSX.utils.sheet_to_csv(sheet);
        texts.push(`# Sheet: ${name}\n${csv}`);
      }
      return texts.join('\n\n');
    }

    // Unsupported types: attempt utf-8 as best-effort
    return buffer.toString('utf-8');
  } catch (err) {
    console.error('extractTextFromFile error:', err);
    return null;
  }
}

export function truncateText(input: string, maxChars = 15000): string {
  if (!input) return input;
  if (input.length <= maxChars) return input;
  return input.slice(0, maxChars);
} 