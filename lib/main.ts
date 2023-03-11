import { Auth, google } from "googleapis";

google.options({
  http2: false,
  auth: new Auth.GoogleAuth({
    keyFile: "../credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  }),
});
