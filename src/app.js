const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { userAuth } = require("./middlewares/auth");

app.use(express.json());
app.use(cookieParser());

// create the new user
app.post("/signup", async (req, res) => {
  try {
    // 1. validation of data
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // 2. Encrypt the password
    const passwordHash = await bcrypt.hash(password, 10);

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

// login API
app.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    if (!validator.isEmail(emailId)) {
      throw new Error("Email you write is not correct!");
    }

    // validate the email - check if email is present in db or not
    const user = await User.findOne({ emailId: emailId });
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // validate the password - check if password is correct or not
    const isPasswordValid = await user.validatePassword(password);

    if (isPasswordValid) {
      // Create a JWT Token
      const token = await user.getJWT();

      // Add the token to cookie and send the response back to the user
      res.cookie("token", token);

      res.status(200).send("Login Successfull!");
    } else {
      throw new Error("Invalid credentials");
    }
  } catch (error) {
    res.status(400).send("ERROR :" + error.message);
  }
});

// Get the Profile
app.get("/profile", userAuth, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      throw new Error("User does not exist");
    }
    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
  }
});

app.post("/sendConnectionRequest", userAuth, async (req, res) => {
  try {
    const user = req.user;
    // sending a connection request
    console.log("Sending request sent!");

    res.send(user.firstName + " sent the connection request");
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
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
