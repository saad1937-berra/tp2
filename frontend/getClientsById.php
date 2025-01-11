<?php
include 'config.php'; // Assurez-vous que ce fichier configure correctement $conn pour MySQLi

header('Content-Type: application/json');

try {
    $query = "SELECT id, raisonsociale FROM clients";
    $result = $conn->query($query);

    if ($result === false) {
        throw new Exception("Erreur dans la requête SQL : " . $conn->error);
    }

    $clients = [];
    while ($row = $result->fetch_assoc()) {
        $clients[] = $row;
    }

    if (empty($clients)) {
        echo json_encode(["error" => "Aucun client trouvé."]);
    } else {
        echo json_encode($clients);
    }
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    $conn->close();
}
?>
