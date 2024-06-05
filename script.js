// Création de la carte, vu par défaut au dessus de Paris
var mymap = L.map('mapid').setView([48.8566, 2.3522], 12);

// Création d'un cluster de point pour un affichage plus clair
let markers = new L.MarkerClusterGroup();

function map () {

    // URL de l'API a interroger
    const apiUrl = 'https://api.jcdecaux.com/vls/v3/stations?apiKey=e0a1bf2c844edb9084efc764c089dd748676cc14';

    // Utilisation de fetch pour envoyer une requête GET à l'API
    fetch(apiUrl)
        .then(response => {
            // Vérification si la requête a réussi (code 200)
            if (!response.ok) {
                throw new Error('La requête a échoué');
            }
            // Conversion de la réponse en JSON
            return response.json();
        })
        .then(data => {
            // Traitement des données récupérées

            //Suppression de l'ancien cluster
            markers.clearLayers();

            // Ajouter une couche de tuiles OpenStreetMap à la carte
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mymap);


            // Boucle sur l'ensemble des donneés pour afficher les points
            data.forEach(station => {

                // Récupération des coordonnées de la station
                let longitude = station.position.longitude;
                let latitude = station.position.latitude;

                // Récupération du nombre de vélos mécanique de la station et préparation pour l'affichage
                let mechanical = (station.mainStands.availabilities.mechanicalBikes <= 10) ? station.mainStands.availabilities.mechanicalBikes : '10+';

                // Récupération du nombre de vélos électrique de la station et préparation pour l'affichage
                let electrical = (station.mainStands.availabilities.electricalBikes <= 10) ? station.mainStands.availabilities.electricalBikes : '10+';

                // Création du marqueur
                let marker = L.marker([latitude, longitude], {
                    icon: new L.DivIcon({
                        className: 'my-div-icon',
                        // Mise en forme des informations sur la vignette du marqueur
                        iconAnchor: [25, 50],
                        // Décalage de l'ancrage de la vignette pour correspondre aux coordonnées
                        html:   '<div class="containerPin">' +
                                    '<img class="imagePin" src="https://img.icons8.com/ios-filled/50/map-pin.png" alt="map-pin"/>' +
                                    '<div id="containerInfoPin">' +
                                        '<div class="infoPin">' +
                                            '<img src="https://img.icons8.com/hatch/64/settings-3.png" alt="settings-3"/>' +
                                            `<span>${mechanical}</span>` +
                                        '</div>' +
                                        '<div class="infoPin">' +
                                            '<img src="https://img.icons8.com/parakeet-line/48/full-battery.png" alt="full-battery"/>' +
                                            `<span>${electrical}</span>` +
                                        '</div>' +
                                    '</div>' +
                                '</div>'
                    })
                });

                // Récupération du statut de la station
                let statut = (station.status === 'OPEN') ? 'Ouvert' : 'Fermée';

                // Récupération des informations de paiement de la station
                let banking = (station.banking === true) ? 'Oui' : 'Non';

                // Calcul du nombre total de vélos de la station
                let totalVelo = station.mainStands.availabilities.electricalBikes + station.mainStands.availabilities.mechanicalBikes

                // Préparation des informations de capacité de la station
                let capacity = totalVelo + ' / ' + station.mainStands.capacity

                // Mise en forme des informations de la popup
                let popup = L.popup({
                    offset: [0, -50]
                }).setContent(
                    '<div class="containerPopup">' +
                        '<h3>' + station.address + '</h3>' +
                        `<div class="containerStatut">${statut}</div>` +
                        '<div class="containerBanking">' +
                            '<span class="dataTitle">Borne de paiment :</span>' +
                            `<span class="dataData">${banking}</span>` +
                        '</div>' +
                        '<div class="containerCapacity">' +
                            '<span class="dataTitle">Capacité :</span>' +
                            `<span class="dataData">${capacity}</span>` +
                        '</div>' +
                    '</div>')

                // Ajout de la popup au point
                marker.bindPopup(popup);

                // Ajoout du point au cluster de points
                markers.addLayer(marker);
            });
            // Ajout du cluster à la carte
            mymap.addLayer(markers);

            setTimeout(map,60000);
        })
        .catch(error => {
            // Gestion des erreurs
            console.error('Une erreur s\'est produite:', error);
        });
}

map();