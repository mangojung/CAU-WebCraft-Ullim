<?php
header('Content-Type: application/json');

// 데이터베이스 연결
$host = "localhost";
$dbname = "cau_students";
$username = "root";
$password = "mysql";

$conn = new mysqli($host, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    die(json_encode(['status' => 'error', 'message' => '데이터베이스 연결 실패']));
}

// 회원 승인 처리
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['user_id'])) {
    $userId = $_POST['user_id'];
    $sql = "UPDATE members SET is_approved = 1 WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $userId);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'success', 'message' => '회원이 승인되었습니다.']);
    } else {
        echo json_encode(['status' => 'error', 'message' => '회원 승인 실패']);
    }

    $stmt->close();
    exit;
}

// 승인 대기 중인 회원 목록 조회
$sql = "SELECT id, username, email FROM members WHERE is_approved = 0";
$result = $conn->query($sql);

$pendingUsers = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $pendingUsers[] = $row;
    }
}

// JSON 형식으로 데이터 반환
echo json_encode($pendingUsers);

$conn->close();
?>
