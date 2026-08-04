import { config } from "@/lib/config";
import { sendPasswordResetEmail } from "@/lib/email";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { nextCookies } from "better-auth/next-js";
import { MongoClient } from "mongodb";

const client = new MongoClient(config.mongodb.uri);
const db = client.db("menupilot");

const authOptions = {
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({
      user,
      url,
    }: {
      user: { email: string; name?: string | null };
      url: string;
    }) {
      await sendPasswordResetEmail({
        to: user.email,
        resetUrl: url,
        name: user.name,
      });
    },
  },
  trustedOrigins: ["http://localhost:3000", config.app.url],
  plugins: [nextCookies()],
};

export const auth = betterAuth({
  database: mongodbAdapter(db),
  ...authOptions,
});
