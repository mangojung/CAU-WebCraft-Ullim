window.onload = function () {
    const form = document.getElementById("login-form");
    const username = document.getElementById("username");
    const password = document.getElementById("password");

    form.addEventListener("submit", function (e) {
        // 간단한 클라이언트 측 유효성 검사
        if (username.value.trim() === "") {
            document.getElementById("usernameError").textContent = "아이디를 입력해주세요.";
            e.preventDefault();
        } else {
            document.getElementById("usernameError").textContent = "";
        }

        if (password.value.trim() === "") {
            document.getElementById("passwordError").textContent = "비밀번호를 입력해주세요.";
            e.preventDefault();
        } else {
            document.getElementById("passwordError").textContent = "";
        }
    });
};
