document.addEventListener('DOMContentLoaded', loadTasks);
document.getElementById('task-form').addEventListener('submit', addTask);

// Function to add a task
function addTask(e) {
    e.preventDefault();

    const taskName = document.getElementById('task-name').value;
    const dueDate = document.getElementById('due-date').value;
    const project = document.getElementById('project').value;

    const id = Date.now(); // Unique identifier

    const task = {
        id,
        taskName,
        dueDate,
        project,
        completed: false
    };

    addTaskToDOM(task);
    storeTaskInLocalStorage(task);

    document.getElementById('task-form').reset();
}

// Function to add task to the DOM
function addTaskToDOM(task) {
    const taskRow = document.createElement('tr');
    taskRow.setAttribute('data-id', task.id);
    taskRow.classList.toggle('completed', task.completed); // Add 'completed' class if task is completed

    taskRow.innerHTML = `
        <td>
            <input type="checkbox" class="complete-btn" ${task.completed ? 'checked' : ''}>
        </td>        
        <td>${task.taskName}</td>
        <td>${task.dueDate}</td>
        <td>${task.project}</td>
        <td>
            <button class="delete-btn">Delete</button>
        </td>
    `;

    // Append completed tasks at the end or prepend non-completed tasks at the beginning
    document.getElementById('task-list').appendChild(taskRow);
}

// Event delegation for deleting or completing a task
document.getElementById('task-list').addEventListener('click', function(e) {
    const taskRow = e.target.parentElement.parentElement;
    const taskId = taskRow.getAttribute('data-id');

    if (e.target.classList.contains('delete-btn')) {
        taskRow.remove(); // Remove from DOM
        removeTaskFromLocalStorage(taskId); // Remove from localStorage
    } else if (e.target.classList.contains('complete-btn')) {
        toggleTaskCompletion(taskId, taskRow); // Mark task as completed or not
    }
});

// Toggle task completion
function toggleTaskCompletion(taskId, taskRow) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.map(task => {
        if (task.id === parseInt(taskId)) {
            task.completed = !task.completed;
            // Animate the row
            taskRow.classList.toggle('completed', task.completed); // Toggle completed class
            // Allow time for the CSS transition before removing from DOM
            if (task.completed) {
                taskRow.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                taskRow.style.opacity = '0'; // Fade out
                setTimeout(() => {
                    document.getElementById('task-list').appendChild(taskRow); // Move to end
                    taskRow.style.opacity = '1'; // Fade in
                }, 300); // Match the duration of your transition
            } else {
                document.getElementById('task-list').prepend(taskRow); // Move back to the top if not completed
            }
        }
        return task;
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Refresh the task list (clear and reload tasks from localStorage)
function refreshTaskList() {
    const taskList = document.getElementById('task-list');
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    taskList.innerHTML = ''; // Clear task list

    // Reinsert tasks in order
    tasks.forEach(task => {
        addTaskToDOM(task);
    });
}

// Store task in localStorage
function storeTaskInLocalStorage(task) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage on page load
function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    tasks.forEach(task => {
        addTaskToDOM(task);
    });
}

// Remove task from localStorage by ID
function removeTaskFromLocalStorage(taskId) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(task => task.id !== parseInt(taskId));
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
