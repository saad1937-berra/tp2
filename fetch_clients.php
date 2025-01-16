<?php
// fetch_clients.php

// Inclure la configuration de la base de données
include 'config.php';

// Requête pour récupérer les clients
$query = "SELECT id, raisonsociale FROM clients";
$result = mysqli_query($conn, $query);

// Vérifiez si des clients existent
if (mysqli_num_rows($result) > 0) {
    $clients = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $clients[] = $row;
    }
    // Retourner les clients en format JSON
    echo json_encode($clients);
} else {
    echo json_encode([]);
}
?>
