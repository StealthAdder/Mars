const mongoose = require('mongoose');
const connectDB = async () => {
  //
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // avoid console errors
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
