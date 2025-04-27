import express from "express";
import Report from "../models/Report.js";

const router = express.Router();

/**
 * @route   GET /api/reports
 * @desc    Get all crisis reports
 * @access  Public
 */
router.get("/reports", async (req, res) => {
  try {
    const { category, status, days } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (days) {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - Number.parseInt(days));
      query.createdAt = { $gte: daysAgo };
    }

    const reports = await Report.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * @route   POST /api/report
 * @desc    Create a new crisis report
 * @access  Public
 */
router.post("/report", async (req, res) => {
  try {
    const { category, description, locationText, latitude, longitude, urgency } = req.body;

    // Validate required fields
    if (!category || !description || !locationText || latitude === undefined || longitude === undefined || !urgency) {
      return res.status(400).json({
        success: false,
        message: "Please provide category, description, location, coordinates, and urgency",
      });
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({
        success: false,
        message: "Invalid coordinates",
      });
    }

    // Create new report
    const newReport = await Report.create({
      title: category, // 👈 Here we use category as title!
      description,
      locationText,
      latitude,
      longitude,
      category,
      urgency,
    });

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: newReport,
    });
  } catch (error) {
    console.error("Error creating report:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * @route   GET /api/report/:id
 * @desc    Get a single report by ID
 * @access  Public
 */
router.get("/report/:id", async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

/**
 * @route   PUT /api/report/:id
 * @desc    Update a report's status
 * @access  Public
 */
router.put("/report/:id", async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Please provide status",
      });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedReport) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
});

export default router;
