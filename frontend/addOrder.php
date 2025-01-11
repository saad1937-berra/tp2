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

    $stmt = $conn->prepare("INSERT INTO commandes (IDClient, IDProduit, quantite, total) VALUES (?, ?, ?, ?)");
    if (!$stmt) {
        throw new Exception("Erreur de préparation de la requête : " . $conn->error);
    }

    $stmt->bind_param("iiid", $clientId, $productId, $quantity, $totalPrice);
    if (!$stmt->execute()) {
        throw new Exception("Erreur lors de l'ajout de la commande : " . $stmt->error);
    }

    echo json_encode(["success" => "Commande ajoutée avec succès."]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    $stmt->close();
    $conn->close();
}
?>
