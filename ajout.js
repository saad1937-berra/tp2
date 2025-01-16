$(document).ready(function () {
    // Charger les produits dans le formulaire d'ajout
    function chargerProduits() {
        $.ajax({
            url: 'fetch_produits.php',
            method: 'GET',
            dataType: 'json',
            success: function (data) {
                const productSelect = $('#productSelectAdd');
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

    // Ajouter un produit sélectionné au tableau
    $('#addProductBtn').on('click', function () {
        const productId = $('#productSelectAdd').val();
        const productName = $('#productSelectAdd option:selected').text();
        const quantity = $('#quantityAdd').val();
        const price = $('#productSelectAdd option:selected').data('price');
        const totalLine = price * quantity;

        const row = `
            <tr>
                <td data-id="${productId}">${productName}</td>
                <td>${quantity}</td>
                <td>${price} €</td>
                <td>${totalLine} €</td>
                <td><button type="button" class="btn btn-danger removeProductBtn">Supprimer</button></td>
            </tr>
        `;
        $('#selectedProductsTable').append(row);
        updateGrandTotal();
    });

    // Calculer le total général
    function updateGrandTotal() {
        let grandTotal = 0;
        $('#selectedProductsTable tr').each(function () {
            const totalLine = parseFloat($(this).find('td:eq(3)').text().replace(' €', ''));
            grandTotal += totalLine;
        });
        $('#grandTotal').text(grandTotal.toFixed(2) + ' €');
        $('#totalGeneralInput').val(grandTotal.toFixed(2));
    }

    // Supprimer un produit du tableau
    $('#selectedProductsTable').on('click', '.removeProductBtn', function () {
        $(this).closest('tr').remove();
        updateGrandTotal();
    });

    // Ajouter la commande au serveur
    $('#saveOrderBtn').on('click', function () {
        const clientId = $('#clientSelectAdd').val();
        const orderDate = $('#orderDate').val();
        const orderStatus = $('#orderStatus').val();
        const orderNumber = $('#orderNumber').val();
        const products = [];

        $('#selectedProductsTable tr').each(function () {
            const productId = $(this).find('td:eq(0)').data('id');
            const quantity = $(this).find('td:eq(1)').text();
            const price = $(this).find('td:eq(2)').text().replace(' €', '');
            products.push({
                IDProduit: productId,
                quantity: quantity,
                prix: price
            });
        });

        const data = {
            clientId: clientId,
            numero: orderNumber,
            datecommande: orderDate,
            statut: orderStatus,
            produits: products
        };

        $.ajax({
            url: 'add_commande.php',
            method: 'POST',
            data: data,
            success: function (response) {
                if (response.status === 'success') {
                    alert('Commande ajoutée avec succès');
                    location.reload();  // Recharger la page pour voir la commande ajoutée
                } else {
                    alert('Erreur lors de l\'ajout de la commande : ' + response.message);
                }
            },
            error: function (xhr, status, error) {
                console.error('Erreur lors de l\'ajout de la commande : ', error);
            }
        });
    });

    // Charger les produits lors du chargement de la page
    chargerProduits();

    // Charger les clients dans le filtre "Client"
    function loadClients() {
        $.ajax({
            url: 'fetch_clients.php',
            method: 'GET',
            dataType: 'json',
            success: function(response) {
                if (Array.isArray(response) && response.length > 0) {
                    $('#clientSelectAdd').empty().append('<option value="">Sélectionner un client</option>');
                    response.forEach(function(client) {
                        $('#clientSelectAdd').append('<option value="'+ client.id +'">'+ client.raisonsociale +'</option>');
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
    loadClients();
});
