$(document).ready(function () {
    // Supprimer une commande
    $('#deleteOrderBtn').on('click', function () {
        const selectedOrderId = $('input[name="orderCheckbox"]:checked').val();

        if (!selectedOrderId) {
            alert('Veuillez sélectionner une commande à supprimer');
            return;
        }

        if (confirm('Êtes-vous sûr de vouloir supprimer cette commande ?')) {
            $.ajax({
                url: 'delete_commande.php',
                method: 'POST',
                data: { orderId: selectedOrderId },
                success: function (response) {
                    alert('Commande supprimée avec succès');
                    location.reload();
                },
                error: function (xhr, status, error) {
                    console.error('Erreur lors de la suppression de la commande : ', error);
                }
            });
        }
    });
});
