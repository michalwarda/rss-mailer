import { describe, test } from "bun:test";
import { XMLParser } from "fast-xml-parser";
import * as z from "zod";

describe("index", function () {
  test("should be true", async function () {
    const parser = new XMLParser();
    const data = await fetch("https://grifel.dev/rss.xml")
      .then((res) => {
        if (res.status !== 200) throw new Error("Failed to fetch");
        return res.text();
      })
      .then((text) => parser.parse(text));
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

    const result = schema.safeParse(data);
    console.log(result);
  });
});
