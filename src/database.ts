import { knex as setupKnex, Knex } from "knex";
import { environment } from "./env";

export const knexConfig: Knex.Config = {
  client: environment.DATABASE_CLIENT,
  connection:
    environment.DATABASE_CLIENT === "sqlite"
      ? {
          filename: environment.DATABASE_URL!,
        }
      : environment.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations",
  },
};

export const knex = setupKnex(knexConfig);
