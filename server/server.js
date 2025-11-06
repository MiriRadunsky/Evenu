const express = require('express');
const cors = require("cors")
const { connectMongo } = require('./db/connect.db');
const mongoHealth = require('./db/health.db');

const app = express();
const PORT = process.env.PORT || 3000

app.use(cors(corsOptions))
app.use(express.static("public"))
app.get('/health/mongo', mongoHealth);
app.get("/", (req, res)=>{res.send("This is home page")})

connectMongo().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
