// Важные объявления переменных
let modalBtn = document.querySelectorAll('.header__creature')
let offerBtn = document.querySelectorAll('.main__creature')
let modalOverlay = document.querySelector('.modal__overlay')
let modalDialog = document.querySelector('.modal__dialog')
let modalExit = document.querySelector('.modal__close')
let save = document.querySelector('.btn.ok')
let cancel = document.querySelector('.btn.cancel')
let inputTitle = document.querySelector('.modal__input-title')
let inputDescription = document.querySelector('.modal__input-description')
let offer = document.querySelector('.main__offer')
let counterElement = document.querySelector('.main__counter')
let counterValue = document.querySelector('.main__quantity-num')
let menuComplete = document.querySelector('.main__complete')

// Обработчики событий
modalExit.addEventListener('click', modalClose)
modalOverlay.addEventListener('click', overlayExit)
save.addEventListener('click', modalClickSave)
cancel.addEventListener('click', modalClose)

// Счетчики задач
let counter = 0
let counterAll = 0

// Статус редактирования
let isEditing = false
let currentEditingTask = null

// LocalStorage
let tasksData = JSON.parse(localStorage.getItem('data')) || []

// Инициализация
init()

function init() {
    if (tasksData.length) {
        offer.style.display = 'none'
        counterElement.style.display = 'block'
    } else {
        offer.style.display = 'flex'
        counterElement.style.display = 'none'
    }
    counterAll = tasksData.length;
    counter = tasksData.filter(task => task.isDone).length
    counterValue.innerHTML = `${counter}/${counterAll}`

    checkCounter()
    isVisibleComplete()

    
}
// Создание задач из LocalStorage
tasksData.forEach(task => addTask(task, task.isDone))

modalBtn.forEach(creature => {
    creature.addEventListener('click', openModal)
})
offerBtn.forEach(creature => {
    creature.addEventListener('click', openModal)
})

function addTask(data, isComplete = false) {
    let { title, description, color, level, time, isDone = false } = data
    let newTask = document.createElement('div')
    newTask.className = 'main__task'
    newTask.innerHTML = `
        <div class="main__container">
            <div class="main__left">
                <span class="main__title">${title}</span>
                <span class="main__description">${description}</span>
                <span class="main__level">${level}</span>
            </div>
            <div class="main__right">
                <span class="main__time">${new Date(time).toLocaleString()}</span>
                <div class="main__btn">
                    ${isComplete ? '<button class="main__btn-return">return</button>' : '<button class="main__btn-complete">complete</button>'}
                    <button class="main__btn-edit">edit</button>
                    <button class="main__btn-delete">delete</button>
                </div>
            </div>
         </div>
     `
    let parent = isComplete ? document.querySelector('.main__complete') : document.querySelector('.main__task-container')
    parent.appendChild(newTask)

    let newTaskContainer = newTask.querySelector('.main__container')
    newTaskContainer.style.borderColor = color

    // Обработчик "delete"
    const deleteButton = newTask.querySelector('.main__btn-delete')
    deleteButton.addEventListener('click', () => 

    removeTask(newTask, time))
    // Обработчик "complete" и "return"
    if (isComplete) {
        const returnButton = newTask.querySelector('.main__btn-return')
        returnButton.addEventListener('click', () => 
		toggleCompleteTask(newTask, time, false))
    } else {
        const completeButton = newTask.querySelector('.main__btn-complete')
        completeButton.addEventListener('click', () => 
		toggleCompleteTask(newTask, time, true))
    }
    
    // Обработчик "edit"
    const editButton = newTask.querySelector('.main__btn-edit')
    editButton.addEventListener('click', () =>
	 editTask(data, newTask))
}

function removeTask(taskElement, taskTime) {
    taskElement.remove();
    tasksData = tasksData.filter(task => task.time !== taskTime)
    localStorage.setItem('data', JSON.stringify(tasksData))
    counterAll--
    counterValue.innerHTML = `${counter}/${counterAll}`
    checkCounter()
    init()
}

function toggleCompleteTask(taskElement, taskTime, isComplete) {
    let task = tasksData.find(task => task.time === taskTime)
    if (!task) return
    
    task.isDone = isComplete
    localStorage.setItem('data', JSON.stringify(tasksData))

    taskElement.remove()
    addTask(task, isComplete)
    
	if (isComplete) {
					counter++
				} else {
					counter--
				}
    counterValue.innerHTML = `${counter}/${counterAll}`
    checkCounter()
    isVisibleComplete()
    
}

