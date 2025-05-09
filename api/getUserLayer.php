<?php
// filepath: c:\webGIS\geog7311_project_package_1\_programs\xampp\htdocs\Labs\LibraDayPlanner\api\getUserLayer.php
// set JSON header
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Origin: *");
header("Cache-Control: no-cache, must-revalidate");

require 'db_connect.php';

try {
    // get username from GET request
    $username = $_GET['username'] ?? '';
    
    // check username format（character, num, _ ，length 3-20）
    if (!preg_match('/^[a-zA-Z0-9_]{3,20}$/', $username)) {
        throw new Exception("Invalid username format");
    }

    // user history query（PDO prevent SQL insert）
    $query = "SELECT path_id FROM users_history WHERE username = ? LIMIT 1";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$username]);
    $result = $stmt->fetch();

    if ($result) {
        echo json_encode([
            'success' => true,
            'pathLayer' => $result['path_id'],
        ]);
    } else {
        throw new Exception("User history not found");
    }

} catch(Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}