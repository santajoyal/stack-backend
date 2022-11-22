const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const app = express();
const dotenv = require("dotenv").config();
const URL = process.env.DB;
// const URL = "mongodb://localhost:27017"
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.post("/user/register", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("stackoverflow");
    var salt = await bcrypt.genSalt(10);
    var hash = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash;
    const user = await db.collection("users").insertOne(req.body);
    await connection.close();
    res.json({ message: "User Created" });
  } catch (console) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("stackoverflow");
    const user = await db
      .collection("users")
      .findOne({ email: req.body.email });
      await connection.close();
    if (user) {
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        jwt.sign({ _id: user._id }, "d9esy3oniugjhzvx", {
          expiresIn: "48h",
        });
        res.json({ token });
      }
    } else {
      res.status(401).json({ message: "username/password is incorrect" });
    }
  } catch (error) {
    res.status(500).json({ message: "username/password is incorrect" });
  }
});

app.get("/list-question", async function (req, res) {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("stackoverflow");
    const ques = await db.collection("questions").find().toArray();
    await connection.close();
    res.json(ques);
  } catch (error) {
    res.status(500).json({ message: "something went wrong" });
  }
});

app.post("/question-create", async function (req, res) {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("stackoverflow");
    const ques = await db.collection("questions").insertOne(req.body);
    await connection.close();
    res.json({ message: "question created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

app.post("/answer/:rId", async function (req, res) {
  try {
    const connection = await mongoclient.connect(URL);
    const db = connection.db("stackoverflow");
    const answer = await db
      .collection("answers")
      .insertOne({ rId: mongodb.ObjectId(req.params.rId), ...req.body });
    await connection.close();
    res.json({ message: "Answer added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
});


app.get("/answer/:rId", async function (req, res) {
    try {
      const connection = await mongoclient.connect(URL);
      const db = connection.db("stackoverflow");
      const answer = await db
        .collection("answers")
        .find({ rId: mongodb.ObjectId(req.params.rId)});
      await connection.close();
      res.json({answer});
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "something went wrong" });
    }
  });
app.listen(process.env.PORT || 3003);

