import express from "express";
import { errorHandler } from "./utils/ApiError.js";
import auth from "./routes/auth.route.js";
import booking from "./routes/booking.route.js";
import artist from "./routes/artist.route.js";

const app = express();

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

app.get("/", (req, res) => {
    res.send("hi");
});

//routes declaration
app.use("/auth", auth);
app.use("/bookings", booking);
app.use("/artists", artist);

app.use(errorHandler);

export default app;
