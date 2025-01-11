<?php
include 'config.php';

$query = "SELECT * FROM clients";
$stmt = $pdo->query($query);
$clients = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($clients);
?>
