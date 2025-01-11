<?php
include 'config.php'; // Assurez-vous que ce fichier configure correctement $pdo pour PDO

header('Content-Type: application/json');

try {
    if (!isset($_GET['id'])) {
        throw new Exception("ID du produit manquant.");
    }

    $id = intval($_GET['id']); // Convertir l'ID en entier pour éviter les injections SQL

    // Requête pour récupérer le produit
    $query = "SELECT id, nom, prix FROM produits WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$id]);

    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$product) {
        echo json_encode(["error" => "Produit introuvable."]);
    } else {
        echo json_encode($product);
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>
