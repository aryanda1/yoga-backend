import multer from "multer";
//to be used if disk storage is not allowed

const multerUpload = async (request, response, next) => {
  const storage = multer.memoryStorage(); // Use memory storage

  const upload = multer({ storage: storage }).single("image");
  const { username } = request.body;

  upload(request, response, function (error) {
    if (error) {
      console.log(error);
      return response.status(500).json(error);
    } else {
      // Check if the file extension is allowed
      const allowedExtensions = ["jpg", "jpeg", "png", "webp"];
      if (request.file) {
        const temp_file_arr = request.file.originalname.split(".");
        const temp_file_extension = temp_file_arr[1].toLowerCase();

        if (!allowedExtensions.includes(temp_file_extension)) {
          return response.status(400).json({ error: "Invalid file extension" });
        }

        // Access the file data as a Buffer
        const fileBuffer = request.file.buffer;
        request.file.buffer = null;
        // Convert the Buffer to a data URI
        const dataURI = `data:${
          request.file.mimetype
        };base64,${fileBuffer.toString("base64")}`;

        // Now, you have the data URI in the dataURI variable
        //   console.log("Data URI:", dataURI);

        // You can also add the data URI to the request body or do further processing

        // Add username to the request body
        request.body.username = request.body.username || username;

        // Add data URI to the request body
        request.body.imageDataURI = dataURI;
      }
      next();
    }
  });
};

export default multerUpload;
