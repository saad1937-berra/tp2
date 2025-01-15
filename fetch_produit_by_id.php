<?php
// Connexion à la base de données
include('config.php');
$id = $_GET['id'];
$query = "SELECT * FROM produits WHERE id = $id";
$result = mysqli_query($conn, $query);
$produit = mysqli_fetch_assoc($result);
echo json_encode($produit);
?>
