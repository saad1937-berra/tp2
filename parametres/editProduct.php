<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id = $_POST['id'];
    $libelle = $_POST['libelle'];
    $prix = $_POST['prix'];

    $query = "UPDATE produits SET libelle = ?, prix = ? WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$libelle, $prix, $id]);

    echo "Produit mis à jour avec succès";
}
?>
