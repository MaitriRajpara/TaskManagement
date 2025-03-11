let completedTasks = 0;
let totalTasks = 0;
let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let isEditing = false;
let editTaskId = null;
let titleSearchQuery = "";
let descSearchQuery = "";
let titleDescSearchQuery = "";
let statusFilter = "";

function searchTasks() {
    titleSearchQuery = document.getElementById("titleSearch").value.trim().toLowerCase();
    descSearchQuery = document.getElementById("descSearch").value.trim().toLowerCase();
    titleDescSearchQuery = document.getElementById("titleDescSearch").value.trim().toLowerCase();
    statusFilter = document.getElementById("statusFilter").value;

    displayTasks();
}

function displayTasks() {
    const taskList = document.getElementById("taskList");
    taskList.innerHTML = "";
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    if (tasks.length === 0) {
        taskList.innerHTML = `<div class="text-center lh-3 bg-opacity-50 bg-warning"><b>No Tasks</b></div>`;
        return;
    }

    const filteredTasks = tasks.filter((task) => {
        const matchesTitle = task.title.toLowerCase().includes(titleSearchQuery);
        const matchesDescription = task.description.toLowerCase().includes(descSearchQuery);
        const matchesTitleOrDescription = task.title.toLowerCase().includes(titleDescSearchQuery) || task.description.toLowerCase().includes(titleDescSearchQuery);
        const matchesStatus = statusFilter ? task.status === statusFilter : true;

        return (
            (!titleSearchQuery || matchesTitle) &&
            (!descSearchQuery || matchesDescription) &&
            (!titleDescSearchQuery || matchesTitleOrDescription) &&
            matchesStatus
        );
    });

    if (filteredTasks.length === 0) {
        taskList.innerHTML = `<b class="text-center">No matching tasks found</b>`;
    } else {
        filteredTasks.forEach((task) => {
            let taskDiv = document.createElement("div");
            taskDiv.classList.add("task");
            taskDiv.innerHTML = `
            <div class="col-md-4">
                <div class="card ${getTaskColor(task.status)} shadow">
                    <div class="card-body">
                        <h3 class="card-title">${task.title}</h3>
                        <p class="card-text">${task.description}</p>
                        <select class="form-select form-select-sm mb-2" onchange="updateTaskStatus(this, '${task.id}')">
                            <option value="To Do" ${task.status === "To Do" ? "selected" : ""}>To Do</option>
                            <option value="In Progress" ${task.status === "In Progress" ? "selected" : ""}>In Progress</option>
                            <option value="Completed" ${task.status === "Completed" ? "selected" : ""}>Completed</option>
                        </select>
                        <div class="mt-3 d-flex justify-content-between">
                            <button class="btn btn-secondary btn-sm" onclick="deleteTask('${task.id}')">Delete</button>
                            <button class="btn btn-secondary btn-sm" onclick="editTask('${task.id}')">Edit</button>
                        </div>
                    </div>
                </div>
            </div>
            `;
            taskList.appendChild(taskDiv);
        });
    }

    Count();
}

function storeTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function clearFields() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    isEditing = false;
    editTaskId = null;
    document.getElementById("addTaskButton").innerText = "Add Task";
}

function addTask() {
    const title = document.getElementById("taskTitle").value.trim();
    const description = document.getElementById("taskDescription").value.trim();

    if (!title || !description) {
        alert("Please fill in both the title and description.");
        return;
    }

    if (!isEditing && tasks.some(task => task.title.toLowerCase() === title.toLowerCase())) {
        alert("A task with this title already exists.");
        return;
    }

    if (isEditing) {
        let task = tasks.find((task) => task.id === editTaskId);
        if (task) {
            task.title = title;
            task.description = description;
        }
    } else {
        let newTask = {
            id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), // Fallback for older browsers
            title,
            description,
            status: "To Do",
        };
        tasks.push(newTask);
    }

    storeTasks();
    clearFields();
    displayTasks();
}

function editTask(id) {
    let task = tasks.find((task) => task.id === id);
    if (task) {
        document.getElementById("taskTitle").value = task.title;
        document.getElementById("taskDescription").value = task.description;

        isEditing = true;
        editTaskId = id;

        document.getElementById("addTaskButton").innerText = "Update Task";
    }
}

function updateTaskStatus(select, taskId) {
    let task = tasks.find((task) => task.id === taskId);
    if (task) {
        task.status = select.value;
        storeTasks();
        displayTasks();
    }
}

function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    storeTasks();
    displayTasks();
}

function getTaskColor(status) {
    switch (status) {
        case "Completed": return "bg-success bg-opacity-25 border border-success";
        case "In Progress": return "bg-warning bg-opacity-25 border border-warning";
        default: return "bg-danger bg-opacity-25 border border-danger";
    }
}

function Count() {
    completedTasks = tasks.filter((task) => task.status === "Completed").length;
    remainingTasks = tasks.filter((task) => task.status !== "Completed").length;
    totalTasks = tasks.length;
    document.getElementById("completedCount").innerText = completedTasks;
    document.getElementById("remainingCount").innerText = remainingTasks;
}

const addTaskButton = document.getElementById("addTaskButton");
if (addTaskButton) {
    addTaskButton.addEventListener("click", addTask);
}

document.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        addTask();
    }
});

displayTasks();
