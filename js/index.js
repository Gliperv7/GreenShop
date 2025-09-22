
document.getElementById("open-modal-btn").addEventListener("click", function() {
    document.getElementById("my-modal").classList.add("open")
})


document.getElementById("close-my-modal-btn").addEventListener("click", function() {
    document.getElementById("my-modal").classList.remove("open")
})


window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        document.getElementById("my-modal").classList.remove("open")
    }
});


document.querySelector("#my-modal .modal__box").addEventListener('click', event => {
    event._isClickWithInModal = true;
});
document.getElementById("my-modal").addEventListener('click', event => {
    if (event._isClickWithInModal) return;
    event.currentTarget.classList.remove('open');
});



// Функція відкриття модалки
function openModal(id) {
    document.getElementById(id).classList.add("open");
}

// Функція закриття модалки
function closeModal(id) {
    document.getElementById(id).classList.remove("open");
}

// Логін
document.getElementById("modal-login--open").addEventListener("click", function() {
    openModal("modal-login");
});
document.getElementById("close--modal-btn-login").addEventListener("click", function() {
    closeModal("modal-login");
});

// Реєстр
document.getElementById("close--modal-btn-Register").addEventListener("click", function() {
    closeModal("modal-Register");
});

// Переключалка з Login → Register
document.querySelector("#modal-login .modal__box-login-form__text:last-child").addEventListener("click", function (e) {
    e.preventDefault();
    closeModal("modal-login");
    openModal("modal-Register");
});

// Переключалка з Register → Login
document.querySelector("#modal-Register .modal__box-login-form__text:first-child").addEventListener("click", function (e) {
    e.preventDefault();
    closeModal("modal-Register");
    openModal("modal-login");
});

// Закриття по Esc
window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        closeModal("modal-login");
        closeModal("modal-Register");
    }
});

// Клік поза вікном закриває Login
document.querySelector("#modal-login .modal__box-login").addEventListener('click', e => e._isClickWithInModal = true);
document.getElementById("modal-login").addEventListener('click', e => {
    if (e._isClickWithInModal) return;
    closeModal("modal-login");
});

// Клік поза вікном закриває Register
document.querySelector("#modal-Register .modal__box-login").addEventListener('click', e => e._isClickWithInModal = true);
document.getElementById("modal-Register").addEventListener('click', e => {
    if (e._isClickWithInModal) return;
    closeModal("modal-Register");
});