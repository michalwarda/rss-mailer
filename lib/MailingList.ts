import { ISheetDb } from "./SheetDb.js";

export class MailingList {
  constructor(private readonly sheetsDb: ISheetDb) {}

  static FailedToSubscribeError = class extends Error {};
  static FailedToUnsubscribeError = class extends Error {};
  static FailedToGetSubscriptionsError = class extends Error {};

  async subscribe(email: string) {
    try {
      await this.sheetsDb.append([email, true]);
    } catch (error) {
      throw new MailingList.FailedToSubscribeError();
    }
  }

  async unsubscribe(email: string) {
    try {
      await this.sheetsDb.append([email, false]);
    } catch (error) {
      throw new MailingList.FailedToUnsubscribeError();
    }
  }

  async getActiveSubscriptions() {
    try {
      const allSubscriptions = await this.sheetsDb.getAll();
      const subscriptionsMap = new Map(
        allSubscriptions.map((s) => [s.email, s.isSubscribed])
      );
      return [...subscriptionsMap.entries()].reduce((acc, next) => {
        if (next[1]) {
          return [...acc, next[0]];
        }
        return acc;
      }, [] as string[]);
    } catch (error) {
      throw new MailingList.FailedToGetSubscriptionsError();
    }
  }
}
