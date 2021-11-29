const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    maxlength: [120, "Name must be less than 120 characters"],
  },
  price: {
    type: Number,
    required: [true, "Price is required"],
    maxlength: [5, "Price must be less than 5 characters"],
  },
  description: {
    type: String,
    required: [true, "Description is required"],
  },
  photos: [
    {
      id: {
        type: String,
        required: [true, "Photo id is required"],
      },
      secure_url: {
        type: String,
        required: [true, "Photo secure_url is required"],
      },
    },
  ],
  category: {
    type: String,
    required: [true, "Category is required."],
    enum: {
      values: ["electronics", "clothes", "books", "others"],
      message: "Choose a category.",
    },
  },
  brand: {
    type: String,
    required: [true, "Brand is required."],
  },
  stock: {
    type: String,
    required: [true],
  },
  ratings: {
    type: Number,
    default: 0,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required: [true, "User is required"],
      },
      name: {
        type: String,
        required: [true, "Name is required"],
      },

      rating: {
        type: Number,
        required: [true, "Rating is required"],
      },
      comment: {
        type: String,
        required: [true, "Comment is required"],
      },
    },
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Product", productSchema);
