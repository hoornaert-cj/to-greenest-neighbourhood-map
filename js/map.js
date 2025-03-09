document.addEventListener("DOMContentLoaded", function () {
    // Initialize the map only once inside DOMContentLoaded
    var map = L.map('map').setView([43.6659, -79.4148], 13);

    // Add tile layer
    L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key=22685591-9232-45c7-a495-cfdf0e81ab86', {
        maxZoom: 18,
        attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    }).addTo(map);

    // Ensure the map resizes correctly
    setTimeout(() => {
        map.invalidateSize();
    }, 500);

    console.log(document.getElementById("map")); // Debugging: Check if #map exists
});

function getColor(rank) {
    return rank <= 20 ? '#1a9641' :
           rank <= 40 ? '#a6d96a' :
           rank <= 60 ? '#ffffbf' :
           rank <= 80 ? '#fdae61' :
           rank <= 100 ? '#d7191c' :
                         '#800026';
}

L.geoJSON(geojsonData, {
    style: function (feature) {
        return {
            fillColor: getColor(feature.properties.Rank),
            weight: 1,
            opacity: 1,
            color: 'white',
            fillOpacity: 0.7
        };
    }
}).addTo(map);
