const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // members: [{
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User"  // assuming you have a User model
  // }],
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent"],
    default: "Low"
  },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending"
  },
  subtasks: [{
    text: String,
    completed: { type: Boolean, default: false }
  }],
  dueDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Automatically update `updatedAt` before saving
taskSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Task", taskSchema);
