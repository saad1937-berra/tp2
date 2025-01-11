<?php
include 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $libelle = $_POST['libelle'];
    $prix = $_POST['prix'];

    $query = "INSERT INTO produits (libelle, prix) VALUES (?, ?)";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$libelle, $prix]);

    echo "Produit ajouté avec succès";
}
?>
