<?php
include 'config.php';

if (isset($_GET['id'])) {
    $id = $_GET['id'];

    // Requête pour récupérer le produit par ID
    $query = "SELECT * FROM produits WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$id]);

    // Récupérer les données du produit
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    // Retourner les données du produit en format JSON
    echo json_encode($product);
}
?>
