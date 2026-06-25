import mongoose from "mongoose";
import dns from "node:dns";

// mongodb+srv needs SRV DNS records. Some ISP resolvers time out on SRV,
// causing "querySrv ECONNREFUSED". Force reliable public DNS for lookups.
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is not set in .env");

  mongoose.set("strictQuery", true);
  const conn = await mongoose.connect(uri);
  console.log(`✅ Mongo connected: ${conn.connection.host}/${conn.connection.name}`);
  return conn;
}
