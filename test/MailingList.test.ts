import { describe, expect, test } from "bun:test";

class MailingList {
  static FailedToSubscribeError = class extends Error {};
  subscribe(email: string) {
    throw new MailingList.FailedToSubscribeError();
  }
}

describe(MailingList.name, function () {
  describe(MailingList.prototype.subscribe.name, function () {
    test(`throws ${MailingList.FailedToSubscribeError.name} when something goes wrong`, async function () {
      expect(() => new MailingList().subscribe("")).toThrow(
        MailingList.FailedToSubscribeError as any as Error
      );
    });
  });
});
