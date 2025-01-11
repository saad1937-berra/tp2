<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $raisonsociale = $_POST['raisonsociale'];
    $adresse = $_POST['adresse'];
    $ville = $_POST['ville'];
    $telephone = $_POST['telephone'];

    $query = "UPDATE clients SET raisonsociale = ?, adresse = ?, ville = ?, telephone = ? WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$raisonsociale, $adresse, $ville, $telephone, $id]);

    echo "Client mis à jour avec succès";
}
?>
