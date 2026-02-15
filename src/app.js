const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");

app.use(express.json());

// create the new user
app.post("/signup", async (req, res) => {
  try {
    // 1. validation of data
    validateSignUpData(req);
    
    const { firstName, lastName, emailId, password } = req.body;

    // 2. Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);
    console.log(passwordHash);

    // 3. create a new instance of the user model
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });
    await user.save();
    res.send("User added successfully!");
  } catch (err) {
    res.status(400).send("ERROR:" + err.message);
  }
});

// GET user by email
app.get("/user", async (req, res) => {
  const userEmail = req.body.emailId;
  try {
    const user = await User.findOne({ emailId: userEmail });
    if (!user) {
      res.status(404).send("User not found");
    } else {
      res.send(user);
    }
    // const user = await User.find({ emailId: userEmail });
    // if (user.length === 0) {
    //   res.status(404).send("User not found");
    // }
    // res.send(users);
  } catch (error) {
    res.status(400).send("Sometthing went wrong!");
  }
});

// Get all the user from the database
app.get("/feed", async (req, res) => {
  try {
    const user = await User.find({});
    res.send(user);
  } catch (error) {
    res.status(400).send("Sometthing went wrong!");
  }
});

// Delete the user from the database
app.delete("/user/:id", async (req, res) => {
  const userId = req.params.id;
  console.log("Deleting user:", userId);

  if (!userId) {
    return res.status(400).send("User ID required");
  }

  try {
    await User.findByIdAndDelete(userId);
    res.send("User deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(400).send("Something went wrong");
  }
});

// update the existing USER
app.patch("/user/:id", async (req, res) => {
  const data = req.body;
  const userId = req.params?.id;

  try {
    const allowedUpdates = [
      "userId",
      "photoUrl",
      "about",
      "gender",
      "age",
      "skills",
    ];

    const isUpdateAllowed = Object.keys(data).every((k) => {
      return allowedUpdates.includes(k);
    });

    if (!isUpdateAllowed) {
      throw new Error("Update not allowed");
    }

    if (data?.skills.length > 10) {
      throw new Error("Skills cannot be more than 10");
    }

    await User.findByIdAndUpdate(userId, data);
    res.send("User updated successfully!");
  } catch (error) {
    res.status(400).send("Update Failed!" + error.message);
  }
});

// connection to MongoDatabase
connectDB()
  .then(() => {
    console.log("Database connection successfully...");
    app.listen(3000, () => {
      console.log("Server is successfully connected on PORT 3000....");
    });
  })
  .catch((err) => {
    console.log(err);
    console.error("Database is not connected successfully...");
  });
