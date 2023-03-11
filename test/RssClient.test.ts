import { describe, expect, test } from "bun:test";

class RssClient {
  constructor(private readonly httpClient: () => Promise<Response>) {}

  getFeed(feed: string) {
    return this.httpClient().then((res) => {
      throw new Error("Feed not found");
    });
  }
}

describe(RssClient.name, function () {
  describe(RssClient.prototype.getFeed.name, function () {
    test("throws FeedNotFoundError when feed is not found", async function () {
      const client = new RssClient(
        async () => new Response("", { status: 404 })
      );
      expect(() => client.getFeed("https://unknown.feed")).toThrow(
        new Error("Feed not found")
      );
    });
  });
});
