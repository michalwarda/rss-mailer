import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { buildApp } from "../lib/App.js";

describe("Api", () => {
  describe("subscribe", () => {
    it("calls sheetsDb with correct params", async () => {
      const app = buildApp({
        append: async (values) => {
          expect(values).toEqual(["example@gmail.com", true]);
        },
        getAll: async () => [],
      });
      const status = await app
        .handle(
          new Request("http://localhost/subscriptions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "example@gmail.com" }),
          })
        )
        .then((res) => res.status);

      expect(status).toBe(200);
    });
  });

  describe("unsubscribe", () => {
    it("calls sheetsDb with correct params", async () => {
      const app = buildApp({
        append: async (values) => {
          expect(values).toEqual(["example@gmail.com", false]);
        },
        getAll: async () => [],
      });
      const status = await app
        .handle(
          new Request("http://localhost/subscriptions", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: "example@gmail.com" }),
          })
        )
        .then((res) => res.status);

      expect(status).toBe(200);
    });
  });

  describe("/subscriptions/removal", () => {
    it("calls sheetsDb with correct params", async () => {
      const app = buildApp({
        append: async (values) => {
          expect(values).toEqual(["example@gmail.com", false]);
        },
        getAll: async () => [],
      });
      const url = new URL("http://localhost/subscriptions/removal");
      url.searchParams.set("email", "example@gmail.com");
      const status = await app
        .handle(new Request(url.toString()))
        .then((res) => res.status);

      expect(status).toBe(307);
    });
  });
});
