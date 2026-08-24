import mongoose from "mongoose";

interface MongooseConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// eslint-disable-next-line no-var
declare global {
  var mongooseConnection: MongooseConnection | undefined;
}

let cached: MongooseConnection = global.mongooseConnection ?? { conn: null, promise: null };

if (!global.mongooseConnection) {
  global.mongooseConnection = cached;
}

export async function connectToDatabase() {
  console.log("[db.ts] connectToDatabase START");
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("[db.ts] connectToDatabase ERROR: MONGODB_URI environment variable is not defined!");
    throw new Error("MONGODB_URI environment variable is not defined. Please add it in Vercel Dashboard → Settings → Environment Variables.");
  }

  console.log("[db.ts] MONGODB_URI prefix:", MONGODB_URI.substring(0, 22) + "...");

  if (cached.conn) {
    console.log("[db.ts] connectToDatabase SUCCESS: Using cached connection");
    return cached.conn;
  }

  if (!cached.promise) {
    console.log("[db.ts] connectToDatabase: Creating new mongoose connection promise...");
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      console.log("[db.ts] mongoose.connect promise resolved successfully");
      return m;
    }).catch((err) => {
      console.error("[db.ts] mongoose.connect promise rejected:", err);
      throw err;
    });
  } else {
    console.log("[db.ts] connectToDatabase: Reusing existing connection promise...");
  }

  try {
    cached.conn = await cached.promise;
    console.log("[db.ts] connectToDatabase SUCCESS: Connection established successfully");
  } catch (e) {
    console.error("[db.ts] connectToDatabase ERROR during connection execution:", e);
    cached.promise = null;
    throw e;
  }

  console.log("[db.ts] connectToDatabase END");
  return cached.conn;
}
