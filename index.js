require("dotenv").config();
const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;

app.use(cors());

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
    const dishesCollection = client.db("savorly").collection("dishes");
    app.get("/dishes", async (req, res) => {
      const count = req.query.count;
      const size = req.query.size;
      const page = req.query.page;
      const category = req.query.category;
      const search = req.query.search || "";
      const categoryCount = req.query.categoryCount;
      const searchCount = req.query.searchCount;
      let query = {};
      // if category availabe then added category to query
      if (category) {
        query.category = category;
      }
      // if search available then added search to query based on product name
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }
      // if searchcount and search true that means it will count total searched data and create pagination dynamic based on count
      if (searchCount == "true" && search) {
        const result = await dishesCollection.countDocuments({
          name: { $regex: search, $options: "i" },
        });
        return res.json({ searchCount: result });
      }
      // if categoryCount true then it will count the data based on category i passed
      if (categoryCount) {
        const result = await dishesCollection.countDocuments({
          category: categoryCount,
        });
        return res.json({ categoryCount: result });
      }
      // if count is true then it will coung all data available on collection
      if (count) {
        const result = await dishesCollection.estimatedDocumentCount();
        return res.json({ count: result });
      }
      // default pagination
      const result = await dishesCollection
        .find(query)
        .limit(parseInt(size))
        .skip(page * size)
        .toArray();
      res.send(result);
    });
  } catch (err) {
    console.log(err);
  }
};

run();

app.listen(port, () => {
  console.log(`server running on port ${port}`);
});
