import { Auth, google } from "googleapis";
import { buildApp } from "./App.js";
import { SheetDb } from "./SheetDb.js";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";

google.options({
  http2: false,
  auth: new Auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  }),
});

const app = buildApp(new SheetDb(google.sheets("v4").spreadsheets.values));

app
  .on("request", (ctx) => {
    console.log(new Date(), ctx.request.method, ctx.request.url);
  })
  .use(cors({ origin: "https://grifel.dev" }))
  .use(swagger())
  .listen(3000, () => console.log("Server started on port 3000"));
