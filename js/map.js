var map;
var geoJsonLayer;
let top5 = [];
let bottom5 = [];

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

    // Fetch neighbourhood GeoJSON and add it to the map
    fetch('data/to-neighbourhoods.geojson')
        .then(response => response.json())
        .then(data => {
            console.log(data);

            if (data && data.type === 'FeatureCollection') {
                const sorted = data.features.sort((a, b) => a.properties.rank - b.properties.rank);

                top5 = sorted.slice(0, 5);
                bottom5 = sorted.slice(-5);

                geoJsonLayer = L.geoJSON(data, {
                    style: function (feature) {
                        return {
                            fillColor: getColor(feature.properties.rank),
                            color: 'white',
                            weight: 1.5,
                            opacity: 1,
                            fillOpacity: 0.9
                        };
                    },
                    onEachFeature: function (feature, layer) {
                        layer.bindTooltip(feature.properties.AREA_NAME + ' (Rank: ' + feature.properties.rank + ')', {
                            permanent: false,
                            direction: "top",
                            className: "neighbourhood-tooltip"
                        });

                        layer.on({
                            mouseover: function (e) {
                                e.target.setStyle({
                                    fillColor: '#FEFFBE',
                                    fillOpacity: 0.45,
                                    dashArray: '5, 5'
                                });
                            },
                            mouseout: function (e) {
                                geoJsonLayer.resetStyle(e.target);
                                updateStyles();
                            }
                        });
                    }
                }).addTo(map);

                // Add event listeners for checkboxes inside the DOMContentLoaded listener
                document.getElementById("top5").addEventListener("change", updateStyles);
                document.getElementById("bottom5").addEventListener("change", updateStyles);

                map.fitBounds(geoJsonLayer.getBounds());
            } else {
                console.error('Invalid GeoJSON data');
            }
        })
        .catch(error => console.error('Error loading GeoJSON', error));
});

    function getColor(rank) {
        return rank <= 20 ? '#005522' :
               rank <= 40 ? '#0B6838' :
               rank <= 60 ? '#178B4B' :
               rank <= 80 ? '#219D57' :
               rank <= 100 ? '#2DAF64' :
               rank <= 120 ? '#3AC078' :
                             '#4D9966';
    }

    function updateStyles() {
        geoJsonLayer.eachLayer(layer => {
            let feature = layer.feature;

            if (document.getElementById("top5").checked && top5.some(f => f.properties.AREA_NAME === feature.properties.AREA_NAME)) {
                layer.setStyle({
                    color: 'gold',
                    weight: 6
                });
            } else if (document.getElementById("bottom5").checked && bottom5.some(f => f.properties.AREA_NAME === feature.properties.AREA_NAME)) {
                layer.setStyle({
                    fillColor:  'rgba(0, 0, 0, 0.5)',
                    color: 'yellow',
                    weight: 6,

                });
            } else {
                layer.setStyle({
                    color: 'white',
                    weight: 1.5
                });
            }
        });
    }
