import mongoose from "mongoose";

declare global {
  var _mongoose:
    | {
        conn?: typeof mongoose;
        promise?: Promise<typeof mongoose>;
      }
    | undefined;
}

export {};

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("Please define MONGODB_URI in env");

async function connectToDatabase() {
  if (globalThis._mongoose?.conn) {
    return globalThis._mongoose.conn;
  }
  if (!globalThis._mongoose) globalThis._mongoose = {};

  if (!globalThis._mongoose.promise) {
    globalThis._mongoose.promise = mongoose
      .connect(MONGODB_URI as string, {
      })
      .then((m) => m);
  }
  globalThis._mongoose.conn = await globalThis._mongoose.promise;
  return globalThis._mongoose.conn;
}

export default connectToDatabase;
