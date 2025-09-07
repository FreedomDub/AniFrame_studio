// Аутентификация пользователей
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация форм аутентификации
    initAuthForms();
});

// Инициализация форм аутентификации
function initAuthForms() {
    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            loginUser(email, password);
        });
    }
    
    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('regName').value;
            const email = document.getElementById('regEmail').value;
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('regConfirmPassword').value;
            const role = document.getElementById('userRole').value;
            
            if (password !== confirmPassword) {
                showError('Пароли не совпадают');
                return;
            }
            
            registerUser(name, email, password, role);
        });
    }
    
    // Кнопка выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logoutUser);
    }
}

// Вход пользователя
async function loginUser(email, password) {
    try {
        // Если используется Firebase
        if (typeof firebaseLogin === 'function') {
            await firebaseLogin(email, password);
        } else {
            // Локальная аутентификация (для демонстрации)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                // Сохраняем текущего пользователя
                localStorage.setItem('currentUser', JSON.stringify(user));
                
                // Обновляем UI
                updateUI();
                
                // Закрываем модальное окно
                document.getElementById('loginModal').style.display = 'none';
                
                showSuccess('Вход выполнен успешно!');
            } else {
                showError('Неверный email или пароль');
            }
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        showError('Ошибка входа: ' + error.message);
    }
}

// Регистрация пользователя
async function registerUser(name, email, password, role) {
    try {
        // Если используется Firebase
        if (typeof firebaseRegister === 'function') {
            await firebaseRegister(name, email, password, role);
        } else {
            // Локальная регистрация (для демонстрации)
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Проверяем, существует ли пользователь
            if (users.some(u => u.email === email)) {
                showError('Пользователь с таким email уже существует');
                return;
            }
            
            // Добавляем пользователя
            const newUser = {
                id: Date.now(),
                name,
                email,
                password, // В реальном приложении пароль должен быть хеширован
                role,
                registrationDate: new Date().toISOString()
            };
            
            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));
            
            // Автоматически входим
            localStorage.setItem('currentUser', JSON.stringify(newUser));
            
            // Обновляем UI
            updateUI();
            
            // Закрываем модальное окно
            document.getElementById('registerModal').style.display = 'none';
            
            showSuccess('Регистрация выполнена успешно!');
        }
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showError('Ошибка регистрации: ' + error.message);
    }
}

// Выход пользователя
function logoutUser() {
    // Если используется Firebase
    if (typeof firebaseLogout === 'function') {
        firebaseLogout();
    } else {
        // Локальный выход
        localStorage.removeItem('currentUser');
    }
    
    // Обновляем UI
    updateUI();
    
    showSuccess('Выход выполнен успешно!');
}

// Обновление UI в зависимости от статуса аутентификации
function updateUI() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminElements = document.querySelectorAll('.admin-only');
    
    if (currentUser) {
        // Пользователь авторизован
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        
        // Показываем/скрываем элементы для администратора
        if (currentUser.role === 'admin') {
            adminElements.forEach(el => {
                el.style.display = 'block';
            });
            if (document.getElementById('admin-section')) {
                document.getElementById('admin-section').style.display = 'block';
            }
        } else {
            adminElements.forEach(el => {
                el.style.display = 'none';
            });
            if (document.getElementById('admin-section')) {
                document.getElementById('admin-section').style.display = 'none';
            }
        }
    } else {
        // Пользователь не авторизован
        if (loginBtn) loginBtn.style.display = 'block';
        if (registerBtn) registerBtn.style.display = 'block';
        if (logoutBtn) logoutBtn.style.display = 'none';
        
        // Скрываем элементы для администратора
        adminElements.forEach(el => {
            el.style.display = 'none';
        });
        if (document.getElementById('admin-section')) {
            document.getElementById('admin-section').style.display = 'none';
        }
    }
}

// Проверка аутентификации при загрузке страницы
function checkAuth() {
    updateUI();
    
    // Если используется Firebase
    if (typeof firebaseCheckAuth === 'function') {
        firebaseCheckAuth();
    }
}
