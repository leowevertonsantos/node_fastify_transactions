import { config } from "dotenv";
import { z } from "zod";

if (process.env.NODE_ENV === "test") {
  config({ path: ".env.test" });
} else {
  config();
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("production"),
  DATABASE_CLIENT: z.enum(["sqlite", "pg"]),
  DATABASE_URL: z.string(),
  PORT: z.coerce.number().default(3000),
});

const _environment = envSchema.safeParse(process.env);

if (!_environment.success) {
  console.error("Invalid environment variables!", _environment.error.format());
  throw new Error("Invalid environment variables!");
}
console.log(_environment.data);
export const environment = _environment.data;
