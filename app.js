const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const descriptionInput = document.getElementById("task-description");
const submitButton = document.getElementById("task-submit");
const cancelButton = document.getElementById("cancel-edit");
const taskList = document.getElementById("task-list");
const statusMessage = document.getElementById("status-message");

let config;
let editingId = null;
let busy = false;

function showMessage(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? "#b91c1c" : "#166534";
}

function setBusy(value) {
  busy = value;

  document.querySelectorAll("button").forEach((button) => {
    button.disabled = value;
  });
}

async function request(path, method = "GET", data) {
  const response = await fetch(
    `${config.supabaseUrl}/rest/v1/${config.tableName}${path}`,
    {
      method: method,
      headers: {
        apikey: config.supabasePublishableKey,
        "Content-Type": "application/json",
        Prefer: "return=representation"
      },
      body: data === undefined ? undefined : JSON.stringify(data)
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || `Request failed: ${response.status}`);
  }

  return result;
}

function resetForm() {
  editingId = null;
  form.reset();
  submitButton.textContent = "Add task";
  cancelButton.hidden = true;
}

function makeButton(text, className, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.className = className;
  button.disabled = busy;
  button.addEventListener("click", action);
  return button;
}

async function loadTasks() {
  const tasks = await request("?select=*&order=id.asc");
  taskList.replaceChildren();

  if (tasks.length === 0) {
    taskList.textContent = "No tasks yet. Add your first task!";
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement("div");
    item.className = "task-item";
    item.dataset.id = task.id;

    if (task.completed) {
      item.classList.add("completed");
    }

    const title = document.createElement("h3");
    title.className = "task-title";
    title.textContent = task.title;

    const description = document.createElement("p");
    description.className = "task-description";
    description.textContent = task.description || "";

    const status = document.createElement("p");
    status.className = "task-status";
    status.textContent = task.completed ? "Completed" : "Incomplete";

    const editButton = makeButton(
      "Edit",
      "edit-task",
      () => editTask(task.id)
    );

    const toggleButton = makeButton(
      task.completed ? "Mark incomplete" : "Mark complete",
      "toggle-task",
      () => toggleTask(task.id, task.completed)
    );

    const deleteButton = makeButton(
      "Delete",
      "delete-task",
      () => deleteTask(task.id)
    );

    item.append(
      title,
      description,
      status,
      editButton,
      toggleButton,
      deleteButton
    );

    taskList.appendChild(item);
  });
}

async function runAction(action) {
  if (busy) return;

  setBusy(true);
  showMessage("Please wait...");

  try {
    await action();
  } catch (error) {
    showMessage(`Error: ${error.message}`, true);
  } finally {
    setBusy(false);
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!title) {
    showMessage("Please enter a task title.", true);
    return;
  }

  runAction(async () => {
    const isEditing = editingId !== null;

    if (isEditing) {
      const updated = await request(
        `?id=eq.${editingId}`,
        "PATCH",
        { title, description }
      );

      if (updated.length === 0) {
        throw new Error("Task no longer exists. Refresh the page.");
      }
    } else {
      await request("", "POST", {
        title,
        description,
        completed: false
      });
    }

    resetForm();
    await loadTasks();
    showMessage(isEditing ? "Task updated." : "Task added.");
  });
});

async function editTask(id) {
  await runAction(async () => {
    const tasks = await request(`?id=eq.${id}&select=*`);

    if (tasks.length === 0) {
      throw new Error("Task no longer exists. Refresh the page.");
    }

    const task = tasks[0];
    editingId = task.id;
    titleInput.value = task.title;
    descriptionInput.value = task.description || "";
    submitButton.textContent = "Save changes";
    cancelButton.hidden = false;
    titleInput.focus();

    showMessage("Edit the task and click Save changes.");
  });
}

async function toggleTask(id, completed) {
  await runAction(async () => {
    const updated = await request(
      `?id=eq.${id}`,
      "PATCH",
      { completed: !completed }
    );

    if (updated.length === 0) {
      throw new Error("Task no longer exists. Refresh the page.");
    }

    await loadTasks();
    showMessage("Task status updated.");
  });
}

async function deleteTask(id) {
  await runAction(async () => {
    await request(`?id=eq.${id}`, "DELETE");

    if (editingId === id) {
      resetForm();
    }

    await loadTasks();
    showMessage("Task deleted.");
  });
}

cancelButton.addEventListener("click", () => {
  resetForm();
  showMessage("Editing cancelled.");
});

async function start() {
  setBusy(true);
  showMessage("Loading tasks...");

  try {
    const response = await fetch("./config.json");

    if (!response.ok) {
      throw new Error("Could not load config.json.");
    }

    config = await response.json();

    if (
      !config.supabaseUrl ||
      !config.supabasePublishableKey ||
      config.tableName !== "tasks"
    ) {
      throw new Error("Check the settings in config.json.");
    }

    config.supabaseUrl = config.supabaseUrl.replace(/\/+$/, "");

    await loadTasks();
    showMessage("Tasks loaded.");
    setBusy(false);
  } catch (error) {
    showMessage(
      `Could not start: ${error.message} Fix the problem and refresh the page.`,
      true
    );
  }
}

start();
