import mongoose from "mongoose";

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is not set in .env — cannot start database connection.");
    process.exit(1);
  }

  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    // Fail gracefully: log a clear message instead of crashing with a raw stack trace.
    console.error("MongoDB connection failed.");
    console.error(`Reason: ${err.message}`);
    console.error(
      "Make sure MongoDB is running and MONGO_URI in backend/.env is correct. " +
        "The server will exit since the API cannot function without a database."
    );
    process.exit(1);
  }

  mongoose.connection.on("disconnected", () => {
    console.warn("MongoDB disconnected.");
  });
}
