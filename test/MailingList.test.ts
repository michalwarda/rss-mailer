import { describe, expect, test } from "bun:test";

class MailingList {
  constructor(
    private readonly sheetsDb: {
      getAll: () => Promise<Array<string[]>>;
      append: (values: any[]) => Promise<void>;
    }
  ) {}

  static FailedToSubscribeError = class extends Error {};

  async subscribe(email: string) {
    try {
      const results = await this.sheetsDb.getAll();
      if (results.some((item) => item[0] === email)) return;
      await this.sheetsDb.append([email]);
    } catch (error) {
      throw new MailingList.FailedToSubscribeError();
    }
  }
}

describe(MailingList.name, function () {
  describe(MailingList.prototype.subscribe.name, function () {
    test(`throws ${MailingList.FailedToSubscribeError.name} when something goes wrong`, async function () {
      expect(() =>
        new MailingList({
          append: async (values) => {
            throw new Error();
          },
          getAll: async () => {
            return [];
          },
        }).subscribe("")
      ).toThrow(MailingList.FailedToSubscribeError as any as Error);
    });

    test("Does not subscribe when email is already in db", async function () {
      await new MailingList({
        append: async (values) => {
          throw new Error("This should not be called");
        },
        getAll: async () => {
          return [["example@gmail.com"]];
        },
      }).subscribe("example@gmail.com");
    });

    test(`Calls sheetsDb with correct params`, async function () {
      await new MailingList({
        append: async (values) => {
          expect(values).toEqual(["example@gmail.com"]);
        },
        getAll: async () => {
          return [];
        },
      }).subscribe("example@gmail.com");
    });
  });
});
