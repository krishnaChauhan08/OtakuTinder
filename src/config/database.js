const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://chauhankrishna0820:chauhankrishna2005@cluster0.ihqmvsx.mongodb.net/OtakuTinder",
  );
};

module.exports = connectDB;


