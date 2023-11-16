const mongosse = require("mongoose");
const { Schema } = mongosse;

const photoSchema = new Schema(
  {
    image: String,
    title: String,
    likes: Array,
    comments: Array,
    userId: mongosse.ObjectId,
    userName: String,
  },
  {
    timestamps: true,
  }
);

const Photo = mongosse.model("Photo", photoSchema);
module.exports = Photo;