function editTask(taskData, taskElement) {
    openModal()
    isEditing = true
    currentEditingTask = { taskData, taskElement }
    inputTitle.value = taskData.title
    inputDescription.value = taskData.description
    document.querySelector('.modal__input-color').value = taskData.color
    document.querySelector(`input[name="level"][value="${taskData.level}"]`).checked = true
}

function updateTask(taskTime, taskElement) {
    if (!warning()) return

    let updatedTask = {
        title: inputTitle.value,
        description: inputDescription.value,
        color: document.querySelector('.modal__input-color').value,
        level: document.querySelector('input[name="level"]:checked').value,
        time: taskTime,
        isDone: currentEditingTask.taskData.isDone
    }

    let taskIndex = tasksData.findIndex(task => task.time === taskTime)
    if (taskIndex !== -1) {
        tasksData[taskIndex] = updatedTask
    }
    localStorage.setItem('data', JSON.stringify(tasksData))

    taskElement.innerHTML = `
        <div class="main__container">
            <div class="main__left">
                <span class="main__title">${updatedTask.title}</span>
                <span class="main__description">${updatedTask.description}</span>
                <span class="main__level">${updatedTask.level}</span>
            </div>
            <div class="main__right">
                <span class="main__time">${new Date(updatedTask.time).toLocaleString()}</span>
                <div class="main__btn">
                    ${updatedTask.isDone ? '<button class="main__btn-return">return</button>' : '<button class="main__btn-complete">complete</button>'}
                    <button class="main__btn-edit">edit</button>
                    <button class="main__btn-delete">delete</button>
                </div>
            </div>
        </div>
    `

    let newTaskContainer = taskElement.querySelector('.main__container')
    newTaskContainer.style.borderColor = updatedTask.color;

    const deleteButton = taskElement.querySelector('.main__btn-delete')
    deleteButton.addEventListener('click', () => removeTask(taskElement, updatedTask.time))

    if (updatedTask.isDone) {
        const returnButton = taskElement.querySelector('.main__btn-return')
        returnButton.addEventListener('click', () => toggleCompleteTask(taskElement, updatedTask.time, false))
    } else {
        const completeButton = taskElement.querySelector('.main__btn-complete')
        completeButton.addEventListener('click', () => toggleCompleteTask(taskElement, updatedTask.time, true))
    }

    const editButton = taskElement.querySelector('.main__btn-edit')
    editButton.addEventListener('click', () => editTask(updatedTask, taskElement))

    isEditing = false
    currentEditingTask = null
    reset()
}

function isVisibleComplete() {
    menuComplete.style.display = counter <= 0 ? 'none' : 'block'
}

function checkCounter() {
    counterElement.style.display = counterAll <= 0 ? 'none' : 'block'
}

function inputChange() {
    toggleWarning()
}

function openModal() {
    toggleWarning()
    modalOverlay.style.display = 'block'
    modalDialog.style.display = 'block'
}

function toggleWarning() {
    inputTitle.classList.remove('warning')
    inputDescription.classList.remove('warning')
}

function modalClose(e) {
    e.preventDefault()
    reset()
    toggleWarning()
}

function overlayExit(e) {
    if (e.target === modalOverlay) {
        reset()
    }
}

function reset() {
    modalOverlay.style.display = 'none'
    modalDialog.style.display = 'none'
    inputTitle.value = ''
    inputDescription.value = ''
    document.querySelector('input[name="level"][value="Low"]').checked = true
    isEditing = false
    currentEditingTask = null
    // Перепривязка обработчика для кнопки "Сохранить"
    save.removeEventListener('click', modalClickSave)
    save.addEventListener('click', modalClickSave)
}

function modalClickSave(e) {
    e.preventDefault()
    if (isEditing) {
        if (currentEditingTask) {
            updateTask(currentEditingTask.taskData.time, currentEditingTask.taskElement)
        }
    } else {
        createTask()
    }
}

function warning() {
    inputTitle.value ? inputTitle.classList.remove('warning') : inputTitle.classList.add('warning')
    inputDescription.value ? inputDescription.classList.remove('warning') : inputDescription.classList.add('warning')
    return inputTitle.value && inputDescription.value
}

function createTask(e) {
    // e.preventDefault()
    if (!warning() || isEditing) return

    offer.style.display = 'none'

    let newTaskData = {
        title: inputTitle.value,
        description: inputDescription.value,
        color: document.querySelector('.modal__input-color').value,
        level: document.querySelector('input[name="level"]:checked').value,
        time: new Date().getTime(),
        isDone: false
    }

    tasksData.push(newTaskData)
    localStorage.setItem('data', JSON.stringify(tasksData))

    addTask(newTaskData)
    reset()

    counterAll++
    counterValue.innerHTML = `${counter}/${counterAll}`
    checkCounter()
    isVisibleComplete()
}