import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DB_CONNECTION_STRING!;
console.log('hihi');

async function connectToDB() {
  try {
    await mongoose.connect(DATABASE_URL);
    console.log("Connection has been established successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    process.exit(1);
  }
}

connectToDB();

export default mongoose;
