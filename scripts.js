document.getElementById("contact-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const message = document.getElementById("message").value;

    alert(`감사합니다, ${name}! 메시지가 전송되었습니다: "${message}"`);
});
