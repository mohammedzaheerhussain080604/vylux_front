import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv"

dotenv.config()

export const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});


// 🔥 TEST DATABASE CONNECTION
db.connect()
  .then((client) => {
    console.log("✅ Database connected successfully (Neon)");

    client.release(); // important
  })
  .catch((err) => {
    console.log("❌ Database connection failed:");
    console.log(err.message);
  });