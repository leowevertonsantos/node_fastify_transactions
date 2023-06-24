import { randomUUID } from "node:crypto";
import { FastifyInstance } from "fastify";
import { knex } from "../database";
import { z } from "zod";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";

export const transactiosnRoute = async (app: FastifyInstance) => {
  app.addHook("preHandler", async (req, reply) => {
    console.log(`HANDLE GLOBAL`);
  });

  app.get("/", { preHandler: [checkSessionIdExists] }, async (req, reply) => {
    const { sessionId } = req.cookies;
    const transactions = await knex("transactions")
      .where({ session_id: sessionId })
      .select();
    return { transactions };
  });

  app.get("/:id", { preHandler: [checkSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies;

    const getTransactionParamSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = getTransactionParamSchema.parse(req.params);
    const transaction = await knex("transactions")
      .where({ id, session_id: sessionId })
      .first();
    return {
      transaction,
    };
  });

  app.get("/summary", { preHandler: [checkSessionIdExists] }, async (req) => {
    const { sessionId } = req.cookies;

    const summary = await knex("transactions")
      .where({ session_id: sessionId })
      .sum("amount", { as: "amount" })
      .first();
    return { summary };
  });

  app.post("/", async (req, reply) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { amount, title, type } = createTransactionBodySchema.parse(req.body);

    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();
      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
      });
    }

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
};
