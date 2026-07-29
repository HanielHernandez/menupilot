function env(name: string, fallback = ""): string {
  return (process.env[name] ?? fallback).trim();
}

export const config = {
  app: {
    url: env("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  },
  auth: {
    secret: env("BETTER_AUTH_SECRET"),
    url: env("BETTER_AUTH_URL", "http://localhost:3000"),
  },
  mongodb: {
    uri: env("MONGODB_URI"),
    username: env("MONGODB_USERNAME"),
    password: env("MONGODB_PASSWORD"),
  },
  r2: {
    token: env("R2_TOKEN"),
    accessKeyId: env("R2_ACCESS_KEY_ID"),
    secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
    endpoint: env("R2_ENDPOINT"),
    bucket: env("R2_BUCKET"),
    publicUrl: env("R2_PUBLIC_URL"),
  },
  openai: {
    apiKey: env("OPENAI_API_KEY"),
  },
} as const;

export type AppConfig = typeof config;
