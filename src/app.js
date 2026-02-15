const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");
const { validateSignUpData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");

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
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      // Create a JWT Token
      const token = await jwt.sign({ _id: user._id }, "Otaku@Tinder$789");

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
app.get("/profile", async (req, res) => {
  try {
    const cookies = req.cookies;

    const { token } = cookies;
    if (!token) {
      throw new Error("Invalid Token");
    }

    // validate my token
    const decodedMessage = await jwt.verify(token, "Otaku@Tinder$789");
    const { _id } = decodedMessage;

    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User does not exist");
    }

    res.send(user);
  } catch (error) {
    res.status(400).send("ERROR : " + error.message);
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
