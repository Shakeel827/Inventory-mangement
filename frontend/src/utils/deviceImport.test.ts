import { describe, it, expect } from "vitest";
import { parseDevicesFromWorkbook } from "./deviceImport";
import * as XLSX from "xlsx";

function makeWorkbook(rows: any[]): ArrayBuffer {
  const sheet = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet, "Devices");
  const buf = XLSX.write(wb, { type: "array", bookType: "xlsx" });
  return buf as ArrayBuffer;
}

describe("parseDevicesFromWorkbook", () => {
  it("parses basic required Name column", () => {
    const buf = makeWorkbook([{ Name: "Device A" }]);
    const rows = parseDevicesFromWorkbook(buf);
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe("Device A");
    expect(rows[0].status).toBe("available");
  });

  it("handles missing Name gracefully", () => {
    const buf = makeWorkbook([{ Foo: "bar" }]);
    const rows = parseDevicesFromWorkbook(buf);
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe("");
  });

  it("respects valid Status values", () => {
    const buf = makeWorkbook([
      { Name: "A", Status: "checked_out" },
      { Name: "B", Status: "under_repair" },
      { Name: "C", Status: "INVALID" }
    ]);
    const rows = parseDevicesFromWorkbook(buf);
    expect(rows[0].status).toBe("checked_out");
    expect(rows[1].status).toBe("under_repair");
    expect(rows[2].status).toBe("available");
  });
  it("parses Category column (case-insensitive)", () => {
    const buf = makeWorkbook([{ Name: "X", Category: "laptop" }]);
    const rows = parseDevicesFromWorkbook(buf);
    expect(rows[0].categoryName).toBe("laptop");
  });});

