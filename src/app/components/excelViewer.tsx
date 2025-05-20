"use client";

import * as XLSX from "xlsx";
import { useEffect, useState } from "react";

export default function ExcelViewer({ fileUrl }: { fileUrl: string }) {
  const [data, setData] = useState<any[][]>([]);

  useEffect(() => {
    const loadExcel = async () => {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const arrayBuffer = await blob.arrayBuffer();

      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const json: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      setData(json);
    };

    loadExcel();
  }, [fileUrl]);

  return (
    <table border={1}>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
