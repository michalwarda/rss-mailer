import { XMLParser } from "fast-xml-parser";
import * as z from "zod";

export class RssClient {
  static FeedFailedToReturnError = class extends Error {};
  static FeedNotFoundError = class extends RssClient.FeedFailedToReturnError {};
  static InvalidFeedError = class extends Error {};

  constructor(
    private readonly httpClient: (url: string) => Promise<Response>
  ) {}

  getFeed(rssFeedUrl: string) {
    return this.httpClient(rssFeedUrl)
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
              item: z.preprocess(
                (item) => (Array.isArray(item) ? item : [item]),
                z.array(
                  z.object({
                    title: z.string(),
                    link: z.string(),
                    description: z.string(),
                    pubDate: z.string(),
                  })
                )
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
