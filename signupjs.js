window.onload = function () {
    const join = document.getElementById("signup-form");
    const input = document.querySelectorAll('#signup-form input');
    const errorId = ["idError", "pwError", "pwCheckError", "nameError", "phoneNumError", "emailError"];

    // 오류 메시지 초기화 함수
    function resetError(index) {
        if (index !== undefined) {
            document.getElementById(errorId[index]).innerHTML = "";
        } else {
            errorId.forEach(errId => (document.getElementById(errId).innerHTML = ""));
        }
    }

    // 유효성 검사 함수
    function validate(field, regex, errorIndex, errorMessage) {
        if (!regex.test(field.value)) {
            document.getElementById(errorId[errorIndex]).innerHTML = errorMessage;
            return false;
        }
        return true;
    }

    // [폼 제출 시 최종 유효성 검사]
    join.addEventListener("submit", function (e) {
        resetError();

        const idRegex = /^[a-zA-Z0-9-_]{5,20}$/;
        const pwRegex = /^[a-zA-Z0-9~!@#$%^&*()_-]{10,20}$/;
        const phoneRegex = /^01[016789]{1}[0-9]{8}$/;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        let isValid = true;

        if (!validate(input[0], idRegex, 0, "아이디가 유효하지 않습니다.")) isValid = false;
        if (!validate(input[1], pwRegex, 1, "비밀번호가 유효하지 않습니다.")) isValid = false;
        if (input[1].value !== input[2].value) {
            document.getElementById(errorId[2]).innerHTML = "비밀번호가 일치하지 않습니다.";
            isValid = false;
        }
        if (!validate(input[4], phoneRegex, 4, "휴대폰 번호가 유효하지 않습니다.")) isValid = false;
        if (!validate(input[5], emailRegex, 5, "이메일이 유효하지 않습니다.")) isValid = false;

        if (!isValid) e.preventDefault();
    });
};
