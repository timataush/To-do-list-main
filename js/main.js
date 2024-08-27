// Важные объявления переменных
let openModalBtn = document.querySelectorAll('.header__creature')
let offerBtn = document.querySelectorAll('.main__creature')
let modalOverlay = document.querySelector('.modal__overlay')
let modalDialog = document.querySelector('.modal__dialog')
let modalExit = document.querySelector('.modal__close')
let modalSave = document.querySelector('.btn.ok')
let modalCancel = document.querySelector('.btn.cancel')
let inputTitle = document.querySelector('.modal__input-title')
let inputDescription = document.querySelector('.modal__input-description')
let offer = document.querySelector('.main__offer')
let counterElement = document.querySelector('.main__counter')
let counterValue = document.querySelector('.main__quantity-num')
let textComplete = document.querySelector('.main__text')
let mainComplete = document.querySelector('.main__complete')
let headerSetting = document.querySelector('.header__setting')
let subMenu = document.querySelector('.header__menu-wrap')
let sortUp = document.querySelector('.header__sort-up')
let sortDown = document.querySelector('.header__sort-down')

// Обработчики событий
modalExit.addEventListener('click', modalClose)
modalOverlay.addEventListener('click', overlayExit)
modalSave.addEventListener('click', modalClickSave)
modalCancel.addEventListener('click', modalClose)
headerSetting.addEventListener('click', toggleMenu)
document.addEventListener('click',subMenuExit )
sortUp.addEventListener('click', dateUp)
sortDown.addEventListener('click', dateDown)



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
    counterAll = tasksData.length
    counter = tasksData.filter(task => task.isDone).length

    checkCounter()
    isVisibleComplete()

}
// Создание задач из LocalStorage
tasksData.forEach(task => addTask(task, task.isDone))

