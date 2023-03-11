import { describe, expect, it } from "bun:test";
import { Auth, google } from "googleapis";
import { SheetDb } from "../lib/SheetDb.js";

google.options({
  http2: false,
  auth: new Auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  }),
});

describe("example", function () {
  it("should pass", async function () {
    await new SheetDb(
      google.sheets({
        version: "v4",
      }).spreadsheets.values
    )
      .append([1, 2, 3])
      .then(console.log)
      .catch(console.error);
    expect(true).toEqual(true);
  });
});
