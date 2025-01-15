<?php
// Inclure la connexion à la base de données
include('config.php'); // Remplacez par votre fichier de connexion

// Définir l'en-tête de réponse JSON
header('Content-Type: application/json');

// Vérifier si la connexion a réussi
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'error' => 'Échec de la connexion à la base de données.']);
    exit();
}

// Requête pour récupérer tous les clients
$query = "SELECT id, raisonsociale FROM clients";
$result = $conn->query($query);

// Vérifiez si des clients ont été trouvés
if ($result && $result->num_rows > 0) {
    $clients = [];
    
    // Récupérer chaque client
    while ($row = $result->fetch_assoc()) {
        $clients[] = $row;
    }

    // Retourner les clients en JSON
    echo json_encode(['success' => true, 'clients' => $clients]);
} else {
    // En cas d'erreur de requête ou aucun client trouvé
    echo json_encode(['success' => false, 'error' => 'Aucun client trouvé ou erreur dans la requête.']);
}

// Fermer la connexion
$conn->close();
?>
