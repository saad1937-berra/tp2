<?php
$host = 'localhost'; // adresse du serveur
$dbname = 'tp2'; // nom de la base de données
$username = 'root'; // nom d'utilisateur
$password = ''; // mot de passe

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}
?>
