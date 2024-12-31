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
      // console.log(req.query);
      let query = {};
      if (category) {
        query.category = category;
      }
      if (search) {
        console.log(search);
        query.name = { $regex: search, $options: "i" };
      }
      console.log({ searchCount, search });
      if (searchCount == "true" && search) {
        console.log("object");
        const result = await dishesCollection.countDocuments({
          name: { $regex: search, $options: "i" },
        });
        console.log("searchcount", result);
        return res.json({ searchCount: result });
      }
      if (categoryCount) {
        const result = await dishesCollection.countDocuments({
          category: categoryCount,
        });
        return res.json({ categoryCount: result });
      }
      if (count) {
        const result = await dishesCollection.estimatedDocumentCount();
        return res.json({ count: result });
      }
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
