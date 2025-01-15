<?php
// Connexion à la base de données
include('config.php'); // Assurez-vous que ce fichier contient la connexion à la base de données

// Définir l'en-tête de la réponse JSON
header('Content-Type: application/json');

// Récupérer les données envoyées via POST
$clientId = isset($_POST['clientId']) ? $_POST['clientId'] : null;
$numero = isset($_POST['numero']) ? $_POST['numero'] : null;
$dateCommande = isset($_POST['datecommande']) ? $_POST['datecommande'] : null;
$statut = isset($_POST['statut']) ? $_POST['statut'] : null;
$produits = isset($_POST['produits']) ? $_POST['produits'] : null;

// Vérifier que toutes les informations nécessaires sont présentes
if (empty($clientId) || empty($numero) || empty($dateCommande) || empty($statut) || empty($produits)) {
    echo json_encode(['status' => 'error', 'message' => 'Données manquantes']);
    exit();
}

// Préparer l'insertion dans la table commandes
$sqlCommande = "INSERT INTO commandes (IDClient, numero, datecommande, statut) VALUES (?, ?, ?, ?)";
$stmtCommande = $conn->prepare($sqlCommande);

// Vérifier la préparation de la requête
if (!$stmtCommande) {
    echo json_encode(['status' => 'error', 'message' => 'Erreur de préparation de la commande']);
    exit();
}

// Lier les paramètres et exécuter l'insertion de la commande
$stmtCommande->bind_param("isss", $clientId, $numero, $dateCommande, $statut);
if ($stmtCommande->execute()) {
    // Récupérer l'ID de la commande insérée
    $idCommande = $stmtCommande->insert_id;

    // Préparer l'insertion des lignes de commande dans la table lignes_commande
    $sqlLigneCommande = "INSERT INTO lignes_commande (IDCommande, IDProduit, quantite, totalligne) VALUES (?, ?, ?, ?)";
    $stmtLigneCommande = $conn->prepare($sqlLigneCommande);

    // Vérifier la préparation de la requête des lignes de commande
    if (!$stmtLigneCommande) {
        echo json_encode(['status' => 'error', 'message' => 'Erreur de préparation des lignes de commande']);
        exit();
    }

    // Insérer chaque ligne de commande
    foreach ($produits as $produit) {
        $idProduit = $produit['productId']; // Utilisation de "productId" au lieu de "idProduit"
        $quantite = $produit['quantity'];   // Utilisation de "quantity" au lieu de "quantite"
        $prix = $produit['prix'];
        $totalLigne = $prix * $quantite;

        // Lier les paramètres et exécuter l'insertion de la ligne de commande
        $stmtLigneCommande->bind_param("iiid", $idCommande, $idProduit, $quantite, $totalLigne);
        if (!$stmtLigneCommande->execute()) {
            echo json_encode(['status' => 'error', 'message' => 'Erreur lors de l\'insertion d\'une ligne de commande']);
            exit();
        }
    }

    // Si tout s'est bien passé, on retourne une réponse de succès
    $response = array('status' => 'success', 'message' => 'Commande ajoutée avec succès');
} else {
    // Si une erreur se produit lors de l'insertion de la commande principale
    $response = array('status' => 'error', 'message' => 'Erreur lors de l\'ajout de la commande');
}

// Envoyer la réponse sous forme de JSON
echo json_encode($response);
?>
