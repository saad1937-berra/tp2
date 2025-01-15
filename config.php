<?php
$servername = "localhost";  // Changez en fonction de votre configuration
$username = "root";         // Changez en fonction de votre configuration
$password = "";             // Changez en fonction de votre configuration
$dbname = "tp2"; // Changez avec le nom de votre base de données

// Créer la connexion
$conn = new mysqli($servername, $username, $password, $dbname);

// Vérifier la connexion
if ($conn->connect_error) {
    die("Échec de la connexion : " . $conn->connect_error);
}
?>
