document.addEventListener("DOMContentLoaded", function () {
    // ============================ 드롭다운 메뉴 기능 ============================ 
    const dropdowns = document.querySelectorAll(".dropdown");

    //페이지가 로드될 때 모든 드롭다운 메뉴 숨기기
    dropdowns.forEach(dropdown => {
        const dropdownMenu = dropdown.querySelector(".dropdown__menu");
        dropdownMenu.style.display = "none"; //강제 초기화
    });

    //마우스를 올리면 드롭다운 표시
    dropdowns.forEach(dropdown => {
        const dropdownMenu = dropdown.querySelector(".dropdown__menu");

        dropdown.addEventListener("mouseenter", function () {
            dropdownMenu.style.display = "block";
        });

        dropdown.addEventListener("mouseleave", function () {
            dropdownMenu.style.display = "none";
        });
    });

    // ============================ 슬라이드 기능 추가 ============================ 
    const slider = document.querySelector(".slider__img");
    const slides = document.querySelectorAll(".slider__img img");
    const dots = document.querySelectorAll(".slider__dot a");
    const prevBtn = document.querySelector(".left");
    const nextBtn = document.querySelector(".right");

    let index = 0;
    const totalSlides = slides.length;

    //슬라이드 이동 함수
    function moveSlide(newIndex) {
        if (newIndex < 0) {
            newIndex = totalSlides - 1; //마지막 이미지로 이동
        } else if (newIndex >= totalSlides) {
            newIndex = 0; //첫 번째 이미지로 이동
        }
        index = newIndex;
        slider.style.transform = `translateX(${-index * 100}%)`;

        //도트 활성화 변경
        dots.forEach(dot => dot.classList.remove("active"));
        dots[index].classList.add("active");
    }

    //이전 버튼 클릭 시
    prevBtn.addEventListener("click", function (e) {
        e.preventDefault();
        moveSlide(index - 1);
    });

    //다음 버튼 클릭 시
    nextBtn.addEventListener("click", function (e) {
        e.preventDefault();
        moveSlide(index + 1);
    });

    //도트 클릭 시 해당 슬라이드로 이동
    dots.forEach((dot, i) => {
        dot.addEventListener("click", function (e) {
            e.preventDefault();
            moveSlide(i);
        });
    });

    //자동 슬라이드 기능 추가 (15초마다 이동)
    setInterval(() => {
        moveSlide(index + 1);
    }, 15000);
});
