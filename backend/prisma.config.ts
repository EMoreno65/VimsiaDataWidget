import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: require("path").resolve(__dirname, ".env") });

const databaseUrl = process.env.DATABASE_URL || process.env.PROD_DATABASE_URL || process.env.DEV_DATABASE_URL;

console.log("DATABASE_URL:", databaseUrl);

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl!,
  },
});
