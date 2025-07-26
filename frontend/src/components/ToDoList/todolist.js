import React, { useState, useEffect } from "react";
import "./toDoList.css";
import TaskForm from "./TaskForm/TaskForm";
import MyTask from "./myTasks/myTasks";
import UpdateTaskForm from "./updateForm";

import axios from "axios";
import { AiOutlineClose } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

function TodoCont() {
    const [active, setActive] = useState("Dashboard");
    const buttons = ["Dashboard", "My Tasks", "Add Task"];
    const [userName, setUserName] = useState();
    const [email, setEmail] = useState();
    const [menuOpen, setMenuOpen] = useState(false);
    const today = new Date().toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
    });
    const [tasks, setTasks] = useState([]);
    const [summary, setSummary] = useState({
        total: 0,
        toDo: 0,
        inProgress: 0,
        completed: 0
    });
    const navigate = useNavigate();
    const loggedIn = localStorage.getItem("token");
    const [refershMyTask, setRefreshMyTasks] = useState(false)
    const [editingTask, setEditingTask] = useState(null);
    const handleLogout = () => {
        // localStorage.removeItem("isLoggedIn");
        // localStorage.removeItem("user");
        // localStorage.removeItem("token");
        localStorage.clear();
        navigate("/login");
    }


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

    const getCount = async () => {
        try {
            const token = localStorage.getItem("token");
            // console.log("ProtectedRoute → token:", token);
            const res = await axios.get("http://localhost:3001/getCount", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            console.log("counts", res);
            setSummary(res.data.summary);
            setTasks(res.data.tasks);

        } catch (error) {
            console.log("error occured", error);
        }
    }



    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user")); // ✅ parse from string
        setUserName(storedUser?.name || "User"); // set state if needed
        setEmail(storedUser?.email || "User")
        getCount();
    }, []);

    return (
        <div>
            <div className="taskHeader">
                <h1>Task manager</h1>
                <div className="menuIcon" onClick={() => setMenuOpen(!menuOpen)}>
                    &#9776;
                </div>
            </div>
            <div className="mainToDo">
                <div className={`toDoMenu ${menuOpen ? "showMenu" : ""}`}>
                    <AiOutlineClose
                        className="closeMenuIcon"
                        onClick={() => setMenuOpen(false)}
                    />
                    <div className="optionHead">
                        <h3 className="userName">{userName}</h3>
                        <p className="userEmail" title={email}>{email}</p>
                    </div>

                    <div className="toDoOption">
                        {buttons.map((label) => (
                            <button
                                key={label}
                                className={`option-button ${active === label ? "active-button" : ""}`}
                                onClick={() => {
                                    setActive(label)
                                    setMenuOpen(false);
                                }}
                            >
                                {label}
                            </button>
                        ))}
                        {loggedIn && <button className="nav-button" onClick={handleLogout}>logout</button>}
                    </div>
                </div>
                {active === "Dashboard" && <div className="rightContainer">
                    <div className="toDosum">
                        <div className="toDoSumHead">
                            <h1 >welcome {userName}</h1>
                            <p>{today}</p>
                        </div>
                        <div className="toDoSumCont">
                            <div><span>{summary.total}</span> Total</div>
                            <div><span>{summary.completed}</span> completed</div>
                            <div><span>{summary.inProgress}</span> In-Progress</div>
                            <div><span>{summary.pending}</span> Pending</div>
                        </div>
                    </div>
                    <div className="toDoList">
                        <div className="toDoListHead">
                            <h2>Tasks</h2>
                        </div>
                        <div className="List">
                            <div className="taskListContainer">
                                <div className="taskListHeader">
                                    <div className="taskCell name">Name</div>
                                    <div className="taskCell">Status</div>
                                    <div className="taskCell">Priority</div>
                                    <div className="taskCell">Created At</div>
                                </div>

                                {tasks.map((task) => (
                                    <div
                                        key={task._id}
                                        className={`taskCard ${getStatusClass(task.status)}`}
                                        style={{ position: "relative" }}
                                    >
                                        <div className="taskCell name" title={task.name}>{task.name}</div>
                                        <div className="taskCell">{task.status}</div>
                                        <div className="taskCell">{task.priority}</div>
                                        <div className="taskCell">{new Date(task.createdAt).toLocaleDateString()}</div>


                                    </div>
                                ))}

                            </div>
                        </div>
                    </div>
                </div>}
                {active === "My Tasks" && (editingTask ? (<UpdateTaskForm task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onUpdated={getCount}
                />) : (
                    <MyTask
                        refersh={refershMyTask}
                        onEditTask={(task) => setEditingTask(task)}
                    />))}
                {active === "Add Task" && <TaskForm refershcount={() => {
                    getCount();
                    setRefreshMyTasks((prev) => !prev); // Toggle refresh trigger
                }} />}
            </div>
        </div>
    )
}
export default TodoCont;