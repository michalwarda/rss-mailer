import { describe, expect, test } from "bun:test";

class RssClient {
  static FeedFailedToReturnError = class extends Error {};
  static FeedNotFoundError = class extends RssClient.FeedFailedToReturnError {};
  static InvalidFeedError = class extends Error {};
  constructor(private readonly httpClient: () => Promise<Response>) {}

  getFeed(feed: string) {
    return this.httpClient()
      .then((res) => {
        if (res.status === 404) throw new RssClient.FeedNotFoundError();
        if (res.status !== 200) throw new RssClient.FeedFailedToReturnError();
        return res.text();
      })
      .then(() => {
        throw new RssClient.InvalidFeedError();
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
        RssClient.FeedNotFoundError
      );
    });

    test(`throws ${RssClient.FeedFailedToReturnError.name} when client returns non 200 status`, async function () {
      const client = new RssClient(
        async () => new Response("", { status: 500 })
      );
      expect(() => client.getFeed("https://unknown.feed")).toThrow(
        RssClient.FeedFailedToReturnError
      );
    });

    test(`throws ${RssClient.InvalidFeedError.name} when client returns 200 but feed body is invalid`, () => {
      const client = new RssClient(
        async () => new Response("invalid feed", { status: 200 })
      );
      expect(() => client.getFeed("https://invalid.feed")).toThrow(
        RssClient.InvalidFeedError
      );
    });
  });
});
