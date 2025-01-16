<?php
// Connexion à la base de données
include('config.php'); // Remplacez ceci par votre fichier de configuration

// Vérifiez si les commandes sont envoyées
if (isset($_POST['orders'])) {
    // Décodez le JSON reçu
    $orders = json_decode($_POST['orders'], true); // true pour obtenir un tableau associatif

    if (is_array($orders) && count($orders) > 0) {
        // Début de la transaction pour éviter des suppressions partielles
        $conn->begin_transaction();

        try {
            // Supprimer les lignes associées aux commandes
            $queryLignes = "DELETE FROM lignes_commande WHERE IDCommande IN (" . implode(',', array_map('intval', $orders)) . ")";
            $conn->query($queryLignes); // Exécuter la requête de suppression des lignes

            // Supprimer les commandes elles-mêmes
            $queryCommandes = "DELETE FROM commandes WHERE IDCommande IN (" . implode(',', array_map('intval', $orders)) . ")";
            $conn->query($queryCommandes); // Exécuter la requête de suppression des commandes

            // Valider la transaction
            $conn->commit();

            // Retourner une réponse de succès
            echo json_encode(['success' => true]);
        } catch (Exception $e) {
            // En cas d'erreur, annuler la transaction
            $conn->rollback();
            echo json_encode(['success' => false, 'error' => $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'error' => 'Aucune commande sélectionnée.']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Aucune commande reçue.']);
}
?>
