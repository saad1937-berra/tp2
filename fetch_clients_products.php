<?php
// Connexion à la base de données
$conn = new mysqli('localhost', 'root', '', 'tp2');

if ($conn->connect_error) {
    die("Connexion échouée : " . $conn->connect_error);
}

// Récupérer les clients
$clients = $conn->query("SELECT id, raisonsociale FROM clients")->fetch_all(MYSQLI_ASSOC);

// Récupérer les produits
$produits = $conn->query("SELECT id, libelle, prix FROM produits")->fetch_all(MYSQLI_ASSOC);

// Retourner les données en JSON
echo json_encode(['clients' => $clients, 'produits' => $produits]);

$conn->close();
?>
