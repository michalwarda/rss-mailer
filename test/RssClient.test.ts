import { describe, expect, test } from "bun:test";

class RssClient {
  static FeedNotFoundError = class extends Error {};
  constructor(private readonly httpClient: () => Promise<Response>) {}

  getFeed(feed: string) {
    return this.httpClient().then((res) => {
      throw new RssClient.FeedNotFoundError();
    });
  }
}

describe(RssClient.name, function () {
  describe(RssClient.prototype.getFeed.name, function () {
    test(`throws ${RssClient.FeedNotFoundError.name} when client returns 404`, async function () {
      const client = new RssClient(
        async () => new Response("", { status: 404 })
      );
      expect(() => client.getFeed("https://unknown.feed")).toThrow(
        new RssClient.FeedNotFoundError()
      );
    });
  });
});
