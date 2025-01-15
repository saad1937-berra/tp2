<?php
// Inclure la connexion à la base de données
include('config.php'); // Remplacez par votre fichier de connexion

header('Content-Type: application/json');
echo json_encode($data);

// Vérifier que la méthode est POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer les données JSON envoyées
    $data = json_decode(file_get_contents('php://input'), true);

    // Vérifier si les données sont valides
    if (isset($data['idCommande'], $data['clientId'], $data['lignesCommande'], $data['dateCommande'], $data['statut'])) {
        $idCommande = $data['idCommande'];
        $clientId = $data['clientId'];
        $lignesCommande = $data['lignesCommande'];
        $dateCommande = $data['dateCommande'];
        $statut = $data['statut'];

        // Mettre à jour la commande dans la table `commandes`
        $queryCommande = "
            UPDATE commandes
            SET datecommande = ?, statut = ?, IDClient = ?
            WHERE IDCommande = ?
        ";

        if ($stmt = $conn->prepare($queryCommande)) {
            $stmt->bind_param('ssii', $dateCommande, $statut, $clientId, $idCommande);
            if (!$stmt->execute()) {
                echo json_encode(['success' => false, 'error' => 'Erreur lors de la mise à jour de la commande']);
                exit();
            }
            $stmt->close();
        } else {
            echo json_encode(['success' => false, 'error' => 'Erreur de préparation de la requête pour la commande']);
            exit();
        }

        // Supprimer les anciennes lignes de commande avant de les réinsérer
        $queryDeleteLignes = "DELETE FROM lignes_commande WHERE IDCommande = ?";
        if ($stmtDelete = $conn->prepare($queryDeleteLignes)) {
            $stmtDelete->bind_param('i', $idCommande);
            if (!$stmtDelete->execute()) {
                echo json_encode(['success' => false, 'error' => 'Erreur lors de la suppression des anciennes lignes de commande']);
                exit();
            }
            $stmtDelete->close();
        } else {
            echo json_encode(['success' => false, 'error' => 'Erreur de préparation de la requête de suppression des lignes']);
            exit();
        }

        // Réinsérer les nouvelles lignes de commande
        foreach ($lignesCommande as $ligne) {
            $queryLigne = "
                INSERT INTO lignes_commande (IDCommande, IDProduit, quantite, totalligne)
                VALUES (?, ?, ?, ?)
            ";

            if ($stmtLigne = $conn->prepare($queryLigne)) {
                $totalLigne = $ligne['quantite'] * $ligne['prix'];
                $stmtLigne->bind_param('iiid', $idCommande, $ligne['idProduit'], $ligne['quantite'], $totalLigne);
                if (!$stmtLigne->execute()) {
                    echo json_encode(['success' => false, 'error' => 'Erreur lors de l\'insertion des lignes de commande']);
                    exit();
                }
                $stmtLigne->close();
            } else {
                echo json_encode(['success' => false, 'error' => 'Erreur de préparation de la requête pour l\'insertion des lignes']);
                exit();
            }
        }

        // Retourner la réponse de succès
        echo json_encode(['success' => true, 'message' => 'Commande mise à jour avec succès']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Données manquantes ou incorrectes']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée']);
}

// Fermer la connexion
$conn->close();
?>
