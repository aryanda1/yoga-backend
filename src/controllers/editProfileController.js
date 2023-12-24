import bcrypt from "bcrypt";
import User from "../models/User.js";
import { uploadImage, deleteImage } from "./imgUploadController.js";

export const editProfile = async (req, res) => {
  let { editProperty, editValue, imageDataURI } = req.body;
  const { username } = req.body;
  if (editProperty === "imageUrl") {
    if (!imageDataURI)
      return res.status(400).json({ message: "Image is required" });
    editValue = imageDataURI;
  }

  if (!editProperty || !editValue) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const user = await User.findOne({ username: username }).exec();
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found. Your token seems to be invalid" });
    }
    switch (editProperty) {
      case "email":
        // console.log(editValue);
        return editEmail(user, editValue, res);
      case "password":
        return editPassword(user, editValue, res);
      case "firstName":
        return editFirstName(user, editValue, res);
      case "lastName":
        return editLastName(user, editValue, res);
      case "nextBatch":
        return editNextBatch(user, editValue, res);
      case "imageUrl":
        return editImageUrl(user, editValue, res);
      default:
        return res.status(400).json({ message: "Invalid edit property" });
    }
  } catch (err) {
    return res.status(500).json(err);
  }
};
const editEmail = async (user, newEmail, res) => {
  try {
    await user.updateOne({ email: newEmail }).exec();
    return res.status(200).json({
      message: "Email updated successfully",
      email: newEmail,
    });
  } catch (err) {
    return res.status(400).json(err);
  }
};

const editPassword = async (user, newPassword, res) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  try {
    await user.updateOne({ password: hashedPassword }).exec();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (err) {
    return res.status(400).json(err);
  }
};

const editFirstName = async (user, newFirstName, res) => {
  try {
    await user.updateOne({ firstName: newFirstName }).exec();

    return res.status(200).json({
      message: "First name updated successfully",
      firstName: newFirstName,
    });
  } catch (err) {
    return res.status(400).json(err);
  }
};

const editLastName = async (user, newLastName, res) => {
  try {
    await user.updateOne({ lastName: newLastName }).exec();

    return res.status(200).json({
      message: "Last name updated successfully",
      lastName: newLastName,
    });
  } catch (err) {
    return res.status(400).json(err);
  }
};

const editNextBatch = async (user, newNextBatch, res) => {
  try {
    await user.updateOne({ nextBatch: newNextBatch }).exec();

    return res.status(200).json({
      message: "Phone number updated successfully",
      nextBatch: newNextBatch,
    });
  } catch (err) {
    return res.status(400).json(err);
  }
};
const editImageUrl = async (user, imagePath, res) => {
  try {
    if (user.imageUrl) deleteImage(user.imageUrl);

    const imageUrl = await uploadImage(imagePath);
    // fs.remove(imagePath);
    await user.updateOne({ imageUrl }).exec();

    return res.status(200).json({
      message: "Profile Picture updated successfully",
      imageUrl,
    });
  } catch (err) {
    console.log(err);

    return res.status(400).json(err);
  }
};
