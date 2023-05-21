const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.h7lvo9z.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const toysCollection = client.db("toysDB").collection("toys");

    // all toys api
    app.get("/all-toys", async (req, res) => {
      let limit = req.query.limit;
      const sort = req.query.sort;
      if (limit !== "all") {
        limit = parseInt(limit);
      }
      let result;
      if (limit !== "all") {
        if (sort && sort === "asc") {
          result = await toysCollection
            .find()
            .sort({ price: 1 })
            .limit(limit)
            .toArray();
        } else if (sort && sort === "dsc") {
          result = await toysCollection
            .find()
            .sort({ price: -1 })
            .limit(limit)
            .toArray();
        } else {
          result = await toysCollection.find().limit(limit).toArray();
        }
      } else {
        if (sort && sort === "asc") {
          result = await toysCollection.find().sort({ price: 1 }).toArray();
        } else if (sort && sort === "dsc") {
          result = await toysCollection.find().sort({ price: -1 }).toArray();
        } else {
          result = await toysCollection.find().toArray();
        }
      }
      res.send(result);
    });

    // toys by tab
    app.get("/tab-toys", async (req, res) => {
      const tab = req.query.tab;
      const query = { category: tab };
      const result = await toysCollection.find(query).limit(6).toArray();
      res.send(result);
    });

    // single toy
    app.get('/toys/:id', async(req, res) => {
      const id = req.params.id 
      const query = {_id : new ObjectId(id)}
      const result = await toysCollection.findOne(query)
      res.send(result)
    })

    // adding a new toy
    app.post('/add-toy', async (req, res) => {
      const toy = req.body
      const result = await toysCollection.insertOne(toy)
      res.send(result)
    })

    // collecting my toys 
    app.get('/my-toys', async(req, res) => {
      const email = req.query.email 
      const query = {seller_email : email}
      const result = await toysCollection.find(query).toArray()
      console.log(result)
      res.send(result)
    })

    // delete a toy 
    app.delete('/delete-toy/:id', async (req, res) => {
      const id = req.params.id
      const query = {_id : new ObjectId(id)}
      const result = await toysCollection.deleteOne(query)
      res.send(result)
    })



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Motor Toys Server is Running");
});

app.listen(port, () => {
  console.log(`Motor Toys server is running on port: ${port}`);
});
