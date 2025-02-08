import mongoose from "mongoose";

const MONGODB_URI =
  'mongodb+srv://lohuminitin:scnajksbcscbasb@chatdb.i2qkv.mongodb.net/?retryWrites=true&w=majority&appName=chatDb';
// const MONGODB_URI =process.env.MONGODB_URI;
if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}
let cached = global.mongoose || { conn: null, promise: null };
async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI,{
      tls: true,
    });
  }
  cached.conn = await cached.promise;
  const db = cached.conn.connection.db;
  const collections = await db.listCollections({ name: "messages" }).toArray();

  if (collections.length === 0) {
    await db.createCollection("messages", { capped: true, size: 500000, max: 50 });
  } else {
  }
  return cached.conn;
}

export default connectDB;
