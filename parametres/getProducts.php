<?php
include 'config.php';

$query = "SELECT * FROM produits";
$stmt = $pdo->query($query);
$products = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($products);
?>
