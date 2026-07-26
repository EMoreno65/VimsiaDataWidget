import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load local env file for development. In production (Railway), vars are injected.
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: require("path").resolve(__dirname, ".env") });
}

const databaseUrl =
  process.env.DATABASE_URL ||
  process.env.POSTGRES_URL ||
  process.env.POSTGRES_PRISMA_URL ||
  process.env.DEV_DATABASE_URL ||
  process.env.PROD_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "No database URL found. Set DATABASE_URL on Railway (or DEV_DATABASE_URL locally)."
  );
}


export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
});
