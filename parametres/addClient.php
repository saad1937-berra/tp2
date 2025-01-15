<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $raisonsociale = $_POST['raisonsociale'];
    $adresse = $_POST['adresse'];
    $ville = $_POST['ville'];
    $telephone = $_POST['telephone'];

    $query = "INSERT INTO clients (raisonsociale, adresse, ville, telephone) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$raisonsociale, $adresse, $ville, $telephone]);

    echo "Client ajouté avec succès";
}
?>
