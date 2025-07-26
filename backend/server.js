const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("dotenv").config();
const User = require("./models/user");
const generateToken = require("./utils/generateToken");
const Task = require("./models/tasks");
const authMiddleware = require("./utils/authMiddleWare");
const AdminRoute = require("./utils/roleMiddleware");
const tasks = require("./models/tasks");
const user = require("./models/user");

const app = express();
app.use(express.json())
app.use(cors());

mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("✅ MongoDB connected successfully"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

app.post("/signup", async (req, res) => {
    const { name, email, password } = req.body;
    console.log(name, email, password);
    if (!name || !email || !password) {
        return res.status(400).json({ message: "please fill all details" });
    }
    try {
        const exist = await User.findOne({ email });
        if (exist) {
            return res.status(400).json({ message: "user already exist" });
        }

        const haspas = await bcrypt.hash(password, 10);
        const newuser = new User({ name, email, password: haspas, authType: "local" });
        await newuser.save();
        res.status(201).json({ message: "user created successfully" });
    } catch (err) {
        console.log("signup error", err);
        res.status(500).json({ message: "server error" });
    }
})

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log({ email, password });
    if (!email || !password) {
        return res.status(400).json({ message: "please fill all details" });
    }
    try {
        const userDet = await User.findOne({ email });
        console.log(userDet);
        if (!userDet || userDet.authType !== "local") {
            return res.status(404).json({ message: "User not found or invalid method" });
        }
        const match = await bcrypt.compare(password, userDet.password);
        if (!match) {
            return res.status(400).json({ message: "invalid password" });
        }
        console.log(userDet);
        const token = generateToken(userDet);

        res.status(200).json({
            message: "login successful",
            token,
            user: { name: userDet.name, email: userDet.email, role: userDet.role }
        });

    } catch (error) {
        console.log("error in login", error);
        return res.status(500).json({ message: "server error" });
    }
})

app.post("/google-login", async (req, res) => {
    const { email, name, picture, sub: googleId } = req.body;

    if (!email || !googleId) {
        return res.status(400).json({ message: "Missing Google data" });
    }

    try {
        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                name,
                email,
                googleId,
                picture,
                authType: "google",
            });
            await user.save();
        }

        const token = generateToken(user);

        res.status(200).json({
            message: "Google login successful",
            token,
            user: { name: user.name, email: user.email }
        });
    } catch (err) {
        console.error("Google login error:", err);
        res.status(500).json({ message: "Google login failed" });
    }
})

const otpStore = new Map(); // Temporary in-memory store

app.post("/forgotPassword", async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        otpStore.set(email, { otp, expiresAt: Date.now() + 15 * 60 * 1000 }); // 15 mins

        // Send OTP via email
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your OTP for password reset",
            html: `<p>Your OTP is <b>${otp}</b>. It is valid for 15 minutes.</p>`,
        });

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/verify-otp", async (req, res) => {
    const { email, otp } = req.body;
    const record = otpStore.get(email);

    if (!record) return res.status(400).json({ message: "No OTP found" });
    if (record.expiresAt < Date.now()) {
        otpStore.delete(email);
        return res.status(400).json({ message: "OTP expired" });
    }
    if (record.otp !== otp) return res.status(400).json({ message: "Invalid OTP" });

    otpStore.set(email, { ...record, verified: true });
    res.status(200).json({ message: "OTP verified" });
});

// ==================== STEP 3: Reset Password ====================
app.post("/reset-password", async (req, res) => {
    const { email, newPassword } = req.body;
    const record = otpStore.get(email);

    if (!record || !record.verified)
        return res.status(400).json({ message: "OTP not verified" });

    try {
        const hashed = await bcrypt.hash(newPassword, 10);
        await User.updateOne({ email }, { $set: { password: hashed } });

        otpStore.delete(email);
        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/addTask", authMiddleware, async (req, res) => {
    const formData = req.body;
    // console.log("Received Task Data:", formData);

    try {
        // Validate required fields
        if (!formData.name || !formData.description) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Create new task based on your schema
        const task = new Task({
            name: formData.name,
            description: formData.description,
            priority: formData.priority || "Low",
            status: formData.status || "Pending",
            subtasks: formData.subtasks,
            dueDate: formData.dueDate || null,
            createdBy: req.user.id,
        });

        const savedTask = await task.save();
        console.log("Task saved:", savedTask);
        return res.status(201).json({ message: "Task created successfully", task: savedTask });
    } catch (err) {
        console.error("❌ Error in /task route:", err);
        return res.status(500).json({ message: "Server error" });
    }
});

app.get("/getCount", authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user.id });
        // console.log(tasks);
        const sum = {
            total: tasks.length,
            pending: tasks.filter(task => task.status === "Pending").length,
            inProgress: tasks.filter(task => task.status === "In Progress").length,
            completed: tasks.filter(task => task.status === "Completed").length,
        }
        return res.status(200).json({ message: "got all data", summary: sum, tasks: tasks });
    } catch (error) {
        console.log("server error", error);
        return res.status(500).json({ message: "server error" })
    }
});

app.get("/MyTasks", authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ createdBy: req.user.id });
        res.status(200).json({ message: "got data", tasks });
    } catch (error) {
        console.log("server error", error);
        return res.status(500).json({ message: "server error" })
    }
});

app.put("/updateTask/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTask = await Task.findByIdAndUpdate(id, req.body, {
            new: true, // return the updated document
        });

        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error);
        res.status(500).json({ message: "Server error while updating task" });
    }
});

app.delete("/deleteTask/:id", authMiddleware, async (req, res) => {
    const taskId = req.params.id;
    // console.log("ig got",id);
    try {
        const deletedTask = await tasks.findByIdAndDelete(taskId);
        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.json({ message: "Task deleted successfully", task: deletedTask });
    } catch (error) {
        console.error("error occred", error);
        res.status(500).json({ message: "Internal server error" })
    }
});
app.get("/admin/Dashboard", authMiddleware, AdminRoute("admin"), async (req, res) => {
    try {
        const users = await User.find({ role: "user" });
        const tasks = await Task.find().populate("createdBy", "_id name");
        if (!users) {
            res.status(404).json({ message: "user not found" });
        }
        if (!tasks) {
            res.status(404).json({ message: "tasks not found" });
        }
        res.status(200).json({ message: "Data found", users: users, tasks: tasks });
    } catch (error) {
        res.status(500).json({ message: "server error" })
    }
});
app.delete("/admin/deleteUser/:id", authMiddleware, AdminRoute("admin"), async (req, res) => {
    const user = req.params;
    try {
        const userId = req.params.id;

        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully", user: deletedUser });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ message: "Server error while deleting user" });
    }
});

app.listen(3001, () => {
    console.log("connected successfully");
})