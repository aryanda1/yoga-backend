import mongoose from "mongoose";

const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  date: {
    type: Date,
    default: Date.now(),
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
  },
  paymentMonthYear: [
    {
      month: {
        type: Number,
        required: true,
        min: 1,
        max: 12,
      },
      year: {
        type: Number,
        required: true,
      },
    },
  ],
});
export default mongoose.model("Payment", paymentSchema);
// users
