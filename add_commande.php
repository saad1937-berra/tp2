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
$produits = isset($_POST['produits']) ? $_POST['produits'] : [];

// Vérifier que toutes les informations nécessaires sont présentes
if (empty($clientId) || empty($numero) || empty($dateCommande) || empty($statut) || empty($produits)) {
    echo json_encode(['status' => 'error', 'message' => 'Données manquantes']);
    exit();
}

// Générer le numéro de commande au format CMD-YYYY-XXXX
$year = date('Y');
$prefix = 'CMD-' . $year . '-';
$lastOrderQuery = "SELECT numero FROM commandes WHERE numero LIKE '$prefix%' ORDER BY numero DESC LIMIT 1";
$result = $conn->query($lastOrderQuery);

$newOrderNumber = $prefix . '0001';  // Valeur par défaut si aucune commande n'existe pour cette année
if ($result->num_rows > 0) {
    // Récupérer le dernier numéro de commande et incrémenter le suffixe
    $lastOrder = $result->fetch_assoc();
    $lastOrderNumber = $lastOrder['numero'];
    $suffix = substr($lastOrderNumber, -4);  // Récupérer les 4 derniers chiffres
    $newSuffix = str_pad(intval($suffix) + 1, 4, '0', STR_PAD_LEFT);
    $newOrderNumber = $prefix . $newSuffix;
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
$stmtCommande->bind_param("isss", $clientId, $newOrderNumber, $dateCommande, $statut);
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
        $idProduit = $produit['IDProduit']; // Utilisation de "IDProduit" au lieu de "idProduit"
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
