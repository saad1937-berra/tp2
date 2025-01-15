<?php
include 'config.php'; // Assurez-vous que ce fichier configure correctement $conn pour MySQLi

header('Content-Type: application/json');

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception("Méthode non autorisée.");
    }

    $clientId = isset($_POST['clientId']) ? intval($_POST['clientId']) : null;
    $productId = isset($_POST['productId']) ? intval($_POST['productId']) : null;
    $quantity = isset($_POST['quantity']) ? intval($_POST['quantity']) : null;
    $totalPrice = isset($_POST['totalPrice']) ? floatval($_POST['totalPrice']) : null;

    if (!$clientId || !$productId || !$quantity || !$totalPrice) {
        throw new Exception("Tous les champs doivent être remplis.");
    }

    $stmt = $conn->prepare("INSERT INTO commandes (IDClient, statut) VALUES (?, 'En attente')");
    $stmt->bind_param("i", $clientId);
    $stmt->execute();
    $orderId = $stmt->insert_id;
    $stmt->close();

    $stmt = $conn->prepare("INSERT INTO lignes_commande (IDCommande, IDProduit, quantite, totalligne) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiid", $orderId, $productId, $quantity, $totalPrice);
    $stmt->execute();
    $stmt->close();

    echo json_encode(["success" => "Commande ajoutée avec succès."]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    $conn->close();
}
?>
