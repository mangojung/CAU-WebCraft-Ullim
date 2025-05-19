document.getElementById("postForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", document.getElementById("title").value);
    formData.append("author", document.getElementById("author").value);
    formData.append("content", document.getElementById("content").value);
    formData.append("file", document.getElementById("file").files[0]);

    try {
        const response = await fetch("/backend/post_new.php", {
            method: "POST",
            body: formData
        });

        if (response.ok) {
            alert("게시물이 등록되었습니다.");
            window.location.href = "board.html";
        } else {
            alert("게시물 등록 실패.");
        }
    } catch (error) {
        console.error("게시물 작성 오류:", error);
    }
});

