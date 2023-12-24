import multer from "multer";
//if disk storage is allowed in the deployment

const multerUpload = async (request, response, next) => {
  var storage = multer.diskStorage({
    destination: function (request, file, callback) {
      callback(null, "./upload");
    },
    filename: function (request, file, callback) {
      var allowedExtensions = ["jpg", "jpeg", "png", "webp"];

      var temp_file_arr = file.originalname.split(".");
      var temp_file_name = temp_file_arr[0];
      var temp_file_extension = temp_file_arr[1].toLowerCase(); // convert extension to lowercase for case-insensitive comparison

      // Check if the file extension is allowed
      if (allowedExtensions.includes(temp_file_extension)) {
        callback(
          null,
          temp_file_name + "-" + Date.now() + "." + temp_file_extension
        );
      } else {
        // If the file extension is not allowed, pass an error to the callback
        callback(new Error("Invalid file extension"));
      }
    },
  });

  var upload = multer({ storage: storage }).single("image");
  const { username } = request.body;

  upload(request, response, function (error) {
    if (error) {
      console.log(error);
      // if (error.message === "Invalid file extension") {
      //   return response
      //     .status(500)
      //     .json(
      //       "Invalid file extension. Allowed extensions are jpg, jpeg, png, and webp."
      //     );
      // } else {
      return response.status(500).json(error);
      // }
    } else {
      request.body.username = username;
      next();
    }
  });
};

export default multerUpload;
