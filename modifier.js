$(document).ready(function () {
    // Sélectionner une ligne du tableau et la mettre en surbrillance
    $('#ordersTable tbody').on('click', 'tr', function() {
        // Supprimer la classe 'selected' de toutes les lignes
        $('#ordersTable tbody tr').removeClass('selected');
        
        // Ajouter la classe 'selected' à la ligne cliquée
        $(this).addClass('selected');
        const orderId = $(this).data('order-id'); // Récupérer l'ID de la commande
        console.log('Commande sélectionnée, ID:', orderId);
        // Mettre à jour l'attribut du bouton "Modifier"
        $('#editOrderBtn').data('order-id', orderId);

        // Récupérer les informations de la ligne
        var orderNumber = $(this).find('td').eq(1).text(); // Numéro de commande
        var orderDate = $(this).find('td').eq(2).text(); // Date
        var client = $(this).find('td').eq(3).text(); // Client
        var status = $(this).find('td').eq(5).text(); // Statut
        
        // Remplir le modal avec les données de la commande
        $('#orderNumberUpdate').val(orderNumber);
        $('#orderDateUpdate').val(orderDate);
        $('#clientSelectUpdate').val(client); // Assurez-vous que la liste des clients contient les bons choix
        $('#orderStatusUpdate').val(status);

        // Activer le bouton "Modifier" uniquement si une ligne est sélectionnée
        $('#editOrderBtn').prop('disabled', false); // Activer le bouton "Modifier"
    });

    // Charger les clients dans le formulaire de modification
    function loadClientsUpdate() {
        $.ajax({
            url: 'fetch_clients.php',
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                if (Array.isArray(response) && response.length > 0) {
                    $('#clientSelectUpdate').empty().append('<option value="">Sélectionner un client</option>');
                    response.forEach(function(client) {
                        $('#clientSelectUpdate').append(`<option value="${client.id}">${client.raisonsociale}</option>`);
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

    // Charger les produits dans le formulaire de modification
    function loadProductsUpdate() {
        $.ajax({
            url: 'fetch_produits.php',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                const productSelect = $('#productSelectUpdate');
                productSelect.empty();
                productSelect.append('<option value="" disabled selected>Sélectionner un produit</option>');

                if (data && Array.isArray(data)) {
                    data.forEach(function (product) {
                        productSelect.append(`<option value="${product.id}" data-price="${product.prix}">${product.libelle} - ${product.prix} €</option>`);
                    });
                } else {
                    console.error('Erreur: Les données des produits ne sont pas dans le bon format');
                }
            },
            error: function (xhr, status, error) {
                console.error('Erreur lors du chargement des produits : ', error);
            }
        });
    }

    // Ouvrir le modal pour modifier la commande
    $('#updateOrderModal').on('show.bs.modal', function (event) {
        const button = $(event.relatedTarget);
        const orderId = $('#editOrderBtn').data('order-id');  // L'ID de la commande à modifier
        console.log("ID de la commande:" ,orderId);
        
        // Charger les informations de la commande
        $.ajax({
            url: 'get_commande_details.php', // Vous devez avoir un fichier PHP pour récupérer les détails de la commande
            method: 'GET',
            data: { IDCommande: orderId },
            dataType: 'json',
            success: function (response) {
                if (response.success) {
                    const order = response.data;
                    $('#orderNumberUpdate').val(order.numero);
                    $('#orderDateUpdate').val(order.datecommande);
                    $('#orderStatusUpdate').val(order.statut);
                    $('#clientSelectUpdate').val(order.IDClient);

                    // Charger les produits sélectionnés
                    order.lignes.forEach(function(product) {
                        addProductToTableUpdate(product.libelle, product.quantity, product.prix, product.total);
                    });
                    updateGrandTotalUpdate();
                } else {
                    console.log('Erreur lors de la récupération des informations de la commande');
                }
            },
            error: function(xhr, status, error) {
                console.error('Erreur lors de la récupération des détails de la commande : ', error);
            }
        });

        // Charger les clients et les produits
        loadClientsUpdate();
        loadProductsUpdate();
    });

    // Ajouter un produit au tableau
    $('#addProductBtnUpdate').on('click', function () {
        const productId = $('#productSelectUpdate').val();
        const productName = $('#productSelectUpdate option:selected').text();
        const quantity = $('#quantityUpdate').val();
        const price = $('#productSelectUpdate option:selected').data('price');
        const totalLine = price * quantity;

        addProductToTableUpdate(productName, quantity, price, totalLine);
        updateGrandTotalUpdate();
    });

    function addProductToTableUpdate(productName, quantity, price, totalLine) {
        const row = `
            <tr>
                <td>${productName}</td>
                <td>${quantity}</td>
                <td>${price} €</td>
                <td>${totalLine} €</td>
                <td><button type="button" class="btn btn-danger removeProductBtnUpdate">Supprimer</button></td>
            </tr>
        `;
        $('#selectedProductsTableUpdate').append(row);
    }

    // Calculer le total général
    function updateGrandTotalUpdate() {
        let grandTotal = 0;
        $('#selectedProductsTableUpdate tr').each(function () {
            const totalLine = parseFloat($(this).find('td:eq(3)').text().replace(' €', ''));
            grandTotal += totalLine;
        });
        $('#grandTotalUpdate').text(grandTotal.toFixed(2) + ' €');
        $('#totalGeneralInputUpdate').val(grandTotal.toFixed(2));
    }

    // Supprimer un produit du tableau
    $('#selectedProductsTableUpdate').on('click', '.removeProductBtnUpdate', function () {
        $(this).closest('tr').remove();
        updateGrandTotalUpdate();
    });

    // Sauvegarder la commande modifiée
    $('#updateOrderBtn').on('click', function () {
        const orderId = $('#orderNumberUpdate').val();
        const clientId = $('#clientSelectUpdate').val();
        const orderDate = $('#orderDateUpdate').val();
        const orderStatus = $('#orderStatusUpdate').val();
        const products = [];

        $('#selectedProductsTableUpdate tr').each(function () {
            const productName = $(this).find('td:eq(0)').text();
            const quantity = $(this).find('td:eq(1)').text();
            products.push({ productName, quantity });
        });

        const data = {
            orderId: orderId,
            clientId: clientId,
            orderDate: orderDate,
            orderStatus: orderStatus,
            products: products
        };

        $.ajax({
            url: 'update_commande.php',
            method: 'POST',
            data: data,
            success: function (response) {
                alert('Commande modifiée avec succès');
                location.reload(); // Recharger la page pour afficher la commande mise à jour
            },
            error: function (xhr, status, error) {
                console.error('Erreur lors de la modification de la commande : ', error);
            }
        });
    });
});
