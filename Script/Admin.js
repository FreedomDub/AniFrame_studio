// Функции для админ-панели
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация админ-панели
    initAdminPanel();
});

// Инициализация админ-панели
function initAdminPanel() {
    // Кнопка загрузки видео
    const uploadVideoBtn = document.getElementById('upload-video-btn');
    if (uploadVideoBtn) {
        uploadVideoBtn.addEventListener('click', function() {
            const fileInput = document.getElementById('videoUpload');
            if (fileInput.files.length > 0) {
                uploadVideo(fileInput.files[0]);
            } else {
                showError('Выберите файл для загрузки');
            }
        });
    }
    
    // Кнопка добавления проекта
    const addProjectBtn = document.getElementById('add-project-btn');
    if (addProjectBtn) {
        addProjectBtn.addEventListener('click', function() {
            const title = document.getElementById('project-title-input').value;
            const description = document.getElementById('project-description-input').value;
            const category = document.getElementById('project-category-input').value;
            
            if (!title || !description || !category) {
                showError('Заполните все поля');
                return;
            }
            
            addProject(title, description, category);
        });
    }
    
    // Кнопка добавления участника команды
    const addMemberBtn = document.getElementById('add-member-btn');
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', function() {
            const name = document.getElementById('member-name').value;
            const role = document.getElementById('member-role').value;
            
            if (!name) {
                showError('Введите имя участника');
                return;
            }
            
            addTeamMember(name, role);
        });
    }
    
    // Кнопка добавления комментария
    const addCommentBtn = document.getElementById('add-comment-btn');
    if (addCommentBtn) {
        addCommentBtn.addEventListener('click', function() {
            const commentText = document.getElementById('comment-text').value;
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
            
            if (!currentUser) {
                showError('Для добавления комментария необходимо авторизоваться');
                return;
            }
            
            if (!commentText) {
                showError('Введите текст комментария');
                return;
            }
            
            addComment(commentText, currentUser);
        });
    }
}

// Загрузка видео
async function uploadVideo(file) {
    try {
        // Если используется Firebase Storage
        if (typeof firebaseUploadVideo === 'function') {
            await firebaseUploadVideo(file);
        } else {
            // Локальная загрузка (для демонстрации)
            showSuccess(`Видео "${file.name}" успешно загружено (локально)`);
        }
    } catch (error) {
        console.error('Ошибка загрузки видео:', error);
        showError('Ошибка загрузки видео: ' + error.message);
    }
}

// Добавление проекта
async function addProject(title, description, category) {
    try {
        // Если используется Firebase
        if (typeof firebaseAddProject === 'function') {
            await firebaseAddProject(title, description, category);
        } else {
            // Локальное добавление (для демонстрации)
            const projects = JSON.parse(localStorage.getItem('projects') || '[]');
            
            const newProject = {
                id: Date.now(),
                title,
                description,
                detailed_description: description,
                category,
                year: new Date().getFullYear(),
                team: [],
                comments: []
            };
            
            projects.push(newProject);
            localStorage.setItem('projects', JSON.stringify(projects));
            
            // Очищаем поля
            document.getElementById('project-title-input').value = '';
            document.getElementById('project-description-input').value = '';
            document.getElementById('project-category-input').value = '';
            
            showSuccess('Проект успешно добавлен!');
        }
    } catch (error) {
        console.error('Ошибка добавления проекта:', error);
        showError('Ошибка добавления проекта: ' + error.message);
    }
}

// Добавление участника команды
async function addTeamMember(name, role) {
    try {
        // Если используется Firebase
        if (typeof firebaseAddTeamMember === 'function') {
            await firebaseAddTeamMember(name, role);
        } else {
            // Локальное добавление (для демонстрации)
            const team = JSON.parse(localStorage.getItem('team') || '{}');
            
            // Определяем категорию участника
            let category;
            switch(role) {
                case 'owner':
                    category = 'owners';
                    break;
                case 'co-owner':
                    category = 'co_owners';
                    break;
                case 'actress':
                    category = 'actresses';
                    break;
                case 'actor':
                    category = 'actors';
                    break;
                case 'editor':
                    category = 'editors';
                    break;
                case 'translator':
                    category = 'translators';
                    break;
                case 'sound':
                    category = 'sound_engineers';
                    break;
                case 'video':
                    category = 'editors_video';
                    break;
                default:
                    category = 'actors';
            }
            
            // Инициализируем категорию, если её нет
            if (!team[category]) {
                team[category] = [];
            }
            
            // Добавляем участника
            const newMember = {
                id: Date.now(),
                name,
                role: role
            };
            
            team[category].push(newMember);
            localStorage.setItem('team', JSON.stringify(team));
            
            // Очищаем поле
            document.getElementById('member-name').value = '';
            
            showSuccess('Участник команды успешно добавлен!');
        }
    } catch (error) {
        console.error('Ошибка добавления участника:', error);
        showError('Ошибка добавления участника: ' + error.message);
    }
}

// Добавление комментария
async function addComment(text, user) {
    try {
        // Если используется Firebase
        if (typeof firebaseAddComment === 'function') {
            await firebaseAddComment(text, user);
        } else {
            // Локальное добавление (для демонстрации)
            const projectId = document.getElementById('project-detail').getAttribute('data-project-id');
            const projects = JSON.parse(localStorage.getItem('projects') || '[]');
            const project = projects.find(p => p.id == projectId);
            
            if (project) {
                if (!project.comments) {
                    project.comments = [];
                }
                
                const newComment = {
                    id: Date.now(),
                    user_id: user.id,
                    user_name: user.name,
                    date: new Date().toISOString().split('T')[0],
                    text: text,
                    rating: 5
                };
                
                project.comments.push(newComment);
                localStorage.setItem('projects', JSON.stringify(projects));
                
                // Очищаем поле
                document.getElementById('comment-text').value = '';
                
                // Обновляем комментарии
                loadComments(project.comments);
                
                showSuccess('Комментарий успешно добавлен!');
            } else {
                showError('Проект не найден');
            }
        }
    } catch (error) {
        console.error('Ошибка добавления комментария:', error);
        showError('Ошибка добавления комментария: ' + error.message);
    }
}

// Загрузка комментариев
function loadComments(comments) {
    const commentsContainer = document.getElementById('project-comments');
    if (!commentsContainer) return;
    
    commentsContainer.innerHTML = '';
    
    if (comments.length === 0) {
        commentsContainer.innerHTML = '<p>Пока нет комментариев. Будьте первым!</p>';
        return;
    }
    
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.innerHTML = `
            <div class="comment-header">
                <span>${comment.user_name}</span>
                <span>${comment.date}</span>
            </div>
            <p>${comment.text}</p>
        `;
        commentsContainer.appendChild(commentElement);
    });
}
