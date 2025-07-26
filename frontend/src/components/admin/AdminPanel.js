// src/components/AdminPanel.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { AiOutlineClose } from "react-icons/ai";
import "./AdminPanel.css";


export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userName, setUserName] = useState();
  const [email, setEmail] = useState();
  const [active, setActive] = useState("Dashboard");
  const buttons = ["Dashboard", "Manage Tasks", "Users"];
  const loggedIn = localStorage.getItem("token");
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({
    totalTasks: 0,
    totalUsers: 0
  });
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
  const navigate = useNavigate();
  const [counts, setCounts] = useState({
    All: "",
    Pending: "",
    InProgress: "",
    Completed: ""
  });
  const [selectedFilter, setSelectedFilter] = useState("All");
  const filteredTasks =
    selectedFilter === "All"
      ? tasks
      : tasks.filter((task) =>
        selectedFilter === "InProgress"
          ? task.status === "In Progress"
          : task.status === selectedFilter
      );

  useEffect(() => {
    const getData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:3001/admin/Dashboard", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        setSummary({
          totalTasks: res.data.tasks.length,
          totalUsers: res.data.users.length
        })
        const sum = {
          All: res.data.tasks.length,
          Pending: res.data.tasks.filter(task => task.status === "Pending").length,
          InProgress: res.data.tasks.filter(task => task.status === "In Progress").length,
          Completed: res.data.tasks.filter(task => task.status === "Completed").length,
        };
        setCounts(sum);
        setTasks(res.data.tasks);
        setUsers(res.data.users);
        // console.log(res.data);
      } catch (error) {

      }
    }
    getData();
    const storedUser = JSON.parse(localStorage.getItem("user")); // ✅ parse from string
    setUserName(storedUser?.name || "User"); // set state if needed
    setEmail(storedUser?.email || "User")
  }, [active]);
  // console.log(summary);

  const handleLogout = async () => {
    try {
      localStorage.clear();
      navigate("/login");
      toast.success("logout successful")

    } catch (error) {
      console.error("error occured", error);
      toast.error("logout failed");
    }
  }
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.delete(`http://localhost:3001/admin/deleteUser/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Delete Response:", res.data); // optional: view server response

      // Update UI
      setUsers((prevUsers) => prevUsers.filter((u) => u._id !== userId));
      toast.success("User deleted successfully");
    } catch (error) {
      console.error("Failed to delete user", error);
      toast.error("Failed to delete user");
    }
  };


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
              <div><span>{summary.totalTasks}</span> Total Tasks</div>
              <div><span>{summary.totalUsers}</span> Total Users</div>
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
                  <div className="taskCell">CreatedBy</div>
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
                    <div className="taskCell">{task.createdBy.name}</div>
                    <div className="taskCell">{new Date(task.createdAt).toLocaleDateString()}</div>


                  </div>
                ))}

              </div>
            </div>
          </div>
        </div>}
        {active === "Manage Tasks" && <div className="rightContainer">
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
          <div className="Tasks">{filteredTasks.map((task) => {
            const completedCount = task.subtasks?.filter(t => t.completed).length || 0;
            const totalCount = task.subtasks?.length || 0;
            const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

            return (
              <div key={task._id} className={` TaskDet ${getStatusClass(task.status)}`} >
                <div className="statusPriority">
                  <div className="status"> {task.status}</div>
                  <div className="createdBy">{task.createdBy.name}</div>
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
          })}</div>
        </div>}
        {active === "Users" && (
          <div className="rightContainer">
            <div className="userHeader">
              <h2>All Users</h2>
            </div>
            <div className="userCont">
              {users.map((user) => {
                const taskCount = tasks.filter((task) => task.createdBy?._id === user._id).length;
                return (
                  <div className="userCard" key={user._id}>
                    <p><strong>Name:</strong> {user.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Total Tasks:</strong> {taskCount}</p>
                    <button
                      className="deleteBtn"
                      onClick={() => handleDeleteUser(user._id)}
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
