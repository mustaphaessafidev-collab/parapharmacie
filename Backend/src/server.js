require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5000;
const cors = require("cors");

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});