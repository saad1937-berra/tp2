<?php
// Connexion à la base de données
include('config.php'); // Remplacez par le chemin vers votre fichier de connexion

$sql = "SELECT id, raisonsociale FROM clients";
$result = $conn->query($sql);

// Vérifier si la requête a réussi
if ($result) {
    $clients = [];
    while ($row = $result->fetch_assoc()) {
        $clients[] = $row;
    }
    // Retourner les clients en format JSON
    echo json_encode($clients);
} else {
    echo json_encode(['error' => 'Erreur lors de la récupération des clients.']);
}
?>
