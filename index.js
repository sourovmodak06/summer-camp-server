require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.boafyub.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const dbConnect = async () => {
  try {
    client.connect();
    console.log(" Database Connected Successfully✅ ");
  } catch (error) {
    console.log(error.name, error.message);
  }
};
dbConnect();

// Database Collection
const reviewCollection = client.db("SchoolofRock").collection("review");
const classCollection = client.db("SchoolofRock").collection("classes");
const instructorsCollection = client.db("SchoolofRock").collection("instructors");

app.get("/", (req, res) => {
  res.send("School of Rock server is Running");
});

app.get("/review", async (req, res) => {
  const result = await reviewCollection.find().toArray();
  res.send(result);
});
app.get("/classes", async (req, res) => {
  const result = await classCollection.find().sort( { "enrolledStudent": -1 } ).toArray();
  res.send(result);
});
app.get("/instructors", async (req, res) => {
  const result = await instructorsCollection.find().sort( { "enrolledStudent": -1 } ).toArray();
  res.send(result);
});


app.listen(port, () => {
  console.log(`Server PORT: ${port}`);
});
