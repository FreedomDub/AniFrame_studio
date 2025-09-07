// Основной JavaScript код для сайта
document.addEventListener('DOMContentLoaded', function() {
    // Загрузка данных
    loadData();
    
    // Инициализация навигации
    initNavigation();
    
    // Инициализация модальных окон
    initModals();
    
    // Инициализация табов
    initTabs();
    
    // Проверка аутентификации
    checkAuth();
});

// Загрузка данных
async function loadData() {
    try {
        // Попытка загрузить данные из Firebase
        if (typeof loadFirebaseData === 'function') {
            await loadFirebaseData();
        } else {
            // Загрузка из локального JSON
            const response = await fetch('data/data.json');
            const data = await response.json();
            initializeSite(data);
        }
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        // Показать сообщение об ошибке
        showError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    }
}

// Инициализация сайта с данными
function initializeSite(data) {
    // Заполнение контактной информации
    document.getElementById('contact-address').textContent = data.contacts.address;
    document.getElementById('contact-phone').textContent = data.contacts.phone;
    document.getElementById('contact-email').textContent = data.contacts.email;
    document.getElementById('contact-schedule').textContent = data.contacts.schedule;
    
    // Загрузка проектов
    loadProjects(data.projects);
    
    // Загрузка команды
    loadTeam(data.team);
}

// Загрузка проектов
function loadProjects(projects) {
    const projectsContainer = document.getElementById('projects-container');
    projectsContainer.innerHTML = '';
    
    projects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.className = 'project-card';
        projectCard.innerHTML = `
            <div class="project-image">
                <i class="fas fa-film"></i>
            </div>
            <div class="project-content">
                <h3>${project.title}</h3>
                <p>${project.description}</p>
                <button class="btn btn-primary view-project" data-project="${project.id}">Подробнее</button>
            </div>
        `;
        projectsContainer.appendChild(projectCard);
    });
    
    // Добавление обработчиков событий для кнопок проектов
    document.querySelectorAll('.view-project').forEach(button => {
        button.addEventListener('click', function() {
            const projectId = this.getAttribute('data-project');
            showProject(projectId);
        });
    });
}

// Загрузка команды
function loadTeam(team) {
    // Загрузка руководства
    loadTeamCategory('management', team.owners.concat(team.co_owners));
    
    // Загрузка актрис
    loadTeamCategory('actresses', team.actresses);
    
    // Загрузка актеров
    loadTeamCategory('actors', team.actors);
    
    // Загрузка редакторов
    loadTeamCategory('editors', team.editors);
}

// Загрузка категории команды
function loadTeamCategory(categoryId, members) {
    const container = document.getElementById(`${categoryId}-team`);
    if (!container) return;
    
    container.innerHTML = '';
    
    members.forEach(member => {
        const memberElement = document.createElement('div');
        memberElement.className = 'team-member';
        memberElement.innerHTML = `
            <span>${member.name} ${member.role ? `<span class="user-role">${member.role}</span>` : ''}</span>
            <div class="member-actions admin-only" style="display: none;">
                <button class="btn btn-small btn-secondary"><i class="fas fa-edit"></i></button>
                <button class="btn btn-small btn-secondary"><i class="fas fa-trash"></i></button>
            </div>
        `;
        container.appendChild(memberElement);
    });
}

// Инициализация навигации
function initNavigation() {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('data-target');
            showSection(target);
        });
    });
    
    // Кнопка "Назад к проектам"
    document.getElementById('back-to-projects').addEventListener('click', function() {
        showSection('projects');
    });
}

// Инициализация модальных окон
function initModals() {
    // Здесь будет код для модальных окон
}

// Инициализация табов
function initTabs() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Убираем активный класс у всех табов и контента
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс к выбранному табу и контенту
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Показать секцию
function showSection(sectionId) {
    // Скрываем все секции
    document.querySelectorAll('section').forEach(section => {
        section.style.display = 'none';
    });
    
    // Показываем нужную секцию
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Особый случай для деталей проекта
    if (sectionId !== 'project-detail') {
        document.getElementById('project-detail').style.display = 'none';
    }
}

// Показать проект
function showProject(projectId) {
    // Здесь будет код для показа деталей проекта
    showSection('project-detail');
}

// Проверка аутентификации
function checkAuth() {
    // Здесь будет код проверки аутентификации
}

// Показать ошибку
function showError(message) {
    // Создаем элемент для ошибки
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #ff5252;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
    `;
    errorElement.textContent = message;
    
    // Добавляем на страницу
    document.body.appendChild(errorElement);
    
    // Удаляем через 5 секунд
    setTimeout(() => {
        errorElement.remove();
    }, 5000);
}

// Показать успех
function showSuccess(message) {
    // Создаем элемент для успеха
    const successElement = document.createElement('div');
    successElement.className = 'success-message';
    successElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4caf50;
        color: white;
        padding: 15px;
        border-radius: 5px;
        z-index: 10000;
        max-width: 300px;
    `;
    successElement.textContent = message;
    
    // Добавляем на страницу
    document.body.appendChild(successElement);
    
    // Удаляем через 5 секунд
    setTimeout(() => {
        successElement.remove();
    }, 5000);
}
