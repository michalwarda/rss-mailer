import { describe, expect, test } from "bun:test";
import { MailingList } from "../lib/MailingList.js";

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

    test(`Calls sheetsDb with correct params`, async function () {
      await new MailingList({
        append: async (values) => {
          expect(values).toEqual(["example@gmail.com", true]);
        },
        getAll: async () => {
          return [];
        },
      }).subscribe("example@gmail.com");
    });
  });

  describe(MailingList.prototype.unsubscribe.name, function () {
    test(`throws ${MailingList.FailedToUnsubscribeError.name} when something goes wrong`, async function () {
      expect(() =>
        new MailingList({
          append: async (values) => {
            throw new Error();
          },
          getAll: async () => {
            return [];
          },
        }).unsubscribe("")
      ).toThrow(MailingList.FailedToUnsubscribeError as any as Error);
    });

    test(`Calls sheetsDb with correct params`, async function () {
      await new MailingList({
        append: async (values) => {
          expect(values).toEqual(["example@gmail.com", false]);
        },
        getAll: async () => {
          return [];
        },
      }).unsubscribe("example@gmail.com");
    });
  });
});
