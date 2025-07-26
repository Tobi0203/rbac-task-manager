import React, { useState } from "react";
import "./TaskForm.css";
import { toast } from "react-toastify";
import axios from "axios";
import { AiFillDelete } from 'react-icons/ai';

export default function TaskForm({ refershcount }) {
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        priority: "",
        status: "",
        dueDate: "",
        subtasks: [],
        attachments: [],
    });

    const [subtaskText, setSubtaskText] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const addSubtask = () => {
        if (!subtaskText.trim()) return;
        setFormData({
            ...formData,
            subtasks: [...formData.subtasks, { text: subtaskText }]
        });
        setSubtaskText("");
    };

    const deleteSubtask = (index) => {
        const updated = formData.subtasks.filter((_, i) => i !== index);
        setFormData({ ...formData, subtasks: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem("token");
            // console.log(token);
            const res = await axios.post("http://localhost:3001/addTask", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(res);
            toast.success("Successfully added");
            refershcount?.();
        } catch (error) {
            console.log("Error in sending to backend", error);
            toast.error("Server error");
        }
    };

    return (
        <div className="task-form-container">
            <h2>Create Task</h2>
            <form onSubmit={handleSubmit} className="task-form">
                <div className="formRow">
                    <label >Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Task Title"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="formRow">
                    <label>Description</label>
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        rows="5"
                        required
                    />
                </div>

                <div className="form-row formRow">
                    <div>
                        <label>Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} required>
                            <option value="">Select Priority</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                    <div>
                        <label>Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            value={formData.dueDate}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} required>
                            <option value="">Select Status</option>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className="formRow">
                    <label>TODO Checklist</label>
                    <ul className="checklist">
                        {formData.subtasks.map((sub, i) => (
                            <li key={i}>
                                <span>{String(i + 1).padStart(2, "0")} </span>
                                {sub.text}
                                <AiFillDelete className="deleteIcon" onClick={() => deleteSubtask(i)} />
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="inline-field formRow">
                    <input
                        type="text"
                        placeholder="Add subtask"
                        value={subtaskText}
                        onChange={(e) => setSubtaskText(e.target.value)}
                    />
                    <button type="button" className="add" onClick={addSubtask}>Add</button>
                </div>

                <div className="form-actions">
                    <button type="submit" className="submition">CREATE TASK</button>
                </div>
            </form>
        </div>
    );
}
