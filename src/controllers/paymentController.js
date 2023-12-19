import mongoose from "mongoose";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
export const receivePayment = async (req, res) => {
  const { months } = req.body;
  const { username } = req.body;

  if (!months) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ username: username }).populate(
      "payments"
    );
    if (!user) {
      return res
        .status(400)
        .json("User not found. Your token seems to be invalid");
    }
    const { month, year } = getLastMonthYear(user);
    const dateprev = new Date(year, month, 1);
    const datecur = new Date();
    const monthDiff = getMonthDiff(dateprev, datecur);
    if (monthDiff < months)
      return res.status(400).json({ message: "You can't pay for more months" });
    const monthYears = getMonthYear(monthDiff, month, year);
    const newPayment = new Payment({
      user: user._id,
      paymentMonthYear: monthYears,
    });
    {
      const session = await mongoose.startSession();
      session.startTransaction();
      await newPayment.save({ session });
      user.payments.push(newPayment._id);
      await user.save({ session });
      await session.commitTransaction();
    }
    return res
      .status(200)
      .json({ message: "Payment Confirmed!", payment: newPayment });
  } catch (err) {
    return res.status(500).json(err);
  }
};

function getLastMonthYear(user) {
  if (user.payments.length === 0) {
    const date = user.joiningDate;
    const month = date.getMonth() - 1 === -1 ? 11 : date.getMonth() - 1;
    const year = month === 11 ? date.getFullYear() - 1 : date.getFullYear();
    return { month, year };
  } else {
    const { paymentMonthYear } = user.payments[user.payments.length - 1];
    const lastPayment = paymentMonthYear[paymentMonthYear.length - 1];
    return { month: lastPayment.month, year: lastPayment.year };
  }
}

function getMonthDiff(startDate, endDate) {
  return (
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth())
  );
}

function getMonthYear(months, lastMonth, lastYear) {
  const monthYears = [];
  for (let i = 1; i <= months; i++) {
    lastMonth = (lastMonth + 1) % 12;
    if (lastMonth === 0) lastYear += 1;
    monthYears.push({ month: lastMonth, year: lastYear });
  }
  return monthYears;
}
