document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    checkUpcomingDeadlines();
});

document.getElementById('task-form').addEventListener('submit', addTask);

// Función para agregar una tarea
function addTask(e) {
    e.preventDefault();

    const taskName = document.getElementById('task-name').value;
    const dueDate = document.getElementById('due-date').value;
    const project = document.getElementById('project').value;
    const priority = document.getElementById('priority').value;

    const id = Date.now(); // Identificador único
    const task = {
        id,
        taskName,
        dueDate,
        project,
        priority,
        completed: false,
        subtasks: []
    };

    storeTaskInLocalStorage(task);
    refreshTaskList();
    checkUpcomingDeadlines();
    document.getElementById('task-form').reset();
}

// Agregar tarea al DOM
function addTaskToDOM(task) {
    const taskRow = document.createElement('tr');
    taskRow.setAttribute('data-id', task.id);
    taskRow.classList.toggle('completed', task.completed);
    taskRow.classList.add(task.priority); // Aplica color de prioridad
    
    if (task.completed) {
        taskRow.classList.add('task-completed');
    }

    taskRow.innerHTML = `
        <td><input type="checkbox" class="complete-btn" ${task.completed ? 'checked' : ''}></td>
        <td>${task.taskName}</td>
        <td>${task.dueDate}</td>
        <td>${task.project}</td>
        <td>${task.priority}</td>
        <td>
            <button class="delete-btn">Delete</button>
            <button class="subtask-btn">Subtasks</button>
        </td>
    `;

    document.getElementById('task-list').appendChild(taskRow);
}

// Delegación de eventos
const taskList = document.getElementById('task-list');
taskList.addEventListener('click', function(e) {
    const taskRow = e.target.closest('tr');
    const taskId = taskRow.getAttribute('data-id');

    if (e.target.classList.contains('delete-btn')) {
        taskRow.remove();
        removeTaskFromLocalStorage(taskId);
    } else if (e.target.classList.contains('complete-btn')) {
        toggleTaskCompletion(taskId, taskRow);
    } else if (e.target.classList.contains('subtask-btn')) {
        openSubtaskModal(taskId);
    }
});

// Alternar estado de tarea completada
function toggleTaskCompletion(taskId, taskRow) {
    let tasks = getTasksFromLocalStorage();
    tasks = tasks.map(task => {
        if (task.id === parseInt(taskId)) {
            task.completed = !task.completed;
            taskRow.classList.toggle('completed', task.completed);
            if (task.completed) {
                taskRow.classList.add('task-completed');
            } else {
                taskRow.classList.remove('task-completed');
            }
        }
        return task;
    });
    saveTasksToLocalStorage(tasks);
    refreshTaskList();
}

// Verificar tareas próximas a vencer
function checkUpcomingDeadlines() {
    const now = new Date();
    let tasks = getTasksFromLocalStorage();
    const notifications = document.getElementById('notifications');
    notifications.innerHTML = '';
    
    tasks.forEach(task => {
        const taskDueDate = new Date(task.dueDate);
        const timeDiff = taskDueDate - now;
        const hoursDiff = timeDiff / (1000 * 60 * 60);
        
        if (hoursDiff > 0 && hoursDiff <= 24 && !task.completed) {
            const notification = document.createElement('div');
            notification.classList.add('notification');
            notification.textContent = `Tarea próxima a vencer: ${task.taskName} - ${task.dueDate}`;
            notifications.appendChild(notification);
        }
    });
}

// Otras funciones sin cambios...

// Cargar tareas ordenadas por fecha límite
function loadTasks() {
    refreshTaskList();
}

function refreshTaskList() {
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';
    let tasks = getTasksFromLocalStorage();

    tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    tasks.forEach(task => addTaskToDOM(task));
}

function storeTaskInLocalStorage(task) {
    let tasks = getTasksFromLocalStorage();
    tasks.push(task);
    saveTasksToLocalStorage(tasks);
}

function removeTaskFromLocalStorage(taskId) {
    let tasks = getTasksFromLocalStorage();
    tasks = tasks.filter(task => task.id !== parseInt(taskId));
    saveTasksToLocalStorage(tasks);
}

function getTasksFromLocalStorage() {
    return JSON.parse(localStorage.getItem('tasks')) || [];
}

function saveTasksToLocalStorage(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Funciones de subtareas
function openSubtaskModal(taskId) {
    document.getElementById('subtask-modal').style.display = 'block';
    document.getElementById('subtask-form').setAttribute('data-task-id', taskId);
    loadSubtasks(taskId);
}

document.getElementById('subtask-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const taskId = this.getAttribute('data-task-id');
    const subtaskName = document.getElementById('subtask-name').value;

    let tasks = getTasksFromLocalStorage();
    tasks = tasks.map(task => {
        if (task.id === parseInt(taskId)) {
            task.subtasks.push({ id: Date.now(), name: subtaskName });
        }
        return task;
    });
    saveTasksToLocalStorage(tasks);
    document.getElementById('subtask-name').value = '';
    loadSubtasks(taskId);
});

function loadSubtasks(taskId) {
    const subtaskList = document.getElementById('subtask-list');
    subtaskList.innerHTML = '';
    const tasks = getTasksFromLocalStorage();
    const task = tasks.find(task => task.id === parseInt(taskId));

    if (task && task.subtasks) {
        task.subtasks.forEach(subtask => {
            const li = document.createElement('li');
            li.innerHTML = `${subtask.name} <button class="delete-subtask" data-id="${subtask.id}" data-task-id="${taskId}">❌</button>`;
            subtaskList.appendChild(li);
        });
    }
}

document.getElementById('subtask-list').addEventListener('click', function(e) {
    if (e.target.classList.contains('delete-subtask')) {
        const subtaskId = e.target.getAttribute('data-id');
        const taskId = e.target.getAttribute('data-task-id');
        removeSubtask(taskId, subtaskId);
    }
});

function removeSubtask(taskId, subtaskId) {
    let tasks = getTasksFromLocalStorage();
    tasks = tasks.map(task => {
        if (task.id === parseInt(taskId)) {
            task.subtasks = task.subtasks.filter(subtask => subtask.id !== parseInt(subtaskId));
        }
        return task;
    });
    saveTasksToLocalStorage(tasks);
    loadSubtasks(taskId);
}

// Cerrar modal de subtareas
document.querySelector('.close-button').addEventListener('click', function() {
    document.getElementById('subtask-modal').style.display = 'none';
});