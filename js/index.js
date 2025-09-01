
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