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
        console.log(json);
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
                description:
                  "Bun is fast. But honestly I almost don't care that much about the fact that it can handle more requests. What matters for me is how much it affects my dev experience. And I'll give you a TLDR; It's amazing! See how Bun performs in a non-typical benchmark.",
                link: "https://grifel.dev/bun-dev-experience/",
                pubDate: "Sun, 05 Mar 2023 00:00:00 GMT",
                title:
                  "Bun vs Node Benchmark - no one cares about speed as much as your CI does",
              },
              {
                description:
                  "Bun is fast. But honestly I almost don't care that much about the fact that it can handle more requests. What matters for me is how much it affects my dev experience. And I'll give you a TLDR; It's amazing! See how Bun performs in a non-typical benchmark.",
                link: "https://grifel.dev/bun-dev-experience/",
                pubDate: "Sun, 05 Mar 2023 00:00:00 GMT",
                title:
                  "Bun vs Node Benchmark - no one cares about speed as much as your CI does",
              },
            ],
          },
        },
      });
    });
  });
});
