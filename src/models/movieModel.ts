import mongoose, { Document, Schema } from "mongoose";

// Define a TypeScript interface for the Movie document
interface IMovie extends Document {
  title: string;
  genre: string;
  rating: number;
  streamingLink?: string;
  deletedAt?: Date | null;
}

const movieSchema: Schema<IMovie> = new Schema(
  {
    title: { type: String, required: true },
    genre: {
      type: String,
      required: true,
      enum: ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi'], // Enum for allowed genres
    },
    rating: {
      type: Number,
      required: true,
      default: 0,
      min: 0, // Ensure rating is not below 0
      max: 10, // Ensure rating is not above 10
    },
    streamingLink: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Create an index for `title` and `genre` to improve query performance
movieSchema.index({ title: 1, genre: 1 }, { unique: true }); // Composite index with unique constraint

// Add a method for soft deletion
movieSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};

// Define the model
const movieModel = mongoose.model<IMovie>("Movie", movieSchema);

export default movieModel;
