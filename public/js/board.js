document.addEventListener("DOMContentLoaded", async () => {
    const boardContent = document.getElementById("boardContent");

    try {
        const response = await fetch("/backend/get_posts.php");
        const posts = await response.json();

        boardContent.innerHTML = posts.map(post => `
            <tr>
                <td>${post.id}</td>
                <td><a href="view_post.html?id=${post.id}">${post.title}</a></td>
                <td>${post.author}</td>
                <td>${post.date}</td>
                <td>${post.views}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error("게시판 로드 오류:", error);
    }
});
