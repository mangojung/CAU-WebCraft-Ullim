<?php
// 데이터베이스 연결 정보
$host = "localhost";
$dbname = "cau_students";
$username = "root";
$password = "mysql"; // MySQL root 계정 비밀번호

// MySQL 연결
$conn = new mysqli($host, $username, $password, $dbname);

// 연결 확인
if ($conn->connect_error) {
    die("데이터베이스 연결 실패: " . $conn->connect_error);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 폼 데이터 수신
    $user_username = $_POST['username'] ?? '';
    $user_password = $_POST['password'] ?? '';
    $user_password_check = $_POST['password_check'] ?? '';
    $user_name = $_POST['name'] ?? '';
    $user_phone = $_POST['phone'] ?? '';
    $user_email = $_POST['email'] ?? '';
    $user_consent = isset($_POST['check']) && $_POST['check'] === "동의" ? 1 : 0;

    // 필수 입력값 확인
    if (empty($user_username) || empty($user_password) || empty($user_password_check) || empty($user_name) || empty($user_phone) || empty($user_email)) {
        die("모든 필드를 입력해야 합니다.");
    }

    // 비밀번호 확인
    if ($user_password !== $user_password_check) {
        die("비밀번호가 일치하지 않습니다.");
    }

    // 비밀번호 해싱
    $hashed_password = password_hash($user_password, PASSWORD_DEFAULT);

    // 이미지 처리
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_FILES['profile_picture']) && isset($_FILES['profile_picture']['error'])) {
            if ($_FILES['profile_picture']['error'] === UPLOAD_ERR_OK) {
                $image_temp_path = $_FILES['profile_picture']['tmp_name'];
                $image = addslashes(file_get_contents($image_temp_path));
            } else {
                $error = $_FILES['profile_picture']['error'];
                switch ($error) {
                    case UPLOAD_ERR_INI_SIZE:
                    case UPLOAD_ERR_FORM_SIZE:
                        die("업로드된 파일 크기가 너무 큽니다.");
                    case UPLOAD_ERR_NO_FILE:
                        die("프로필 사진을 업로드해야 합니다.");
                    default:
                        die("파일 업로드 중 문제가 발생했습니다. 에러 코드: $error");
                }
            }
        } else {
            die("프로필 사진 데이터가 전송되지 않았습니다.");
        }
    }
    

    // 데이터 삽입 쿼리
    $sql = "INSERT INTO members (username, password, name, phone, email, consent, profile_picture) 
            VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sssssis", $user_username, $hashed_password, $user_name, $user_phone, $user_email, $user_consent, $image);

    if ($stmt->execute()) {
        echo "회원가입이 성공적으로 완료되었습니다!";
    } else {
        echo "회원가입 실패: " . $stmt->error;
    }

    $stmt->close();
} else {
    echo "잘못된 접근입니다.";
}

$conn->close();
?>
