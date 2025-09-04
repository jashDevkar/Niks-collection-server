import express from "express";
import db from "./db.js";
import authRoute from "./routes/auth.route.js";
import dotenv from 'dotenv';
import cors from "cors";


dotenv.config();

const app = express();

app.use(cors({
  origin: "*", // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, 
}));



// (async () => {
//     try {
//         const connection = await db.getConnection();
//     console.log("✅ Connected to MySQL Workbench DB");
//     connection.release();
// } catch (err) {
//     console.error("❌ DB Connection Failed:", err.message);
//   }
// })();



app.use(express.json());
app.use(authRoute)




app.listen(8000, () => {
  console.log("🚀 Server is listening on port 8000");
});
