import { Elysia, t } from "elysia";
import { MailingList } from "./MailingList.js";
import { ISheetDb, SheetDb } from "./SheetDb.js";
import googleapi from "googleapis";

export function buildApp(sheetDb: ISheetDb) {
  return new Elysia()
    .state("mailingList", new MailingList(sheetDb))
    .post(
      "/subscriptions",
      async ({ store: { mailingList }, body }) => {
        await mailingList.subscribe(body.email);
        return null;
      },
      {
        schema: {
          body: t.Object({ email: t.String() }),
          response: t.Void(),
        },
      }
    )
    .delete(
      "/subscriptions",
      async ({ store: { mailingList }, body }) => {
        await mailingList.unsubscribe(body.email);
        return null;
      },
      {
        schema: {
          body: t.Object({ email: t.String() }),
          response: t.Void(),
        },
      }
    );
}
