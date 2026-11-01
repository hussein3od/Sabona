const crypto = require("crypto");
const supabase = require("../config/supabase");

const IMAGE_TYPES = {
  "image/jpeg": {
    extension: "jpg",
    matches: (buffer) =>
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff,
  },
  "image/png": {
    extension: "png",
    matches: (buffer) =>
      buffer.length >= 8 &&
      buffer.subarray(0, 8).equals(
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
      ),
  },
  "image/webp": {
    extension: "webp",
    matches: (buffer) =>
      buffer.length >= 12 &&
      buffer.toString("ascii", 0, 4) === "RIFF" &&
      buffer.toString("ascii", 8, 12) === "WEBP",
  },
};

const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const file = req.file;
    const imageType = IMAGE_TYPES[file.mimetype];

    if (!imageType || !imageType.matches(file.buffer)) {
      return res.status(400).json({
        message: "Only valid JPEG, PNG, and WebP images are allowed",
      });
    }

    const fileName = `${Date.now()}-${crypto.randomUUID()}.${imageType.extension}`;

    const { error } = await supabase.storage
      .from("sabona-images")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error(error);

      return res.status(500).json({
        message: "Image upload failed",
      });
    }

    const { data } = supabase.storage
      .from("sabona-images")
      .getPublicUrl(fileName);

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl: data.publicUrl,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};


module.exports = {
  uploadProductImage,
};