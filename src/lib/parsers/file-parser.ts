// CSV and Excel file parsers for UncleSense

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type { ParsedTransaction, FileParseResult } from '../../types';

export class FileParser {
  static async parseCSV(file: File): Promise<FileParseResult> {
    try {
      // Read file as text for Cloudflare Workers compatibility
      const text = await file.text();
      
      return new Promise((resolve) => {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              const transactions = this.normalizeTransactions(results.data as any[]);
              resolve({
                success: true,
                transactions,
                metadata: {
                  file_type: 'csv',
                  total_rows: results.data.length,
                  parsed_rows: transactions.length,
                  errors: results.errors.map(e => e.message),
                },
              });
            } catch (error) {
              resolve({
                success: false,
                transactions: [],
                metadata: {
                  file_type: 'csv',
                  total_rows: results.data.length,
                  parsed_rows: 0,
                  errors: [error instanceof Error ? error.message : 'Unknown error'],
                },
              });
            }
          },
          error: (error) => {
            resolve({
              success: false,
              transactions: [],
              metadata: {
                file_type: 'csv',
                total_rows: 0,
                parsed_rows: 0,
                errors: [error.message],
              },
            });
          },
        });
      });
    } catch (error) {
      return {
        success: false,
        transactions: [],
        metadata: {
          file_type: 'csv',
          total_rows: 0,
          parsed_rows: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }

  static async parseExcel(file: File): Promise<FileParseResult> {
    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) {
        throw new Error('Excel file must have at least a header row and one data row');
      }
      
      // Extract headers and data
      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];
      
      // Convert to object format
      const objectData = dataRows.map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      
      const transactions = this.normalizeTransactions(objectData);
      
      return {
        success: true,
        transactions,
        metadata: {
          file_type: 'excel',
          total_rows: dataRows.length,
          parsed_rows: transactions.length,
          errors: [],
        },
      };
    } catch (error) {
      return {
        success: false,
        transactions: [],
        metadata: {
          file_type: 'excel',
          total_rows: 0,
          parsed_rows: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        },
      };
    }
  }

  private static normalizeTransactions(rawData: any[]): ParsedTransaction[] {
    return rawData
      .filter(row => row && Object.keys(row).length > 0)
      .map(row => {
        // Try to detect date, description, and amount columns
        const date = this.findDateColumn(row);
        const description = this.findDescriptionColumn(row);
        const amount = this.findAmountColumn(row);
        
        if (!date || !description || amount === null) {
          throw new Error(`Missing required columns. Found: ${Object.keys(row).join(', ')}`);
        }
        
        return {
          date: this.formatDate(date),
          description: String(description).trim(),
          amount: this.parseAmount(amount),
          raw_data: row,
        };
      });
  }

  private static findDateColumn(row: any): string | null {
    const dateKeys = ['date', 'transaction_date', 'posted_date', 'effective_date', 'time'];
    for (const key of dateKeys) {
      if (row[key]) return row[key];
    }
    
    // Try to find any column that looks like a date
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string' && this.isDateString(value)) {
        return value;
      }
    }
    
    return null;
  }

  private static findDescriptionColumn(row: any): string | null {
    const descKeys = ['description', 'memo', 'payee', 'merchant', 'transaction_description'];
    for (const key of descKeys) {
      if (row[key]) return row[key];
    }
    
    // Find the longest text field
    let longestText = '';
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'string' && value.length > longestText.length) {
        longestText = value;
      }
    }
    
    return longestText || null;
  }

  private static findAmountColumn(row: any): number | null {
    const amountKeys = ['amount', 'debit', 'credit', 'transaction_amount'];
    for (const key of amountKeys) {
      if (row[key] !== null && row[key] !== undefined) {
        return this.parseAmount(row[key]);
      }
    }
    
    // Try to find any numeric column
    for (const [key, value] of Object.entries(row)) {
      if (typeof value === 'number') {
        return value;
      }
      if (typeof value === 'string' && this.isAmountString(value)) {
        return this.parseAmount(value);
      }
    }
    
    return null;
  }

  private static isDateString(str: string): boolean {
    // Check for common date formats
    const dateRegex = /^\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}$|^\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}$/;
    return dateRegex.test(str) && !isNaN(Date.parse(str));
  }

  private static isAmountString(str: string): boolean {
    // Check for amount patterns like $123.45, -123.45, etc.
    const amountRegex = /^[\$]?[\-]?\d+\.?\d*$/;
    return amountRegex.test(str.trim());
  }

  private static formatDate(dateStr: string): string {
    try {
      const date = new Date(dateStr);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    } catch {
      return dateStr;
    }
  }

  private static parseAmount(value: any): number {
    if (typeof value === 'number') return value;
    
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleaned = value.replace(/[\$,]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : parsed;
    }
    
    return 0;
  }
}
