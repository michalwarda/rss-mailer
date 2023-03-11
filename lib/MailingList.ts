import { ISheetDb } from "./SheetDb.js";

export class MailingList {
  constructor(private readonly sheetsDb: ISheetDb) {}

  static FailedToSubscribeError = class extends Error {};
  static FailedToUnsubscribeError = class extends Error {};

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
}
