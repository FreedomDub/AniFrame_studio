// Конфигурация и функции для Firebase
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project-id.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project-id.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
};

// Инициализация Firebase
firebase.initializeApp(firebaseConfig);

// Инициализация сервисов
const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();

// Загрузка данных из Firebase
async function loadFirebaseData() {
    try {
        // Загрузка данных проектов
        const projectsSnapshot = await db.collection('projects').get();
        const projects = [];
        projectsSnapshot.forEach(doc => {
            projects.push({ id: doc.id, ...doc.data() });
        });
        
        // Загрузка данных команды
        const teamSnapshot = await db.collection('team').get();
        const team = {};
        teamSnapshot.forEach(doc => {
            const data = doc.data();
            const category = data.category;
            if (!team[category]) {
                team[category] = [];
            }
            team[category].push({ id: doc.id, ...data });
        });
        
        // Загрузка контактов
        const contactsDoc = await db.collection('settings').doc('contacts').get();
        const contacts = contactsDoc.exists ? contactsDoc.data() : {};
        
        // Инициализация сайта с данными
        initializeSite({
            projects,
            team,
            contacts
        });
    } catch (error) {
        console.error('Ошибка загрузки данных из Firebase:', error);
        throw error;
    }
}

// Аутентификация через Firebase
async function firebaseLogin(email, password) {
    try {
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Получаем дополнительные данные пользователя
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        // Сохраняем текущего пользователя
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.uid,
            email: user.email,
            name: userData?.name || user.email,
            role: userData?.role || 'viewer'
        }));
        
        // Обновляем UI
        updateUI();
        
        // Закрываем модальное окно
        document.getElementById('loginModal').style.display = 'none';
        
        showSuccess('Вход выполнен успешно!');
    } catch (error) {
        console.error('Ошибка входа:', error);
        showError('Ошибка входа: ' + error.message);
    }
}

// Регистрация через Firebase
async function firebaseRegister(name, email, password, role) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Сохраняем дополнительные данные пользователя
        await db.collection('users').doc(user.uid).set({
            name,
            email,
            role,
            registrationDate: new Date().toISOString()
        });
        
        // Сохраняем текущего пользователя
        localStorage.setItem('currentUser', JSON.stringify({
            id: user.uid,
            email,
            name,
            role
        }));
        
        // Обновляем UI
        updateUI();
        
        // Закрываем модальное окно
        document.getElementById('registerModal').style.display = 'none';
        
        showSuccess('Регистрация выполнена успешно!');
    } catch (error) {
        console.error('Ошибка регистрации:', error);
        showError('Ошибка регистрации: ' + error.message);
    }
}

// Выход через Firebase
async function firebaseLogout() {
    try {
        await auth.signOut();
        localStorage.removeItem('currentUser');
        updateUI();
        showSuccess('Выход выполнен успешно!');
    } catch (error) {
        console.error('Ошибка выхода:', error);
        showError('Ошибка выхода: ' + error.message);
    }
}

// Проверка аутентификации через Firebase
function firebaseCheckAuth() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // Пользователь авторизован
            db.collection('users').doc(user.uid).get().then(doc => {
                const userData = doc.data();
                localStorage.setItem('currentUser', JSON.stringify({
                    id: user.uid,
                    email: user.email,
                    name: userData?.name || user.email,
                    role: userData?.role || 'viewer'
                }));
                updateUI();
            });
        } else {
            // Пользователь не авторизован
            localStorage.removeItem('currentUser');
            updateUI();
        }
    });
}

// Загрузка видео в Firebase Storage
async function firebaseUploadVideo(file) {
    try {
        const storageRef = storage.ref();
        const videoRef = storageRef.child(`videos/${Date.now()}_${file.name}`);
        const snapshot = await videoRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        showSuccess(`Видео успешно загружено! URL: ${downloadURL}`);
        return downloadURL;
    } catch (error) {
        console.error('Ошибка загрузки видео:', error);
        showError('Ошибка загрузки видео: ' + error.message);
        throw error;
    }
}

// Добавление проекта в Firebase
async function firebaseAddProject(title, description, category) {
    try {
        await db.collection('projects').add({
            title,
            description,
            category,
            year: new Date().getFullYear(),
            team: [],
            comments: [],
            createdAt: new Date().toISOString()
        });
        
        // Очищаем поля
        document.getElementById('project-title-input').value = '';
        document.getElementById('project-description-input').value = '';
        document.getElementById('project-category-input').value = '';
        
        showSuccess('Проект успешно добавлен!');
    } catch (error) {
        console.error('Ошибка добавления проекта:', error);
        showError('Ошибка добавления проекта: ' + error.message);
        throw error;
    }
}

// Добавление участника команды в Firebase
async function firebaseAddTeamMember(name, role) {
    try {
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
        
        await db.collection('team').add({
            name,
            role,
            category,
            createdAt: new Date().toISOString()
        });
        
        // Очищаем поле
        document.getElementById('member-name').value = '';
        
        showSuccess('Участник команды успешно добавлен!');
    } catch (error) {
        console.error('Ошибка добавления участника:', error);
        showError('Ошибка добавления участника: ' + error.message);
        throw error;
    }
}

// Добавление комментария в Firebase
async function firebaseAddComment(text, user) {
    try {
        const projectId = document.getElementById('project-detail').getAttribute('data-project-id');
        
        await db.collection('projects').doc(projectId).collection('comments').add({
            user_id: user.id,
            user_name: user.name,
            text,
            date: new Date().toISOString(),
            rating: 5
        });
        
        // Очищаем поле
        document.getElementById('comment-text').value = '';
        
        showSuccess('Комментарий успешно добавлен!');
    } catch (error) {
        console.error('Ошибка добавления комментария:', error);
        showError('Ошибка добавления комментария: ' + error.message);
        throw error;
    }
                  }
