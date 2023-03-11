import { describe, expect, test } from "bun:test";
import * as fs from "fs";
import { promisify } from "util";
import { RssClient } from "../RssClient.js";

describe(RssClient.name, function () {
  describe(RssClient.prototype.getFeed.name, function () {
    test(`throws ${RssClient.FeedNotFoundError.name} when client returns 404`, async function () {
      const client = new RssClient(
        async () => new Response("", { status: 404 })
      );
      expect(() => client.getFeed("https://unknown.feed")).toThrow(
        RssClient.FeedNotFoundError as any as Error
      );
    });

    test(`throws ${RssClient.FeedFailedToReturnError.name} when client returns non 200 status`, async function () {
      const client = new RssClient(
        async () => new Response("", { status: 500 })
      );
      expect(() => client.getFeed("https://correct.url")).toThrow(
        RssClient.FeedFailedToReturnError as any as Error
      );
    });

    test(`throws ${RssClient.InvalidFeedError.name} when client returns 200 but feed body is invalid`, () => {
      const client = new RssClient(
        async () => new Response("invalid feed", { status: 200 })
      );
      expect(() => client.getFeed("https://correct.url")).toThrow(
        RssClient.InvalidFeedError as any as Error
      );
    });

    test(`returns feed when body is correct`, async () => {
      let xmlFile = await promisify(fs.readFile)(
        `${import.meta.dir}/statics/RssFeed.xml`
      );
      const client = new RssClient(
        async () => new Response(xmlFile, { status: 200 })
      );
      expect(await client.getFeed("https://correct.url")).toEqual({
        rss: {
          channel: {
            item: [
              {
                description: "Description 2",
                link: "https://grifel.dev/bun-dev-experience/",
                pubDate: "Sun, 05 Mar 2023 00:00:00 GMT",
                title: "Title 2",
              },
              {
                description: "Description 1",
                link: "https://grifel.dev/bun-dev-experience/",
                pubDate: "Sun, 05 Mar 2023 00:00:00 GMT",
                title: "Title 1",
              },
            ],
          },
        },
      });
    });

    test("calls correct url", async function () {
      let xmlFile = await promisify(fs.readFile)(
        `${import.meta.dir}/statics/RssFeed.xml`
      );

      const client = new RssClient(async (url) => {
        expect(url).toBe("https://correct.url");
        return new Response(xmlFile, { status: 200 });
      });

      await client.getFeed("https://correct.url");
    });
  });
});
