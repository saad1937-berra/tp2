<?php
// Inclure la connexion à la base de données
include('config.php'); // Remplacez par votre fichier de connexion

header('Content-Type: application/json');

// Vérifier que l'ID de la commande est reçu
if (isset($_GET['idCommande'])) {
    $idCommande = intval($_GET['idCommande']);
    
    // Log de l'ID de la commande pour débogage
    error_log("ID de la commande reçu: " . $idCommande); // Log de l'ID de la commande

    // Requête pour récupérer les détails de la commande avec une jointure sur les clients
    $queryCommande = "
        SELECT c.IDCommande, c.IDClient, c.datecommande, c.statut, cl.raisonsociale
        FROM commandes c
        JOIN clients cl ON c.IDClient = cl.id
        WHERE c.IDCommande = ?
    ";

    if ($stmtCommande = $conn->prepare($queryCommande)) {
        $stmtCommande->bind_param("i", $idCommande);
        
        if ($stmtCommande->execute()) {
            $resultCommande = $stmtCommande->get_result();

            if ($resultCommande->num_rows > 0) {
                // Récupérer la commande
                $commande = $resultCommande->fetch_assoc();

                // Vérifier si le client est bien récupéré
                if ($commande['raisonsociale']) {
                    error_log("Client trouvé: " . $commande['raisonsociale']); // Log du nom du client
                } else {
                    error_log("Aucun client trouvé pour cette commande.");
                }

                // Requête pour récupérer les lignes de la commande avec la structure correcte
                $queryLignes = "
                    SELECT lc.IDLigne, lc.IDCommande, lc.IDProduit, lc.quantite, lc.totalligne, p.libelle AS nomProduit, p.prix
                    FROM lignes_commande lc
                    JOIN produits p ON lc.IDProduit = p.id
                    WHERE lc.IDCommande = ?
                ";

                if ($stmtLignes = $conn->prepare($queryLignes)) {
                    $stmtLignes->bind_param("i", $idCommande);
                    
                    if ($stmtLignes->execute()) {
                        $resultLignes = $stmtLignes->get_result();

                        // Récupérer les lignes
                        $lignes = [];
                        while ($ligne = $resultLignes->fetch_assoc()) {
                            $lignes[] = $ligne;
                        }

                        // Retourner les données de la commande et des lignes
                        echo json_encode([
                            'success' => true,
                            'commande' => [
                                'IDCommande' => $commande['IDCommande'],
                                'IDClient' => $commande['IDClient'],
                                'datecommande' => $commande['datecommande'],
                                'statut' => $commande['statut'],
                                'raisonsociale' => $commande['raisonsociale'],
                                'lignes' => $lignes
                            ]
                        ]);
                    } else {
                        echo json_encode(['success' => false, 'error' => 'Erreur lors de l\'exécution de la requête pour les lignes de commande: ' . $stmtLignes->error]);
                    }
                } else {
                    echo json_encode(['success' => false, 'error' => 'Erreur lors de la préparation de la requête des lignes de commande: ' . $conn->error]);
                }
            } else {
                echo json_encode(['success' => false, 'error' => 'Commande introuvable.']);
            }
        } else {
            echo json_encode(['success' => false, 'error' => 'Erreur lors de l\'exécution de la requête pour la commande: ' . $stmtCommande->error]);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Erreur lors de la préparation de la requête de commande: ' . $conn->error]);
    }
} else {
    // Si l'ID de la commande n'est pas passé
    echo json_encode(['success' => false, 'error' => 'ID de commande manquant.']);
}

// Fermer les connexions et les statements préparés
$stmtCommande->close();
$stmtLignes->close();
$conn->close();
?>
