import cloudinary from "../utils/CLoudinary.js";

const uploadImage = async (path) => {
  const result = await cloudinary.uploader.upload(path);
  return result.secure_url;
};

const deleteImage = (url) => {
  cloudinary.uploader.destroy(
    url.split("/").pop().split(".")[0],
    function (err, result) {
      console.log(result, err);
    }
  );
};

export { uploadImage, deleteImage };
