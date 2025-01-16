$(document).ready(function () {
    // Fonction pour charger les commandes avec les filtres
    function chargerCommandes(clientId = '', dateDebut = '', dateFin = '', periode = '') {
        $.ajax({
            url: 'fetch_commandes.php',
            method: 'GET',
            data: { 
                clientId: clientId, 
                dateDebut: dateDebut, 
                dateFin: dateFin, 
                periode: periode 
            },
            dataType: 'json',
            success: function (data) {
                const tableBody = $('#tableBody');
                tableBody.empty(); // Vider la table avant de la remplir

                if (data && Array.isArray(data)) {
                    if (data.length > 0) {
                        data.forEach(function (order) {
                            const row = `
                                <tr  data-order-id="${order.IDCommande}">
                                    <td><input type="checkbox" class="select-order"></td>
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
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
        row.addEventListener('click', function() {
            const orderId = this.querySelector('.select-order').getAttribute('data-order-id');
            console.log("Commande sélectionnée ID : " + orderId);
            // Vous pouvez maintenant passer cet ID à la fonction de modification
            document.getElementById('editOrderBtn').setAttribute('data-order-id', orderId);
             // Mettre à jour le bouton "Modifier" avec l'ID de la commande sélectionnée
             const editButton = document.getElementById('editOrderBtn');
             editButton.setAttribute('data-order-id', orderId);
             // Mettre également à jour l'affichage du texte dans le modal (facultatif)
            // Exemple si vous avez une div qui affiche l'ID de la commande dans le modal
            const modalTitle = document.getElementById('updateOrderModalLabel');
            modalTitle.textContent = `Modifier la commande N° ${orderId}`;
        });
    });
    chargerCommandes();

    // Charger les clients dans le filtre "Client"
    function loadClients() {
        $.ajax({
            url: 'fetch_clients.php',
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                // Vérifie si la réponse est bien un tableau
                if (Array.isArray(response) && response.length > 0) {
                    // Ajouter une option par défaut
                    $('#clientSelectFiltre').empty().append('<option value="">Tous les clients</option>');
                    response.forEach(function(client) {
                        $('#clientSelectFiltre').append('<option value="'+ client.id +'">'+ client.raisonsociale +'</option>');
                    });
                } else {
                    console.log('Aucun client trouvé');
                }
            },
            error: function(xhr, status, error) {
                console.log('Erreur lors de la récupération des clients:', error);
            }
        });
    }
    
    // Charger les clients dès que la page est prête
    loadClients();

    // Fonction pour appliquer les filtres
    $('#filterForm').on('change', function () {
        const clientId = $('#clientSelectFiltre').val();  // Récupérer l'ID du client sélectionné
        const dateDebut = $('#dateDebut').val();  // Récupérer la date de début
        const dateFin = $('#dateFin').val();  // Récupérer la date de fin
        const periode = $('#periode').val();  // Récupérer la période (si nécessaire)
        // Appeler la fonction pour charger les commandes avec les filtres
        chargerCommandes(clientId, dateDebut, dateFin, periode);
    });

    // Réinitialiser les filtres au clic sur le bouton "Réinitialiser"
    $('#btnReset').on('click', function (e) {
        e.preventDefault();
        $('#filterForm')[0].reset();  // Réinitialiser le formulaire des filtres
        chargerCommandes();  // Recharger les commandes sans filtres
    });
    // Charger les commandes au démarrage (sans filtres)
    chargerCommandes();
});
