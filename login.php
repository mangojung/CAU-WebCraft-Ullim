<?php
// 데이터베이스 연결 정보
$host = "localhost";
$dbname = "cau_students";
$username = "root";
$password = "mysql";

// MySQL 연결
$conn = new mysqli($host, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    die("데이터베이스 연결 실패: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $user_username = $_POST['username'] ?? '';
    $user_password = $_POST['password'] ?? '';

    if (empty($user_username) || empty($user_password)) {
        die("아이디와 비밀번호를 모두 입력해주세요.");
    }

    $sql = "SELECT password FROM members WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $user_username);
    $stmt->execute();
    $stmt->store_result();

    if ($stmt->num_rows > 0) {
        $stmt->bind_result($hashed_password);
        $stmt->fetch();

        if (password_verify($user_password, $hashed_password)) {
            echo "로그인 성공!";
            // 필요 시 세션 처리 추가
        } else {
            echo "비밀번호가 일치하지 않습니다.";
        }
    } else {
        echo "아이디가 존재하지 않습니다.";
    }

    $stmt->close();
} else {
    echo "잘못된 접근입니다.";
}

$conn->close();
?>
