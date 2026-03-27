/**
 * @file excelExport.js
 * @description Utility to export JSON data arrays to .xlsx files using the xlsx library.
 */

import * as XLSX from "xlsx";

/**
 * Exports an array of flat objects to an Excel (.xlsx) file and triggers download.
 *
 * @param {Object[]} data     - Array of flat objects (each key = column header)
 * @param {string}   filename - Output filename, e.g. "Report.xlsx"
 */
export const exportToExcel = (data, filename = "export.xlsx") => {
  if (!data || data.length === 0) {
    throw new Error("No data provided for export.");
  }

  /* 1. Convert JSON → worksheet */
  const worksheet = XLSX.utils.json_to_sheet(data);

  /* 2. Auto-size columns based on content length */
  const colLengths = {};
  data.forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      const len = Math.max(
        String(key).length,
        String(value ?? "").length
      );
      colLengths[key] = Math.max(colLengths[key] || 0, len);
    });
  });
  worksheet["!cols"] = Object.values(colLengths).map((w) => ({
    wch: Math.min(w + 4, 60), // Add padding; cap at 60 chars
  }));

  /* 3. Create workbook and append sheet */
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  /* 4. Write and trigger browser download */
  XLSX.writeFile(workbook, filename);
};
