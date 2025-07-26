// UpdateTaskForm.js
import React, { useState } from "react";
import "./updateForm.css";
import axios from "axios";
import { toast } from "react-toastify";

export default function UpdateTaskForm({ task, onClose, onUpdated }) {
    const [formData, setFormData] = useState({
        id: task._id,
        name: task.name,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        description: task.description,
        subtasks: task.subtasks || []
    });


    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubtaskChange = (index) => {
        const updatedSubtasks = [...formData.subtasks];
        updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
        setFormData({ ...formData, subtasks: updatedSubtasks });
    };

    const handleUpdate = async () => {
        try {
            const token = localStorage.getItem("token");
            await axios.put(
                `http://localhost:3001/updateTask/${task._id}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            onUpdated(); // refresh dashboard
            onClose();   // close form
            toast.success("Updated Sucessfully");
        } catch (error) {
            console.error("Update failed:", error);
        }
    };
    const deleteTask = async (id) => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.delete(`http://localhost:3001/deleteTask/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            console.log(res);
            onUpdated(); // ✅ Refresh myTasks
            onClose();
            toast.success("Task Deleted Sucessfully");
            // getCount()
        } catch (error) {
            console.error("Error deleting task:", error);
            toast.error("Failed to delete")
        }
    }

    return (
        <div className="update-task-form">
            <div className="updateFormHead">
                <h2>Update Task</h2>
                <button onClick={() => deleteTask(formData.id)}>Delete</button>

            </div>
            <input type="text" className="updateTaskName" name="name" value={formData.name} onChange={handleChange} />
            <textarea rows={5} name="description" value={formData.description} onChange={handleChange} />
            <select name="status" value={formData.status} onChange={handleChange}>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
            </select>
            <select name="priority" value={formData.priority} onChange={handleChange}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
            </select>
            <input type="date" name="dueDate" value={formData.dueDate?.slice(0, 10)} onChange={handleChange} />

            {formData.subtasks.map((sub, index) => (
                <label key={index}>
                    <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => handleSubtaskChange(index)}
                    />
                    {sub.text}
                </label>
            ))}

            <button onClick={handleUpdate}>Save</button>
            <button onClick={onClose}>Cancel</button>
        </div>
    );
}
