import express from "express";
import cors from "cors";
import registerRoute from "./routes/register.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));  

app.use("/api/register", registerRoute);

app.get("/", (req, res) => res.send("Backend is running"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server running on " + PORT));
