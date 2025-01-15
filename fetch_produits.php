<?php
// Connexion à la base de données
$host = 'localhost'; // Remplacez par votre hôte
$dbname = 'tp2'; // Nom de votre base de données
$username = 'root'; // Nom d'utilisateur de la base
$password = ''; // Mot de passe de la base

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

// Récupération des produits
try {
    $sql = "SELECT id, libelle, prix FROM produits";
    $stmt = $pdo->prepare($sql);
    $stmt->execute();

    // Retourner les produits au format JSON
    $produits = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($produits);
} catch (PDOException $e) {
    echo json_encode(['error' => 'Erreur lors de la récupération des produits : ' . $e->getMessage()]);
}
?>
