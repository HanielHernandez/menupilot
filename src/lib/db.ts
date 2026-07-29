import { config } from "@/lib/config";
import mongoose from "mongoose";

if (!config.mongodb.uri) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached = global.mongooseCache ?? {
  conn: null,
  promise: null,
};

global.mongooseCache = cached;

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(config.mongodb.uri, {
      dbName: "menupilot",
    });
  }

  cached.conn = await cached.promise;

  return cached.conn;
}
