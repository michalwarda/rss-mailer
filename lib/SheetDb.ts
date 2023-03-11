import googleapi from "googleapis";

export interface ISheetDb {
  append(values: any[]): Promise<void>;
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
}
