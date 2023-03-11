import googleapi from "googleapis";

export interface ISheetDb {
  append(values: any[]): Promise<void>;
  getAll(): Promise<Record<string, any>[]>;
}

export class SheetDb implements ISheetDb {
  constructor(
    private readonly googleSheets: (typeof googleapi)["sheets_v4"]["Resource$Spreadsheets$Values"]["prototype"]
  ) {}

  async append(values: any[]) {
    await this.googleSheets.append(
      {
        spreadsheetId: process.env.SHEET_ID,
        range: process.env.SHEET_RANGE,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [[...values, new Date()]],
        },
      },
      {}
    );
  }

  async getAll() {
    const response = await this.googleSheets.get({
      spreadsheetId: process.env.SHEET_ID,
      range: process.env.SHEET_RANGE,
    });
    if (!response.data.values) return [];
    const headers = response.data.values[0];
    const values = response.data.values.slice(1);
    return values.map((item) =>
      headers.reduce(
        (acc, header, index) => ({ ...acc, [header]: item[index] }),
        {}
      )
    );
  }
}
