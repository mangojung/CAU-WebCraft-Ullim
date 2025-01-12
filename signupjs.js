window.onload = function () {
    const join = document.join;
    const input = document.querySelectorAll('.check');
    const errorId = ["idError", "pwError", "pwCheckError", "nameError", "phoneNumError", "emailError"];
    const error = document.querySelectorAll('.list > span');

    // 오류 메시지 초기화 함수
    function innerReset() {
        error.forEach(err => (err.innerHTML = ""));
    }

    // 유효성 검사 함수
    function validate(field, regex, errorIndex, errorMessage) {
        if (!regex.test(field.value)) {
            document.getElementById(errorId[errorIndex]).innerHTML = errorMessage;
        }
    }

    // 초기화
    innerReset();

    // [ID 입력문자 유효성 검사]
    join.id.addEventListener("input", function () {
        innerReset();
        const idRegex = /^[a-zA-Z0-9-_]{5,20}$/;
        validate(input[0], idRegex, 0, "5~20자의 영문 소대문자, 숫자와 특수기호(_),(-)만 사용 가능합니다.");
    });

    // [PW 입력문자 유효성 검사]
    join.pw.addEventListener("input", function () {
        innerReset();
        const pwRegex = /^[a-zA-Z0-9~!@#$%^&*()_-]{10,20}$/;
        validate(input[1], pwRegex, 1, "10~20자의 영문 소대문자, 숫자와 특수기호 '~!@#$%^&*()_-'만 사용 가능합니다.");
    });

    // [PW 재확인 입력 초기화]
    join.pwCheck.addEventListener("input", function () {
        innerReset();
    });

    // [휴대폰번호 입력 유효성 검사]
    join.phoneNum.addEventListener("input", function () {
        innerReset();
        const phoneRegex = /^01[016789]{1}[0-9]{8}$/;
        validate(input[4], phoneRegex, 4, "올바른 형식이 아닙니다. 다시 확인해주세요.");
    });

    // [이메일 입력 유효성 검사]
    join.email.addEventListener("input", function () {
        innerReset();
        const emailRegex = /^[0-9a-zA-Z-_.]+$/;
        validate(input[5], emailRegex, 5, "올바른 형식이 아닙니다. 영문, 숫자, (-)(_)(.) 입력만 가능합니다.");
    });

    // [폼 제출 시 최종 유효성 검사]
    join.addEventListener("submit", function (e) {
        innerReset();

        const idRegex = /^[a-zA-Z0-9-_]{5,20}$/;
        const pwRegex = /^[a-zA-Z0-9~!@#$%^&*()_-]{10,20}$/;
        const phoneRegex = /^01[016789]{1}[0-9]{8}$/;
        const emailRegex = /^[0-9a-zA-Z-_.]+$/;

        if (!idRegex.test(input[0].value)) {
            document.getElementById(errorId[0]).innerHTML = "아이디가 유효하지 않습니다.";
            e.preventDefault();
        }
        if (!pwRegex.test(input[1].value)) {
            document.getElementById(errorId[1]).innerHTML = "비밀번호가 유효하지 않습니다.";
            e.preventDefault();
        }
        if (input[1].value !== input[2].value) {
            document.getElementById(errorId[2]).innerHTML = "비밀번호가 일치하지 않습니다.";
            e.preventDefault();
        }
        if (!phoneRegex.test(input[4].value)) {
            document.getElementById(errorId[4]).innerHTML = "휴대폰 번호가 유효하지 않습니다.";
            e.preventDefault();
        }
        if (!emailRegex.test(input[5].value)) {
            document.getElementById(errorId[5]).innerHTML = "이메일이 유효하지 않습니다.";
            e.preventDefault();
        }
    });
};
