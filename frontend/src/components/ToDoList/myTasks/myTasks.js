import React, { useEffect, useState } from "react";
import "./myTasks.css";
import axios from "axios";

export default function MyTask({refersh , onEditTask}) {
    const [tasks, setTasks] = useState([]);
    const [counts, setCounts] = useState({
        All: "",
        Pending: "",
        InProgress: "",
        Completed: ""
    });
    const [selectedFilter, setSelectedFilter] = useState("All");


    const getStatusClass = (status) => {
        switch (status) {
            case "Pending":
                return "task-pending";
            case "In Progress":
                return "task-inprogress";
            case "Completed":
                return "task-completed";
            default:
                return "";
        }
    };
    const filteredTasks =
        selectedFilter === "All"
            ? tasks
            : tasks.filter((task) =>
                selectedFilter === "InProgress"
                    ? task.status === "In Progress"
                    : task.status === selectedFilter
            );
    // console.log(tasks);

    useEffect(() => {
        const getTasks = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios("http://localhost:3001/MyTasks", {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const fetchedTasks = res.data.tasks;
                setTasks(fetchedTasks);

                const sum = {
                    All: fetchedTasks.length,
                    Pending: fetchedTasks.filter(task => task.status === "Pending").length,
                    InProgress: fetchedTasks.filter(task => task.status === "In Progress").length,
                    Completed: fetchedTasks.filter(task => task.status === "Completed").length,
                };
                setCounts(sum);


            } catch (error) {
                console.log("from frontend", error);
            }
        }
        getTasks()
    }, [refersh]);
    return (
        <div className="myTaskMain">
            <div className="myTaskHead">
                <h2>My Tasks</h2>
                <div className="taskFilter">
                    {["All", "Pending", "InProgress", "Completed"].map((label) => (
                        <p
                            key={label}
                            className={selectedFilter === label ? "active" : ""}
                            onClick={() => setSelectedFilter(label)}
                        >
                            {label}
                            <span>{counts[label]}</span>
                        </p>
                    ))}
                </div>
            </div>
            <div className="Tasks">
                {filteredTasks.map((task) => {
                    const completedCount = task.subtasks?.filter(t => t.completed).length || 0;
                    const totalCount = task.subtasks?.length || 0;
                    const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                    return (
                        <div key={task._id} className={` TaskDet ${getStatusClass(task.status)}`} onClick={() => onEditTask(task)}>
                            <div className="statusPriority">
                                <div className="status"> {task.status}</div>
                                <div className="priority">{task.priority}</div>
                            </div>
                            <strong><p className="taskText">{task.name}</p></strong>
                            <p className="taskText">{task.description}</p>

                            <div className="task-progress-info">
                                <p><strong>Task Done:</strong> {completedCount} / {totalCount}</p>
                                <div className="progress-bar-container">
                                    <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }}></div>
                                </div>
                            </div>

                            <div className="taskTime">
                                <div>
                                    <p>Created on:<br />
                                        <strong>{new Date(task.createdAt).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric"
                                        })}</strong>
                                    </p>
                                </div>
                                <div>
                                    <p>Due on:<br />
                                        <strong>{new Date(task.dueDate).toLocaleDateString("en-US", {
                                            year: "numeric",
                                            month: "short",
                                            day: "numeric"
                                        })}</strong>
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}

            </div>
        </div>
    )
}