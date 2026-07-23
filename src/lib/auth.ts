import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";
import { MONGODB_URI } from "./db";

const client = new MongoClient(MONGODB_URI);
const db = client.db();

const config = {
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3000", process.env.NEXT_PUBLIC_APP_URL!],
  plugins: [nextCookies()],
};

export const auth = betterAuth({
  database: mongodbAdapter(db),
  ...config,
});
