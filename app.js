document.addEventListener('DOMContentLoaded', loadTasks);
document.getElementById('task-form').addEventListener('submit', addTask);

function addTask(e) {
    e.preventDefault();

    const taskName = document.getElementById('task-name').value;
    const dueDate = document.getElementById('due-date').value;
    const project = document.getElementById('project').value;
    const priority = document.getElementById('priority').value;

    const id = Date.now();
    const task = {
        id,
        taskName,
        dueDate,
        project,
        priority,
        completed: false,
        subtasks: []
    };

    addTaskToDOM(task);
    storeTaskInLocalStorage(task);
    document.getElementById('task-form').reset();
    sortTasks();
}

function addTaskToDOM(task) {
    const taskRow = document.createElement('tr');
    taskRow.setAttribute('data-id', task.id);
    taskRow.classList.add(task.priority);

    taskRow.innerHTML = `
        <td><input type="checkbox" class="complete-btn" ${task.completed ? 'checked' : ''}></td>
        <td>${task.taskName}</td>
        <td>${task.dueDate}</td>
        <td>${task.project}</td>
        <td>
            <button class="delete-btn">Delete</button>
            <button class="add-subtask-btn">+ Subtask</button>
            <div class="subtasks"></div>
        </td>
    `;

    document.getElementById('task-list').appendChild(taskRow);
}

document.getElementById('task-list').addEventListener('click', function(e) {
    const taskRow = e.target.closest('tr');
    const taskId = taskRow.getAttribute('data-id');

    if (e.target.classList.contains('delete-btn')) {
        taskRow.remove();
        removeTaskFromLocalStorage(taskId);
    } else if (e.target.classList.contains('complete-btn')) {
        toggleTaskCompletion(taskId, taskRow);
    } else if (e.target.classList.contains('add-subtask-btn')) {
        addSubtask(taskId, taskRow);
    } else if (e.target.classList.contains('delete-subtask-btn')) {
        removeSubtask(taskId, e.target.dataset.subtaskId, taskRow);
    }
});

function addSubtask(taskId, taskRow) {
    const subtaskName = prompt("Enter subtask name:");
    if (!subtaskName) return;

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id == taskId);
    const subtaskId = Date.now();
    task.subtasks.push({ id: subtaskId, name: subtaskName });

    updateLocalStorage(tasks);
    displaySubtasks(task, taskRow);
}

function displaySubtasks(task, taskRow) {
    const subtaskContainer = taskRow.querySelector('.subtasks');
    subtaskContainer.innerHTML = '';

    task.subtasks.forEach(subtask => {
        const subtaskElement = document.createElement('div');
        subtaskElement.classList.add('subtask-item');
        subtaskElement.innerHTML = `
            ${subtask.name}
            <button class="delete-subtask-btn" data-subtask-id="${subtask.id}">X</button>
        `;
        subtaskContainer.appendChild(subtaskElement);
    });
}

function removeSubtask(taskId, subtaskId, taskRow) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id == taskId);
    task.subtasks = task.subtasks.filter(s => s.id != subtaskId);

    updateLocalStorage(tasks);
    displaySubtasks(task, taskRow);
}

function sortTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    updateLocalStorage(tasks);
    refreshTaskList();
}

function updateLocalStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function refreshTaskList() {
    document.getElementById('task-list').innerHTML = '';
    loadTasks();
}

function loadTasks() {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => {
        addTaskToDOM(task);
    });
}
