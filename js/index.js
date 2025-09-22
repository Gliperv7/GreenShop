
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




function openModal(id) {
    document.getElementById(id).classList.add("open");
}


function closeModal(id) {
    document.getElementById(id).classList.remove("open");
}


document.getElementById("modal-login--open").addEventListener("click", function() {
    openModal("modal-login");
});
document.getElementById("close--modal-btn-login").addEventListener("click", function() {
    closeModal("modal-login");
});


document.getElementById("close--modal-btn-Register").addEventListener("click", function() {
    closeModal("modal-Register");
});


document.querySelector("#modal-login .modal__box-login-form__text:last-child").addEventListener("click", function (e) {
    e.preventDefault();
    closeModal("modal-login");
    openModal("modal-Register");
});


document.querySelector("#modal-Register .modal__box-login-form__text:first-child").addEventListener("click", function (e) {
    e.preventDefault();
    closeModal("modal-Register");
    openModal("modal-login");
});


window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        closeModal("modal-login");
        closeModal("modal-Register");
    }
});


document.querySelector("#modal-login .modal__box-login").addEventListener('click', e => e._isClickWithInModal = true);
document.getElementById("modal-login").addEventListener('click', e => {
    if (e._isClickWithInModal) return;
    closeModal("modal-login");
});


document.querySelector("#modal-Register .modal__box-login").addEventListener('click', e => e._isClickWithInModal = true);
document.getElementById("modal-Register").addEventListener('click', e => {
    if (e._isClickWithInModal) return;
    closeModal("modal-Register");
});