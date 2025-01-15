$(document).ready(function () {
    // Fonction pour charger les commandes
    function chargerCommandes(clientId = '', dateDebut = '', dateFin = '', periode = '') {
        $.ajax({
            url: 'fetch_commandes.php',
            method: 'GET',
            data: { clientId, dateDebut, dateFin, periode }, // Envoyer les filtres
            dataType: 'json',
            success: function (data) {
                console.log(data);
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
        const clientId = $('#client').val();
        const dateDebut = $('#dateDebut').val();
        const dateFin = $('#dateFin').val();
        const periode = $('#periode').val();
        console.log('Filtres appliqués:',{clientId, dateDebut,dateFin,periode});
        
    
        // Appeler la fonction avec les filtres
        chargerCommandes(clientId, dateDebut, dateFin, periode);
    });

    // Charger les commandes au démarrage
    chargerCommandes();

    // Fonction de réinitialisation des filtres
    $('#btnReset').on('click', function (e) {
        e.preventDefault();
        $('#dateDebut').val('');
        $('#dateFin').val('');
        $('#periode').val('');
        $('#client').val('');
        chargerCommandes(); // Recharger les commandes après réinitialisation des filtres
    });

    // Charger les clients dans le filtre et le modal
    function chargerClients() {
        $.ajax({
            url: 'fetch_clients.php', // Assurez-vous que l'URL est correcte
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                const clientSelect = $('#clientId');
                const clientSelectModal = $('#clientSelect');
                clientSelect.empty().append('<option value="">Tous les clients</option>');
                clientSelectModal.empty().append('<option value="">Sélectionner un client</option>');

                // Ajouter chaque client dans les deux sélecteurs
                data.forEach(client => {
                    clientSelect.append(`<option value="${client.id}">${client.raisonsociale}</option>`);
                    clientSelectModal.append(`<option value="${client.id}">${client.raisonsociale}</option>`);
                });
            },
            error: function (xhr, status, error) {
                console.error("Erreur lors du chargement des clients :", error);
            }
        });
    }
    function loadProducts() {
        $.ajax({
            url: 'fetch_produits.php',
            type: 'GET',
            success: function(response) {
                const produits = JSON.parse(response);
                $('#productSelectAdd, #productSelectUpdate').empty().append('<option value="" disabled selected>Sélectionner un produit</option>');
                produits.forEach(function(produit) {
                    $('#productSelectAdd, #productSelectUpdate').append(`<option value="${produit.id}">${produit.libelle}</option>`);
                });
            }
        });
    }

    // Calcul du total général en fonction des produits ajoutés
    function updateTotal() {
        let total = 0;
        $('#selectedProductsTable tr').each(function() {
            total += parseFloat($(this).find('.totalLigne').text());
        });
        $('#grandTotal').text(total.toFixed(2) + ' €');
        $('#totalGeneralInput').val(total.toFixed(2));
    }

    // Ajouter un produit à la commande
    $('#addProductBtn').click(function() {
        const productId = $('#productSelectAdd').val();
        const quantity = parseInt($('#quantityAdd').val(), 10);

        if (productId && quantity > 0) {
            $.ajax({
                url: 'fetch_produit_by_id.php',
                type: 'GET',
                data: { id: productId },
                success: function(response) {
                    const produit = JSON.parse(response);
                    const price = parseFloat(produit.prix);
                    const totalLine = price * quantity;

                    const row = `<tr>
                        <td>${produit.libelle}</td>
                        <td>${quantity}</td>
                        <td>${price} €</td>
                        <td class="totalLigne">${totalLine.toFixed(2)} €</td>
                        <td><button type="button" class="btn btn-danger btn-sm removeProductBtn">Supprimer</button></td>
                    </tr>`;
                    $('#selectedProductsTable').append(row);
                    updateTotal();
                }
            });
        }
    });

    // Charger les clients au démarrage
    chargerClients();
    loadProducts();

    // Afficher le modal pour ajouter une commande
    $('#btnNouveau').on('click', function () {
        // Réinitialiser les champs du formulaire
        $('#clientSelect').val('');
        $('#productSelect').val('');
        $('#quantity').val(1);
        $('#totalPrice').val('');
        $('#orderDate').val('');
        $('#orderStatus').val('En attente');

        // Afficher le modal
        $('#modalAddOrder').modal('show');
    });

    // Calculer le total lors de la modification du produit ou de la quantité
    $('#productSelect, #quantity').on('change', function () {
        const selectedProduct = $('#productSelect option:selected');
        const price = parseFloat(selectedProduct.data('price')) || 0;
        const quantity = parseInt($('#quantity').val()) || 0;
        const total = price * quantity;
        $('#totalPrice').val(total.toFixed(2));
    });

    // Ajouter une commande
    $('#saveOrderBtn').on('click', function () {
        var data={};
        // Récupérer la valeur du client
        data.clientId = $('#client').val();
        data.orderDate = $('#orderDate').val();
        data.orderStatus = $('#orderStatus').val();
        data.totalGeneral = $('#totalGeneralInput').val();
        data.products = [];
        console.log(data);

        // Vérifier les champs obligatoires
        if (!data.clientId) {
            alert("Veuillez sélectionner un client.");
            return;
        }
        if (!data.orderDate) {
            alert("Veuillez entrer une date de commande.");
            return;
        }
        if (!data.orderStatus) {
            alert("Veuillez sélectionner un statut de commande.");
            return;
        }
        if ($('#selectedProductsTable tr').length === 0) {
            alert("Veuillez ajouter des produits à la commande.");
            return;
        }
    
        // Récupérer les produits sélectionnés dans le tableau
        $('#selectedProductsTable tr').each(function() {
            const productId = $(this).find('td').first().text();
            const quantity = $(this).find('td').eq(1).text();
            data.products.push({ productId: productId, quantity: parseInt(quantity, 10) });  // Assurez-vous que quantity est un nombre
        });

        $.ajax({
            url: 'add_commande.php',
            method: 'POST',
            data: {
                clientId,
                productId,
                quantity,
                totalPrice,
                orderDate,
                orderStatus
            },
            dataType: 'json',
            success: function (data) {
                console.log(data);
                
                if (data.success) {
                    alert("Commande ajoutée avec succès !");
                    $('#modalAddOrder').modal('hide');
                    chargerCommandes(); // Rafraîchir le tableau des commandes
                } else {
                    alert("Erreur lors de l'ajout de la commande : " + data.error);
                }
            },
            error: function (xhr, status, error) {
                console.error("Erreur lors de l'ajout de la commande :", error);
            }
        });
    });

    // Rafraîchir le tableau des commandes avec les filtres
    $('#filterButton').on('click', function () {
        const clientId = $('#client').val();
        const statut = $('#statusFilter').val();
        const dateDebut = $('#startDateFilter').val();
        const dateFin = $('#endDateFilter').val();

        $.ajax({
            url: 'fetch_commandes.php',
            method: 'GET',
            data: {
                clientId,
                statut,
                dateDebut,
                dateFin
            },
            dataType: 'json',
            success: function (data) {
                const ordersTableBody = $('#ordersTable tbody');
                ordersTableBody.empty();

                if (data && data.length > 0) {
                    data.forEach(order => {
                        ordersTableBody.append(`
                            <tr>
                                <td><input type="checkbox" class="order-select" data-order-id="${order.IDCommande}"></td>
                                <td>${order.numero}</td>
                                <td>${order.datecommande}</td>
                                <td>${order.client_nom}</td>
                                <td>${order.montant}</td>
                                <td>${order.statut}</td>
                            </tr>
                        `);
                    });
                } else {
                    ordersTableBody.append('<tr><td colspan="6">Aucune commande trouvée avec les critères spécifiés.</td></tr>');
                }
            },
            error: function (xhr, status, error) {
                console.error("Erreur lors du chargement des commandes :", error);
            }
        });
    });
    // Fonction pour supprimer les commandes sélectionnées
    $('#deleteOrdersBtn').on('click', function () {
        // Récupérer les ID des commandes sélectionnées
        const selectedOrders = [];
        $('.selectOrder:checked').each(function () {
            const orderId = $(this).data('order-id');
            if (orderId){
                selectedOrders.push(orderId);
            }

        });

        // Vérifier si des commandes ont été sélectionnées
        if (selectedOrders.length === 0) {
            alert("Veuillez sélectionner au moins une commande à supprimer.");
            return;
        }
        console.log('ID des commandes sélectionnées:',selectedOrders);
        

        // Demander une confirmation avant de supprimer
        if (confirm("Êtes-vous sûr de vouloir supprimer les commandes sélectionnées ?")) {
            $.ajax({
                url: 'delete_orders.php', // URL du fichier PHP qui supprime les commandes
                method: 'POST',
                data: { orders: JSON.stringify(selectedOrders) }, // Envoyer les ID des commandes sélectionnées
                dataType: 'json',
                success: function (response) {
                    console.log('reponse du serveur:',response);
                    
                    if (response.success) {
                        alert("Commandes supprimées avec succès !");
                        // Recharger la liste des commandes après suppression
                        chargerCommandes();
                    } else {
                        alert("Erreur lors de la suppression des commandes : " + (response.error || "Une erreur est survenue."));
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Erreur lors de la suppression des commandes : ", error);
                    alert("Erreur lors de la suppression des commandes.");
                }
            });
        }
    });
    // Fonction pour mettre à jour la commande
function updateCommande(idCommande, clientId, lignesCommande, dateCommande, statut) {
    // Vérifier que toutes les données nécessaires sont présentes
    if (!idCommande || !clientId || !lignesCommande.length || !dateCommande || !statut) {
        alert("Veuillez remplir tous les champs nécessaires pour mettre à jour la commande.");
        return;
    }

    // Préparer les données à envoyer
    const data = {
        idCommande: idCommande,
        clientId: clientId,
        lignesCommande: JSON.stringify(lignesCommande), // Convertir les lignes en JSON
        dateCommande: dateCommande,
        statut: statut
    };

    // Envoyer la requête AJAX pour mettre à jour la commande
    $.ajax({
        url: 'update_Commande.php',
        method: 'POST',
        data: {
            idCommande: idCommande,
            clientId: clientId,
            lignesCommande: JSON.stringify(lignesCommande),
            dateCommande: dateCommande,
            statut: statut
        },
        success: function(response) {
            try {
                const data = JSON.parse(response);
                if (data.success) {
                    alert('Commande mise à jour avec succès');
                } else {
                    console.error('Erreur lors de la mise à jour de la commande :', data.error);
                }
            } catch (e) {
                console.error('Erreur de parsing JSON :', e);
                console.error('Réponse du serveur :', response);
            }
        },
        error: function(xhr, status, error) {
            console.error('Erreur AJAX :', status, error);
            console.log(xhr.responseText);
        }
    });
}

// Gestionnaire d'événement pour le bouton de mise à jour
$('#updateOrderBtn').on('click', function () {
    // Récupérer les valeurs du formulaire de mise à jour
    const idCommande = $('#updateOrderId').val();
    const clientId = $('#updateClientId').val();
    const dateCommande = $('#updateOrderDate').val();
    const statut = $('#updateOrderStatus').val();

    // Récupérer les lignes de commande depuis la table
    const lignesCommande = [];
    $('#updateOrderLinesTable tbody tr').each(function () {
        const idProduit = $(this).find('.productId').val();
        const quantite = $(this).find('.quantity').val();
        const prix = $(this).find('.price').val();

        // Vérifier si les données de la ligne sont complètes
        if (idProduit && quantite && prix) {
            lignesCommande.push({
                idProduit: parseInt(idProduit, 10),
                quantite: parseInt(quantite, 10),
                prix: parseFloat(prix)
            });
        }
    });

    // Vérifier qu'au moins une ligne de commande est présente
    if (lignesCommande.length === 0) {
        alert("Veuillez ajouter au moins une ligne de commande.");
        return;
    }

    // Appeler la fonction pour mettre à jour la commande
    updateCommande(idCommande, clientId, lignesCommande, dateCommande, statut);
});

// Ouvrir le modal de mise à jour lorsque l'on clique sur le bouton "editOrderBtn"
// La logique pour ouvrir le modal et sélectionner les commandes à mettre à jour
$('#editOrderBtn').on('click', function () {
    const selectedOrders = [];
    $('.selectOrder:checked').each(function () {
        const orderId = $(this).data('order-id');
        if (orderId) {
            selectedOrders.push(orderId);
        }
    });

    // Si aucune commande n'est sélectionnée
    if (selectedOrders.length === 0) {
        alert("Veuillez sélectionner une commande à modifier.");
        return;
    }

    // Par exemple, on prend la première commande sélectionnée pour l'afficher dans le modal
    const selectedOrderId = selectedOrders[0];

    // Utilisez AJAX pour récupérer les détails de la commande à partir du serveur
    $.ajax({
        url: 'get_commande_details.php', // Fichier PHP pour récupérer les détails de la commande
        method: 'GET',
        data: { idCommande: selectedOrderId },
        success: function(response) {
            if (response.success) {
                // Remplir le formulaire du modal avec les données récupérées
                $('#updateOrderId').val(response.commande.IDCommande);
                $('#updateClientId').val(response.commande.IDClient);
                $('#updateOrderDate').val(response.commande.datecommande);
                $('#updateOrderStatus').val(response.commande.statut);

                // Remplir les lignes de commande dans le tableau
                $('#updateOrderLinesTable tbody').empty(); // Vider les anciennes lignes
                response.commande.lignes.forEach(function(ligne) {
                    $('#updateOrderLinesTable tbody').append(`
                        <tr>
                            <td><input type="hidden" class="productId" value="${ligne.IDProduit}">${ligne.nomProduit}</td>
                            <td><input type="number" class="quantity" value="${ligne.quantite}" min="1"></td>
                            <td><input type="text" class="price" value="${ligne.prix}" readonly></td>
                        </tr>
                    `);
                });

                // Ouvrir le modal pour la mise à jour
                const modal = new bootstrap.Modal(document.getElementById('updateOrderModal'));
                modal.show();
            } else {
                alert("Erreur lors de la récupération des détails de la commande.");
            }
        },
        error: function() {
            alert("Erreur lors de la récupération des détails de la commande.");
        }
    });
});
$(document).ready(function() {
    // Fonction pour récupérer et afficher les clients dans le select
    function loadClients() {
        $.ajax({
            url: 'get_clients.php', // L'API qui renvoie la liste des clients
            method: 'GET',
            dataType: 'json',
            success: function(data) {
                if (data.success) {
                    const clientSelect = $('#clientId, #clientSelect, #updateClientId');
                    clientSelect.empty(); // Vider le select avant de le remplir
                    clientSelect.append('<option value="">Tous les clients</option>'); // Ajouter l'option par défaut
                    
                    // Ajouter chaque client à la liste déroulante
                    data.clients.forEach(function(client) {
                        clientSelect.append('<option value="' + client.id + '">' + client.raisonsociale + '</option>');
                    });
                } else {
                    alert('Erreur lors du chargement des clients.');
                }
            },
            error: function(xhr,status,error) {
                alert('Erreur lors de la récupération des clients.'+error);
            }
        });
    }

    // Charger les clients au chargement de la page
    loadClients();
});

    
});
