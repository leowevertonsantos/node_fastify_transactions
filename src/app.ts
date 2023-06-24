import fastify from "fastify";
import cookie from "@fastify/cookie";
import { transactiosnRoute } from "./routes/transactions";

export const app = fastify();

app.register(cookie);
app.register(transactiosnRoute, { prefix: "transaction" });
