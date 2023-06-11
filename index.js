require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization) {
    return res
      .status(401)
      .send({ error: true, message: "unauthorized access" });
  }

  const token = authorization.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
};

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
const classCartCollection = client.db("SchoolofRock").collection("classCart");
const instructorsCollection = client
  .db("SchoolofRock")
  .collection("instructors");
const userCollection = client.db("SchoolofRock").collection("users");

app.get("/", (req, res) => {
  res.send("School of Rock server is Running");
});
app.post("/jwt", (req, res) => {
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  res.send({ token });
});
app.get("/users", async (req, res) => {
  const result = await userCollection.find().toArray();
  res.send(result);
});
app.post("/users", async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
  const existingUser = await userCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: "user already exists" });
  }
  const result = await userCollection.insertOne(user);
  res.send(result);
});
app.get("/users/admin/:email", verifyJWT, async (req, res) => {
  const email = req.params.email;
  if (req.decoded.email !== email) {
    res.send({ admin: false });
  }
  const query = { email: email };
  const user = await userCollection.findOne(query);
  const result = { admin: user?.role === "admin" };
  res.send(result);
});
app.patch("/users/admin/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: "admin",
    },
  };
  const result = await userCollection.updateOne(filter, updateDoc);
  res.send(result);
});

app.patch("/users/instructor/:id", async (req, res) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const updateDoc = {
    $set: {
      role: "instructor",
    },
  };
  const result = await userCollection.updateOne(filter, updateDoc);
  res.send(result);
});

app.get("/review", async (req, res) => {
  const result = await reviewCollection.find().toArray();
  res.send(result);
});
app.get("/classes", async (req, res) => {
  const result = await classCollection
    .find()
    .sort({ enrolledStudent: -1 })
    .toArray();
  res.send(result);
});
app.get("/classCart", verifyJWT, async (req, res) => {
  const email = req.query.email;
  if (!email) {
    res.send([]);
  }
  const decodedEmail = req.decoded.email;
  if (email !== decodedEmail) {
    return res.status(403).send({ error: true, message: "forbidden access" });
  }
  const query = { email: email };
  const result = await classCartCollection.find(query).toArray();
  res.send(result);
});
app.post("/classCart", async (req, res) => {
  const item = req.body;
  console.log(item);
  const result = await classCartCollection.insertOne(item);
  res.send(result);
});
app.delete("/classCart/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await classCartCollection.deleteOne(query);
  res.send(result);
});
app.get("/instructors", async (req, res) => {
  const result = await instructorsCollection
    .find()
    .sort({ enrolledStudent: -1 })
    .toArray();
  res.send(result);
});

app.listen(port, () => {
  console.log(`Server PORT: ${port}`);
});
