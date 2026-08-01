import ExcelJS from "exceljs";

const excelSerialToDate = (serial) => {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  const fractionalDay = serial - Math.floor(serial) + 0.0000001;
  const totalSeconds = Math.floor(86400 * fractionalDay);

  return new Date(
    (utcValue + totalSeconds) * 1000
  );
};

const normalizeCellValue = (value) => {
  if (value === null || value === undefined) return null;

  if (value instanceof Date) return value;

  if (typeof value === "object") {
    if ("result" in value) return normalizeCellValue(value.result);
    if ("text" in value) return value.text;
    if ("richText" in value) {
      return value.richText.map((item) => item.text).join("");
    }
    if ("hyperlink" in value) return value.text ?? value.hyperlink;
  }

  return value;
};

const worksheetToObjects = (worksheet) => {
  const headerRow = worksheet.getRow(1);

  const headers = headerRow.values
    .slice(1)
    .map((value) => String(normalizeCellValue(value) ?? "").trim());

  const rows = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;

    const record = {};
    let hasValue = false;

    headers.forEach((header, index) => {
      if (!header) return;

      const value = normalizeCellValue(row.getCell(index + 1).value);
      record[header] = value ?? null;

      if (value !== null && value !== "") {
        hasValue = true;
      }
    });

    if (hasValue) rows.push(record);
  });

  return rows;
};

export const loadWorkbook = async (filePath) => {
  const workbook = new ExcelJS.Workbook();

  await workbook.xlsx.readFile(filePath);

  return {
    readSheet(name) {
      const worksheet = workbook.getWorksheet(name);

      if (!worksheet) {
        throw new Error(`Aba obrigatória não encontrada: ${name}`);
      }

      return worksheetToObjects(worksheet);
    },

    parseDateCode(value) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        return null;
      }

      return excelSerialToDate(value);
    }
  };
};
