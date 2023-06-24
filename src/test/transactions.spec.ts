import request from "supertest";
import { execSync } from "node:child_process";
import { beforeAll, expect, it, describe, afterAll, beforeEach } from "vitest";
import { app } from "../app";

describe("Transactions", () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });

  it("should create a new transaction", async () => {
    await request(app.server)
      .post("/transaction")
      .send({
        title: "New Transaction",
        amount: 350,
        type: "credit",
      })
      .expect(201);
  });

  it("should be able to list all transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transaction")
      .send({
        title: "New Transaction",
        amount: 350,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const listTransactionsResponse = await request(app.server)
      .get("/transaction")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "New Transaction",
        amount: 350,
      }),
    ]);
  });

  it("should be able to get a specific transaction", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transaction")
      .send({
        title: "New Transaction",
        amount: 350,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");

    const listTransactionsResponse = await request(app.server)
      .get("/transaction")
      .set("Cookie", cookies);

    const transactionId = listTransactionsResponse.body.transactions[0].id;

    const getTransactionByIdResponse = await request(app.server)
      .get(`/transaction/${transactionId}`)
      .set("Cookie", cookies);

    expect(getTransactionByIdResponse.body.transaction).toEqual(
      expect.objectContaining({
        title: "New Transaction",
        amount: 350,
      })
    );
  });

  it("should be able to get the summary", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transaction")
      .send({
        title: "Credit transaction",
        amount: 350,
        type: "credit",
      });

    const cookies = createTransactionResponse.get("Set-Cookie");
    await request(app.server).post("/transaction").set("Cookie", cookies).send({
      title: "Debit Transaction",
      amount: 149,
      type: "debit",
    });

    const summaryResponse = await request(app.server)
      .get("/transaction/summary")
      .set("Cookie", cookies)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({ amount: 201 });
  });
});
