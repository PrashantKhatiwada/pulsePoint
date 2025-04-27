import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, "Description is required"],
    trim: true,
    maxlength: [500, "Description cannot be more than 500 characters"],
  },
  latitude: {
    type: Number,
    required: [true, "Latitude is required"],
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: [true, "Longitude is required"],
    min: -180,
    max: 180,
  },
  category: {
    type: String,
    required: [true, "Category is required"],
    enum: [
      "Fire",
      "Medical",
      "Police",
      "Natural Disaster",
      "Infrastructure",
      "Other",
    ],
    default: "Other",
  },
  status: {
    type: String,
    enum: ["Reported", "Verified", "In Progress", "Resolved"],
    default: "Reported",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create index for geospatial queries
reportSchema.index({ latitude: 1, longitude: 1 });

const Report = mongoose.model("Report", reportSchema);

export default Report;
