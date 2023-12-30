import bcrypt from "bcrypt";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import "dotenv/config";
import { uploadImage } from "./imgUploadController.js";

const handleRegistration = async (req, res) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    age,
    batch,
    imageDataURI,
  } = req.body;
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
    let imageUrl =
      "https://i.pinimg.com/736x/7f/79/6d/7f796d57218d9cd81a92d9e6e8e51ce4--free-avatars-online-profile.jpg";
    if (imageDataURI) {
      imageUrl = await uploadImage(imageDataURI);
    }
    const newUser = new User({
      email,
      username,
      password: hashedPassword,
      firstName,
      lastName,
      refreshToken,
      age,
      batch,
      imageUrl,
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
        imageUrl,
      },
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });
    return { payload: ticket.getPayload() };
  } catch (error) {
    return { error: "Invalid user detected. Please try again" };
  }
}
const handleLogin = async (req, res) => {
  const loginType = req.headers["x-auth-method"];
  let userExists;
  if (loginType === "Google") {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json("Missing credential");
    }
    const verificationResponse = await verifyGoogleToken(credential);
    if (verificationResponse.error) {
      return res.status(400).json(verificationResponse.error);
    }

    const profile = verificationResponse?.payload;
    userExists = await User.findOne({ email: profile.email }).populate(
      "payments"
    );

    if (!userExists) {
      return res.status(404).json("User not found");
    }
  } else {
    const { credential } = req.body;
    const { username, loginPassword } = credential;
    // console.log(req.body);
    if (!username || !loginPassword) {
      return res.status(400).json("Username and password are required");
    }
    userExists = await User.findOne({ username }).populate("payments");
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
    const username = userExists.username;
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
        nextBatch: userExists.nextBatch,
        imageUrl: userExists.imageUrl,
      },
    });
  } catch (err) {
    console.log(err);
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
