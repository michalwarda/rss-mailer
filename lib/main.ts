import { Auth, google } from "googleapis";
import { buildApp } from "./App.js";
import { SheetDb } from "./SheetDb.js";
import { swagger } from "@elysiajs/swagger";

google.options({
  http2: false,
  auth: new Auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  }),
});

const app = buildApp(new SheetDb(google.sheets("v4").spreadsheets.values));

app.use(swagger()).listen(3000);
