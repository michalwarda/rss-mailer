import { describe, expect, test } from "bun:test";
import { MailingList } from "../lib/MailingList.js";

describe(MailingList.name, function () {
  describe(MailingList.prototype.subscribe.name, function () {
    test(`throws ${MailingList.FailedToSubscribeError.name} when something goes wrong`, async function () {
      expect(() =>
        new MailingList({
          append: async () => {
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
          append: async () => {
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

  describe(MailingList.prototype.getActiveSubscriptions.name, function () {
    test(`throws ${MailingList.FailedToGetSubscriptionsError.name} when something goes wrong`, async function () {
      expect(() =>
        new MailingList({
          append: async () => {
            throw new Error();
          },
          getAll: async () => {
            throw new Error();
          },
        }).getActiveSubscriptions()
      ).toThrow(MailingList.FailedToGetSubscriptionsError as any as Error);
    });

    test(`returns active subscriptions`, async function () {
      const activeSubscriptions = await new MailingList({
        append: async () => {},
        getAll: async () => {
          return [
            { email: "example@gmail.com", isSubscribed: true },
            { email: "example2@gmail.com", isSubscribed: true },
            { email: "example3@gmail.com", isSubscribed: true },
            { email: "example@gmail.com", isSubscribed: false },
            { email: "example3@gmail.com", isSubscribed: false },
            { email: "example3@gmail.com", isSubscribed: true },
          ];
        },
      }).getActiveSubscriptions();
      expect(activeSubscriptions).toEqual([
        "example2@gmail.com",
        "example3@gmail.com",
      ]);
    });
  });
});
