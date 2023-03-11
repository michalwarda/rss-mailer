import { Elysia, t } from "elysia";
import { MailingList } from "./MailingList.js";
import { ISheetDb } from "./SheetDb.js";

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
    .get(
      "/subscriptions/removal",
      async ({ store: { mailingList }, query }) => {
        await mailingList.unsubscribe(query.email);
        return Response.redirect("https://grifel.dev/unsubscribed", 307);
      },
      {
        schema: {
          query: t.Object({ email: t.String() }),
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
