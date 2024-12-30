require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("savorly server is running");
});

// mongo url
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sdg7y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    deprecationErrors: true,
    strict: true,
  },
});

const run = async () => {
  try {
    await client.connect();
    console.log("mongodb connected successfully!");
  } catch (err) {
    console.log(err);
  }
};

run();

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
