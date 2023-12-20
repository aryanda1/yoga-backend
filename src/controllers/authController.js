import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import "dotenv/config";

const handleRegistration = async (req, res) => {
  const { firstName, lastName, username, email, password, age, batch } =
    req.body;
  console.log(req.body);
  if (
    !firstName ||
    !lastName ||
    !username ||
    !password ||
    !email ||
    !age ||
    !batch
  ) {
    return res.status(400).json("Missing basic information");
  }
  let duplicate = await User.findOne({ username });
  if (duplicate) {
    return res.status(409).json("Username already exists");
  }
  duplicate = await User.findOne({ email }).exec();
  if (duplicate) {
    return res.status(409).json("Email already exists");
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const accessToken = jwt.sign(
      { username },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "1d",
      }
    );
    const refreshToken = jwt.sign(
      { username },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "30d",
      }
    );
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      refreshToken,
      age,
      batch,
    });

    await newUser.save();
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).json({
      message: "Registration successful for " + username + "!",
      user: {
        accessToken: accessToken,
        username,
        firstName,
        lastName,
        email,
        age,
        batch,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const handleLogin = async (req, res) => {
  const { username, loginPassword } = req.body;
  console.log(req.body);
  if (!username || !loginPassword) {
    return res.status(400).json("Username and password are required");
  }
  const userExists = await User.findOne({ username }).populate("payments");
  if (!userExists) {
    return res.status(404).json("User not found");
  }
  const passwordMatch = await bcrypt.compare(
    loginPassword,
    userExists.password
  );
  if (!passwordMatch) {
    return res.status(401).json("Incorrect password");
  }
  const accessToken = jwt.sign(
    { username: userExists.username },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1d",
    }
  );
  const refreshToken = jwt.sign(
    { username: userExists.username },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "30d",
    }
  );

  try {
    await User.updateOne({ username }, { refreshToken });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Sign in successful",
      user: {
        accessToken: accessToken,
        username: userExists.username,
        firstName: userExists.firstName,
        lastName: userExists.lastName,
        email: userExists.email,
        age: userExists.age,
        batch: userExists.batch,
        payments: userExists.payments,
        joiningDate: userExists.joiningDate,
      },
    });
  } catch (err) {
    return res.status(500).json(err);
  }
};

const handleLogout = async (req, res) => {
  const refreshToken = req.cookies ? req.cookies.refreshToken : null;
  if (!refreshToken) {
    return res.sendStatus(204);
  }
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  try {
    User.findOne({ refreshToken })
      .exec()
      .then((user) => {
        if (!user) {
          return res.status(204);
        }
        user.updateOne({ refreshToken: "" }).then(() => {
          return res.sendStatus(204);
        });
      });
  } catch (err) {
    return res.status(500).json(err);
  }
};

export { handleRegistration, handleLogin, handleLogout };
