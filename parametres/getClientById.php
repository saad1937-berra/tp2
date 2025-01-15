<?php
include 'config.php';

if (isset($_GET['id'])) {
    $id = $_GET['id'];

    // Requête pour récupérer le client par ID
    $query = "SELECT * FROM clients WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$id]);

    // Récupérer les données du client
    $client = $stmt->fetch(PDO::FETCH_ASSOC);

    // Retourner les données du client en format JSON
    echo json_encode($client);
}
?>
