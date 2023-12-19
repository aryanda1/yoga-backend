import jwt from "jsonwebtoken";
import User from "../models/User.js";
import "dotenv/config";

export const handleTokenRefresh = (req, res) => {
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;
  if (!refreshToken) {
    return res.status(401).json("No refresh token received.");
  }

  try {
    User.findOne({ refreshToken })
      .populate("payments")
      .then((user) => {
        if (!user) {
          return res.status(403).json("No matching user found.");
        }
        jwt.verify(
          refreshToken,
          process.env.REFRESH_TOKEN_SECRET,
          (err, decoded) => {
            if (err || decoded.username != user.username)
              return res.status(403).json("Invalid refresh token.");
          }
        );

        const accessToken = jwt.sign(
          { username: user.username },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "1d",
          }
        );
        return res.status(200).json({
          message: "Token refreshed",
          user: {
            accessToken: accessToken,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            age: user.age,
            batch: user.batch,
            payments: user.payments,
            joiningDate: user.joiningDate,
          },
        });
      })
      .catch((err) => {
        console.log(err);
        return res.status(500).json(err);
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};
