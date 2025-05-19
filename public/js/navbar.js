document.addEventListener("DOMContentLoaded", function () {
    // 모든 드롭다운 요소 선택
    const dropdowns = document.querySelectorAll(".dropdown");

    // 🚀 페이지 로드 시 모든 드롭다운 메뉴 숨기기
    document.querySelectorAll(".dropdown__menu").forEach(menu => {
        menu.style.display = "none";
    });

    dropdowns.forEach(dropdown => {
        const menu = dropdown.querySelector(".dropdown__menu");

        // 마우스 호버 시 보이게 함
        dropdown.addEventListener("mouseenter", function () {
            menu.style.display = "block";
        });

        // 마우스가 떠나면 숨김
        dropdown.addEventListener("mouseleave", function () {
            menu.style.display = "none";
        });

        // 클릭하면 열고 닫기 (토글)
        dropdown.addEventListener("click", function (event) {
            event.stopPropagation(); // 이벤트 버블링 방지
            closeAllDropdowns(); // 다른 드롭다운 닫기
            menu.style.display = (menu.style.display === "block") ? "none" : "block";
        });
    });

    // 바깥 클릭 시 모든 드롭다운 닫기
    document.addEventListener("click", function () {
        closeAllDropdowns();
    });

    function closeAllDropdowns() {
        document.querySelectorAll(".dropdown__menu").forEach(menu => {
            menu.style.display = "none";
        });
    }
});


