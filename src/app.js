const express = require("express");
const connectDB = require("./config/database");
const app = express();
const User = require("./models/user");

app.post("/signup", async (req, res) => {
  // create a new instance of the user model
  const user = new User({
    firstName: "Krishna",
    lastName: "Saini",
    emailId: "krishna@chauhan.com",
    password: "krishna@123",
  });

  try {
    await user.save();
    res.send("User added successfully!");
  } catch (err) {
    res.status(400).send("Error saving the user:" + err.message);
  }
});

connectDB()
  .then(() => {
    console.log("Database connection successfully...");
    app.listen(3000, () => {
      console.log("Server is successfully connected on PORT 3000....");
    });
  })
  .catch((err) => {
    console.error("Database is not connected successfully...");
  });