openModalBtn.forEach(creature => {
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
                    ${isComplete ? '' : '<button class="main__btn-edit">edit</button>'}
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
    deleteButton.addEventListener('click', () => removeTask(newTask, time))

    // Обработчик "complete" и "return"
    if (isComplete) {
        const returnButton = newTask.querySelector('.main__btn-return')
        returnButton.addEventListener('click', () => toggleCompleteTask(newTask, time, false))
    } else {
        const completeButton = newTask.querySelector('.main__btn-complete')
        completeButton.addEventListener('click', () => toggleCompleteTask(newTask, time, true))
    }

    // Обработчик "edit"
    if (!isComplete) {
        const editButton = newTask.querySelector('.main__btn-edit')
        editButton.addEventListener('click', () => editTask(data, newTask))
    }
    
}


function removeTask(taskElement, taskTime) {
    taskElement.remove()
    tasksData = tasksData.filter(task => task.time !== taskTime)
    localStorage.setItem('data', JSON.stringify(tasksData))
    counterAll--
    checkCounter()
    isVisibleComplete()
}




function toggleCompleteTask(taskElement, taskTime, isComplete) {
    let task = tasksData.find(task => task.time === taskTime)
    if (!task) return

    task.isDone = isComplete
    localStorage.setItem('data', JSON.stringify(tasksData))

    taskElement.remove()

    let containerComplete = document.createElement('div')
    containerComplete.className = 'main__task'
    containerComplete.innerHTML = `
        <div class="main__container">
            <div class="main__left">
                <span class="main__title">${task.title}</span>
                <span class="main__description">${task.description}</span>
                <span class="main__level">${task.level}</span>
            </div>
            <div class="main__right">
                <span class="main__time">${new Date(task.time).toLocaleString()}</span>
                <div class="main__btn">
                    ${isComplete ? '<button class="main__btn-return">return</button>' : '<button class="main__btn-complete">complete</button>'}
                    ${!isComplete ? '<button class="main__btn-edit">edit</button>' : ''}
                    <button class="main__btn-delete">delete</button>
                </div>
            </div>
        </div>
    `

    let newTaskContainer = containerComplete.querySelector('.main__container')
    newTaskContainer.style.borderColor = task.color

    let parent = isComplete ? document.querySelector('.main__complete') : document.querySelector('.main__task-container')
    parent.appendChild(containerComplete)

    if (isComplete) {
        counter++
    } else {
        counter--
    }

    // // обработчики событий для кнопок
    const deleteButton = containerComplete.querySelector('.main__btn-delete')
    deleteButton.addEventListener('click', () => removeTask(containerComplete, task.time))

    if (isComplete) {
        const returnButton = containerComplete.querySelector('.main__btn-return')
        returnButton.addEventListener('click', () => toggleCompleteTask(containerComplete, task.time, false))
    } else {
        const completeButton = containerComplete.querySelector('.main__btn-complete')
        completeButton.addEventListener('click', () => toggleCompleteTask(containerComplete, task.time, true))

        const editButton = containerComplete.querySelector('.main__btn-edit')
        editButton.addEventListener('click', () => editTask(task, containerComplete))
    }

    // addButton (taskElement,containerComplete)
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

    // addButton(updatedTask,taskElement)

    // function addButton (updatedTask,taskElement,containerComplete){
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
    isVisibleComplete()
    checkCounter()
}

// function addButton (updatedTask,taskElement,containerComplete){
//     const deleteButton = containerComplete.querySelector('.main__btn-delete')&&taskElement.querySelector('.main__btn-delete')
//     deleteButton.addEventListener('click', () => removeTask(taskElement, updatedTask.time))

//     if (updatedTask.isDone) {
//         const returnButton = containerComplete.querySelector('.main__btn-return')&&taskElement.querySelector('.main__btn-return')
//         returnButton.addEventListener('click', () => toggleCompleteTask(taskElement, updatedTask.time, false))
//     } else {
//         const completeButton = containerComplete.querySelector('.main__btn-complete')&&taskElement.querySelector('.main__btn-complete')
//         completeButton.addEventListener('click', () => toggleCompleteTask(taskElement, updatedTask.time, true))
//     }

//     const editButton = containerComplete.querySelector('.main__btn-edit')&&taskElement.querySelector('.main__btn-edit')
//     editButton.addEventListener('click', () => editTask(updatedTask, taskElement))
//     checkCounter()
//     isVisibleComplete()
// }

function isVisibleComplete() {
    if (counter > 0) {
        mainComplete.style.display = 'block'
        textComplete.style.display = 'block'
        } else {
        mainComplete.style.display = 'none'
        textComplete.style.display = 'none'
    }
}


function checkCounter() {
    if (counterAll <= 0) {
        counterElement.style.display = 'none'
        offer.style.display = 'flex'
    } else {
        counterElement.style.display = 'block'
        offer.style.display = 'none'

    }
    counter = tasksData.filter(task => task.isDone).length

    counterValue.innerHTML = `${counter}/${counterAll}`

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
    inputTitle.value ? inputTitle.classList.remove('warning') 
    : inputTitle.classList.add('warning')
    inputDescription.value ? inputDescription.classList.remove('warning') 
    : inputDescription.classList.add('warning')
    return inputTitle.value && inputDescription.value
}

function createTask(e) {
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
    checkCounter()
    isVisibleComplete()
}

// тёмная тема
function darkMode() {
    const body = document.body
    let wasDarkMode = localStorage.getItem('darkMode') === 'true'
    localStorage.setItem('darkMode', !wasDarkMode)
    body.classList.toggle('dark-mode', !wasDarkMode)
    modalDialog.classList.toggle('dark-mode', !wasDarkMode)
    subMenu.classList.toggle('dark-mode', !wasDarkMode)
}
document.querySelector('.header__change-mode').addEventListener('click', darkMode)

function onLoad() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true'
    document.body.classList.toggle('dark-mode', isDarkMode)
    modalDialog.classList.toggle('dark-mode', isDarkMode)
    subMenu.classList.toggle('dark-mode', isDarkMode)
}
document.addEventListener('DOMContentLoaded', onLoad)

// меню
function toggleMenu(){
  subMenu.classList.toggle( "open-menu")
}

function subMenuExit(e) {
    if (!subMenu.contains(e.target) && !headerSetting.contains(e.target)) {
        subMenu.classList.remove("open-menu")
    }
}

// сортировка по дате создания
function dateUp(isComplete){
    tasksData.sort((a, b) => b.time - a.time)
    updateSortTasks()
    if (isComplete){
    tasksData.sort((a, b) => b.time - a.time)
    updateSortTasks()

    }
    console.log(tasksData)
}
function dateDown(task) {
    tasksData.sort((a, b) => a.time - b.time)
    updateSortTasks()
    if (task.isDone){
        tasksData.sort((a, b) => a.time - b.time)
        updateSortTasks()

        }
}


function updateSortTasks() {
    let taskContainer = document.querySelector('.main__task-container')
    let completedContainer = document.querySelector('.main__complete')
    // Очистка контейнеров
    taskContainer.innerHTML = ''
    completedContainer.innerHTML = ''

    // Повторное добавление задач на страницу
    tasksData.forEach(task => addTask(task, task.isDone))
    checkCounter()
    isVisibleComplete()

}

