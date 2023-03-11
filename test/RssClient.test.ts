import { describe, expect, test } from "bun:test";
import * as z from "zod";
import { XMLParser } from "fast-xml-parser";
import * as fs from "fs";
import { promisify } from "util";

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
      .then((text) => {
        const parser = new XMLParser();
        const json = parser.parse(text);
        const schema = z.object({
          rss: z.object({
            channel: z.object({
              item: z.array(
                z.object({
                  title: z.string(),
                  link: z.string(),
                  description: z.string(),
                  pubDate: z.string(),
                })
              ),
            }),
          }),
        });
        const result = schema.safeParse(json);
        if (!result.success) throw new RssClient.InvalidFeedError();
        return result.data;
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
        RssClient.FeedNotFoundError as any as Error
      );
    });

    test(`throws ${RssClient.FeedFailedToReturnError.name} when client returns non 200 status`, async function () {
      const client = new RssClient(
        async () => new Response("", { status: 500 })
      );
      expect(() => client.getFeed("https://unknown.feed")).toThrow(
        RssClient.FeedFailedToReturnError as any as Error
      );
    });

    test(`throws ${RssClient.InvalidFeedError.name} when client returns 200 but feed body is invalid`, () => {
      const client = new RssClient(
        async () => new Response("invalid feed", { status: 200 })
      );
      expect(() => client.getFeed("https://invalid.feed")).toThrow(
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
      expect(await client.getFeed("https://invalid.feed")).toEqual({
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
  });
});
