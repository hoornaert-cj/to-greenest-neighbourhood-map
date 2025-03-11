var map; // Declare map globally

document.addEventListener("DOMContentLoaded", function () {
    // Initialize the map only once
    if (!map) {
        map = L.map('map').setView([43.6659, -79.4148], 13);

        // Add tile layer
        L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key=22685591-9232-45c7-a495-cfdf0e81ab86', {
            maxZoom: 18,
            attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
        }).addTo(map);

        // Ensure the map resizes correctly
        setTimeout(() => {
            map.invalidateSize();
        }, 500);
    }

    // Fetch GeoJSON and add it to the map
    fetch('data/to-neighbourhoods.geojson')
        .then(response => response.json())
        .then(data => {
            console.log(data); // Check if data is loaded correctly

            if (data && data.type === 'FeatureCollection') {
                // Add GeoJSON to map
                var geoJsonLayer = L.geoJSON(data, {
                    style: function(feature) {
                        return {
                            fillColor: getColor(feature.properties.rank),
                            color: 'white',
                            weight: 1.5,
                            opacity: 1,
                            fillOpacity: 0.9
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        layer.on({
                            mouseover: function(e) {
                                var layer = e.target;
                                layer.setStyle({
                                    fillColor: '#12263A',
                                    fillOpacity: 0.7,
                                    dashArray: '5, 5',
                                    lineCap: 'round',
                                    lineJoin: 'round'
                                });
                            },
                            mouseout: function(e) {
                                geoJsonLayer.resetStyle(e.target);
                            }
                        });
                    }

                });

                geoJsonLayer.addTo(map);

            } else {
                console.error('Invalid GeoJSON data');
            }
        })
        .catch(error => console.error('Error loading GeoJSON', error));
});

// Define the getColor function before the GeoJSON fetch
function getColor(rank) {
    return rank <= 20 ? '#005522 ' :
           rank <= 40 ? '#0B6838' :
           rank <= 60 ? '#178B4B' :
           rank <= 80 ? '#219D57' :
           rank <= 100 ? '#2DAF64' :
           rank <= 120 ? '#3AC078' :
                                    '#4D9966 ';
}
