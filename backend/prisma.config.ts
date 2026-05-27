import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

dotenv.config({ path: require("path").resolve(__dirname, ".env") });

console.log("DATABASE_URL:", process.env.DATABASE_URL);

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
