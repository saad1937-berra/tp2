$(document).ready(function () {
    // Charger les clients dans le select
function loadClients() {
    $.ajax({
        url: 'getClientsById.php',
        method: 'GET',
        success: function (response) {
            // Vérifier si la réponse contient des erreurs
            if (response.error) {
                alert('Erreur: ' + response.error);
                return;
            }

            const clients = JSON.parse(response);
            clients.forEach(client => {
                $('#clientSelect').append(`<option value="${client.id}">${client.raisonsociale}</option>`);
            });
        },
        error: function () {
            alert('Erreur lors du chargement des clients.');
        }
    });
}

// Charger les produits dans le select
function loadProducts() {
    $.ajax({
        url: 'getProductsById.php',
        method: 'GET',
        success: function (response) {
            // Vérifier si la réponse contient des erreurs
            if (response.error) {
                alert('Erreur: ' + response.error);
                return;
            }

            const products = JSON.parse(response);
            products.forEach(product => {
                $('#productSelect').append(
                    `<option value="${product.id}" data-price="${product.prix}">${product.nom}</option>`
                );
            });
        },
        error: function () {
            alert('Erreur lors du chargement des produits.');
        }
    });
}

    // Ouvrir le modal pour ajouter une commande
    $('#btnNouveau').on('click', function () {
        $('#modalAddOrder').modal('show'); // Affiche le modal
        $('#clientSelect').empty().append('<option value="">Sélectionner un client</option>');
        $('#productSelect').empty().append('<option value="">Sélectionner un produit</option>');
        $('#quantity').val('');
        $('#totalPrice').val('');
        loadClients();
        loadProducts();
    });

    // Calculer le prix total en fonction de la quantité et du produit sélectionné
    $('#quantity, #productSelect').on('input', function () {
        const selectedProduct = $('#productSelect option:selected');
        const unitPrice = parseFloat(selectedProduct.data('price')) || 0;
        const quantity = parseFloat($('#quantity').val()) || 0;
        const totalPrice = unitPrice * quantity;
        $('#totalPrice').val(totalPrice.toFixed(2));
    });

    // Sauvegarder la commande
    $('#saveOrderBtn').on('click', function () {
        const clientId = $('#clientSelect').val();
        const productId = $('#productSelect').val();
        const quantity = $('#quantity').val();
        const totalPrice = $('#totalPrice').val();

        if (!clientId || !productId || !quantity) {
            alert('Veuillez remplir tous les champs.');
            return;
        }

        $.ajax({
            url: 'addOrder.php',
            method: 'POST',
            data: {
                clientId: clientId,
                productId: productId,
                quantity: quantity,
                totalPrice: totalPrice
            },
            success: function () {
                alert('Commande ajoutée avec succès.');
                $('#modalAddOrder').modal('hide');
                // Rechargez la liste des commandes ici si nécessaire
            },
            error: function () {
                alert('Erreur lors de l\'ajout de la commande.');
            }
        });
    });
});