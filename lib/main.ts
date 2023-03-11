import { Auth, google } from "googleapis";
import { buildApp } from "./App.js";
import { SheetDb } from "./SheetDb.js";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import "@elysiajs/cron";
import { RssClient } from "./RssClient.js";

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
  .use(
    cors({
      origin: "https://grifel.dev",
      methods: ["GET", "OPTIONS", "POST", "DELETE"],
      allowedHeaders: ["Content-Type"],
      preflight: true,
    })
  )
  .use(swagger())
  .cron({ name: "Send mails", pattern: "* * * * *" }, async () => {
    await new RssClient(fetch)
      .getFeed("https://grifel.dev/rss.xml")
      .then((feed) => console.log(feed));
  })
  .listen(3000, () => console.log("Server started on port 3000"));
