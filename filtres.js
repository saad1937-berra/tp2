$(document).ready(function () {
    // Fonction pour charger les commandes avec des filtres
    function chargerCommandes(clientId = '', dateDebut = '', dateFin = '', periode = '') {
        $.ajax({
            url: 'fetch_commandes.php',
            method: 'GET',
            data: { clientId, dateDebut, dateFin, periode }, // Envoyer les filtres
            dataType: 'json',
            success: function (data) {
                const tableBody = $('#tableBody');
                tableBody.empty();

                if (data && Array.isArray(data)) {
                    if (data.length > 0) {
                        data.forEach(function (order) {
                            const row = `
                                <tr>
                                    <td><input type="checkbox" class="selectOrder" data-order-id="${order.IDCommande}"></td>
                                    <td>${order.numero}</td>
                                    <td>${order.datecommande}</td>
                                    <td>${order.client_nom}</td>
                                    <td>${order.montant}</td>
                                    <td>${order.statut}</td>
                                </tr>
                            `;
                            tableBody.append(row);
                        });
                    } else {
                        tableBody.append('<tr><td colspan="6" class="text-center">Aucune commande trouvée</td></tr>');
                    }
                } else {
                    console.error('Erreur: Les données retournées ne sont pas dans le bon format');
                }
            },
            error: function (xhr, status, error) {
                console.error('Erreur lors de la récupération des commandes : ', error);
            }
        });
    }

    // Appliquer les filtres dès qu'il y a un changement dans les champs
    $('#filtersForm').on('change', function () {
        const clientId = $('#client').val();  // Récupérer l'ID du client sélectionné
        const dateDebut = $('#dateDebut').val();  // Récupérer la date de début
        const dateFin = $('#dateFin').val();  // Récupérer la date de fin
        const periode = $('#periode').val();  // Récupérer la période (si nécessaire)
        console.log('Filtres appliqués:',{clientId, dateDebut, dateFin, periode});

        // Appeler la fonction avec les filtres
        chargerCommandes(clientId, dateDebut, dateFin, periode);
    });

    // Charger les commandes au démarrage (sans filtres)
    chargerCommandes();

    // Fonction pour réinitialiser les filtres
    $('#btnReset').on('click', function (e) {
        e.preventDefault();
        $('#dateDebut').val('');
        $('#dateFin').val('');
        $('#periode').val('');
        $('#client').val('');
        chargerCommandes();  // Recharger les commandes après réinitialisation des filtres
    });

    // Charger les clients dans le filtre
    function chargerClients() {
        $.ajax({
            url: 'fetch_clients.php', // Assurez-vous que l'URL est correcte
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                const clientSelect = $('#client');
                clientSelect.empty().append('<option value="">Tous les clients</option>');  // Option par défaut

                // Ajouter chaque client dans le select
                data.forEach(client => {
                    clientSelect.append(`<option value="${client.id}">${client.raisonsociale}</option>`);
                });
            },
            error: function (xhr, status, error) {
                console.error("Erreur lors du chargement des clients :", error);
            }
        });
    }

    // Charger les clients au démarrage
    chargerClients();
});
