import mongoose from "mongoose";

const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  age: {
    type: Number,
    required: true,
    min: 18,
    max: 65,
  },
  batch: {
    type: Number,
    required: true,
  },
  nextBatch: {
    type: Number,
  },
  joiningDate: {
    type: Date,
    default: Date.now(),
  },
  payments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Payment",
      required: true,
      default: [],
    },
  ],
  refreshToken: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
});
export default mongoose.model("User", userSchema);
// users
