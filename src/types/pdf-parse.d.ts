declare module 'pdf-parse' {
  export default function pdfParse(buffer: Buffer): Promise<{ text: string }>;
} 