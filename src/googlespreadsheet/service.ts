interface ISheetService {
  addRow(row: Array<string>): Promise<gapi.client.sheets.AppendValuesResponse>;
}

class SheetService implements ISheetService {
  private sheetId: string;

  public async addRow(row: Array<string>) {
    const response = await gapi.client.sheets.spreadsheets.values.append(
      {
        spreadsheetId: this.sheetId,
        range: "Sheet1!A2:B2",
        valueInputOption: "USER_ENTERED",
      },
      {
        majorDimension: "ROWS",
        values: [row],
      }
    );
    console.log("got resonse", response.result);
    return response.result;
  }
}
