const params = new URLSearchParams(window.location.search);
const postId = params.get("id");

fetch(`get_post.php?id=${postId}`)
    .then(response => response.json())
    .then(post => {
        document.getElementById("postTitle").textContent = post.title;
        document.getElementById("postAuthor").textContent = post.author;
        document.getElementById("postDate").textContent = post.date;
        document.getElementById("postViews").textContent = post.views;
        document.getElementById("postContent").innerHTML = post.content;

        if (post.file) {
            document.getElementById("fileContainer").classList.remove("hidden");
            document.getElementById("fileName").textContent = post.file;
            document.getElementById("downloadFile").onclick = () => {
                window.location.href = `uploads/${post.file}`;
            };
        }
    })
    .catch(error => console.error("게시물 불러오기 오류:", error));
