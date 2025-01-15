<?php
// Connexion à la base de données
include('config.php'); // Assurez-vous que ce fichier contient la connexion à la base de données
header('Content-Type: application/json');

// Récupérer les filtres depuis les paramètres GET
$filtreClient = isset($_GET['client']) && $_GET['client'] !== '' ? $_GET['client'] : '';
$dateDebut = isset($_GET['dateDebut']) && $_GET['dateDebut'] !== '' ? $_GET['dateDebut'] : '';
$dateFin = isset($_GET['dateFin']) && $_GET['dateFin'] !== '' ? $_GET['dateFin'] : '';
$periode = isset($_GET['periode']) && $_GET['periode'] !== '' ? $_GET['periode'] : '';

// Construire la partie WHERE de la requête SQL en fonction des filtres
$whereClauses = [];

// Filtre client
if ($filtreClient) {
    $whereClauses[] = "cl.id LIKE '%" . $conn->real_escape_string($filtreClient) . "%'";
}

// Filtre date début
if ($dateDebut) {
    $whereClauses[] = "c.datecommande >= '" . $conn->real_escape_string($dateDebut) . "'";
}

// Filtre date fin
if ($dateFin) {
    $whereClauses[] = "c.datecommande <= '" . $conn->real_escape_string($dateFin) . "'";
}

// Filtre période
if ($periode) {
    // Calculer les dates en fonction de la période et ajouter le filtre
    $today = date('Y-m-d');
    switch ($periode) {
        case 'today':
            $whereClauses[] = "c.datecommande = '$today'";
            break;
        case 'week':
            $startOfWeek = date('Y-m-d', strtotime('monday this week'));
            $endOfWeek = date('Y-m-d', strtotime('sunday this week'));
            $whereClauses[] = "c.datecommande BETWEEN '$startOfWeek' AND '$endOfWeek'";
            break;
        case 'month':
            $startOfMonth = date('Y-m-01');
            $endOfMonth = date('Y-m-t');
            $whereClauses[] = "c.datecommande BETWEEN '$startOfMonth' AND '$endOfMonth'";
            break;
        case 'year':
            $startOfYear = date('Y-01-01');
            $endOfYear = date('Y-12-31');
            $whereClauses[] = "c.datecommande BETWEEN '$startOfYear' AND '$endOfYear'";
            break;
    }
}

// Requête de base pour récupérer les commandes
$sql = "
    SELECT 
        c.IDCommande,
        c.numero, 
        c.datecommande AS datecommande, 
        c.statut, 
        cl.raisonsociale AS client_nom, 
        SUM(lc.totalligne) AS montant 
    FROM commandes c
    JOIN clients cl ON c.IDClient = cl.id
    JOIN lignes_commande lc ON c.IDCommande = lc.IDCommande
";

// Ajouter les filtres à la requête SQL
if (!empty($whereClauses)) {
    $sql .= " WHERE " . implode(" AND ", $whereClauses);
}

$sql .= " GROUP BY c.IDCommande";

// Exécuter la requête SQL
$result = $conn->query($sql);

// Vérifier si la requête a réussi
if ($result) {
    $orders = [];
    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }
    // Retourner les résultats en format JSON
    echo json_encode($orders);
} else {
    // Si la requête échoue, afficher une erreur
    echo json_encode(['error' => 'Erreur lors de la récupération des commandes.']);
}
?>
