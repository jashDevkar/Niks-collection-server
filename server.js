import express from "express";
import db from "./db.js";
import authRoute from "./routes/auth.route.js";
import dotenv from 'dotenv';
import cors from "cors";


dotenv.config();

const app = express();

const port = process.env.PORT ?? 8000;


app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true, 
}));





app.get("/",(req,res)=>{
  res.send("Niks-Collection server is spinning up");
})



app.use(express.json());
app.use(authRoute)




app.listen(port, () => {
  console.log("🚀 Server is listening on port 8000");
});
