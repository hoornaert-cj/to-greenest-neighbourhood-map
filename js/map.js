var map;
var geoJsonLayer;
// let top5 = [];
// let bottom5 = [];

// map.addLayer(top5Layer);
// map.addLayer(bottom5Layer);
// map.removeLayer(top5Layer);
// map.removeLayer(bottom5Layer);

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

                        let popupContent =
                        `<img src="images/maple-leaf.svg" alt="Maple Leaf" style="display: block; margin: 0 auto; width: 1.5rem; height: 1.5rem;">
                        <strong>${feature.properties.AREA_NAME}</strong><br>
                        Rank: ${feature.properties.rank} <br>
                        Green Space: ${feature.properties["pct-green"]}%`;

                        layer.bindPopup(popupContent);

                        layer.on({
                            mouseover: function (e) {
                                e.target.setStyle({
                                    fillColor: '#FEFFBE',
                                    fillOpacity: 0.45,
                                    dashArray: '5, 5'
                                });
                            },
                            mouseout: function (e) {
                                // Ensure geoJsonLayer is defined before calling resetStyle
                                if (typeof geoJsonLayer !== 'undefined') {
                                    geoJsonLayer.resetStyle(e.target);
                                }
                            },

                            click: function(e) {
                                e.target.setStyle({
                                    weight: 0,
                                    color: "transparent",
                                    stroke: false
                                });

                                // Prevent Leaflet from adding focus styles
                                setTimeout(() => {
                                    document.activeElement.blur();
                                }, 0);
                            }
                        });
                    }
                }).addTo(map);

                // Add event listeners for checkboxes inside the DOMContentLoaded listener
                document.getElementById("top5").addEventListener("change", function() {
                    if (this.checked) {
                        addTop5Markers();
                    } else {
                        removeTop5Markers();
                    }
                });

                document.getElementById("bottom5").addEventListener("change", function() {
                    if (this.checked) {
                        addBottom5Markers();
                    } else {
                        removeBottom5Markers();
                    }
                });
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
               rank <= 140 ? '#44e08cff' :
                             '#4dffa0ff';
    }

    let top5Layer = L.layerGroup();
    let bottom5Layer = L.layerGroup();

    function addTop5Markers() {
        top5Layer.clearLayers();
        top5.forEach(feature => {
            let centroid = turf.centroid(feature);
            let coords = centroid.geometry.coordinates;

            let icon = L.icon({
                iconUrl: `images/top5-rank${feature.properties.rank}.svg`,
                iconSize: [36, 36],
                iconAnchor: [16, 32],
                popupAnchor: [0, 0]
            });


            let marker = L.marker([coords[1], coords[0]], { icon: icon });
            top5Layer.addLayer(marker);
        });

        map.addLayer(top5Layer);  // ✅ Ensure the layer is added to the map
    }

    // Toggle checkbox behavior
    document.getElementById("top5").addEventListener("change", function() {
        if (this.checked) {
            addTop5Markers();
        } else {
            map.removeLayer(top5Layer);
        }
    });

    function addBottom5Markers() {
        bottom5Layer.clearLayers();
        bottom5.forEach(feature => {
            let rank = feature.properties.rank;
            let bottomRank = 159 - rank;

            let centroid = turf.centroid(feature); // Get centroid
            let coords = centroid.geometry.coordinates; // Extract coordinates

            let icon = L.icon({
                iconUrl: `images/bottom5-rank${feature.properties.rank}.svg`,
                iconSize: [36, 36],
                iconAnchor: [16, 32],
                popupAnchor: [0, 0]
            });


            let marker = L.marker([coords[1], coords[0]], { icon: icon });
            bottom5Layer.addLayer(marker);
        });

        map.addLayer(bottom5Layer);  // ✅ Ensure the layer is added to the map
    }

    // Toggle checkbox behavior
    document.getElementById("bottom5").addEventListener("change", function() {
        if (this.checked) {
            addBottom5Markers();
        } else {
            map.removeLayer(bottom5Layer);
        }
    });
//     function updateStyles() {
//     geoJsonLayer.eachLayer(layer => {
//         let feature = layer.feature;
//         let icon;  // Initialize icon variable

//         // Check if the layer is a marker (this ensures setIcon can be applied)
//         if (layer instanceof L.Marker) {
//             // Check if the feature is in the Top 5
//             if (document.getElementById("top5").checked && top5.some(f => f.properties.AREA_NAME === feature.properties.AREA_NAME)) {
//                 let rank = top5.find(f => f.properties.AREA_NAME === feature.properties.AREA_NAME).properties.rank;
//                 // Check if the rank is between 1 and 5
//                 if (rank >= 1 && rank <= 5) {
//                     icon = L.icon({
//                         iconUrl: `images/top5-rank${rank}.svg`,  // Use forward slashes for file path
//                         iconSize: [32, 32],
//                         iconAnchor: [16, 32],
//                         popupAnchor: [0, -32]
//                     });
//                 }
//             }
//             // Check if the feature is in the Bottom 5
//             else if (document.getElementById("bottom5").checked && bottom5.some(f => f.properties.AREA_NAME === feature.properties.AREA_NAME)) {
//                 let rank = bottom5.find(f => f.properties.AREA_NAME === feature.properties.AREA_NAME).properties.rank;
//                 // Reverse the rank order for bottom 5
//                 let bottomRank = 159 - rank;  // Adjust this if the rank range is different
//                 // Check if the rank is between 1 and 5 for Bottom 5
//                 if (bottomRank >= 1 && bottomRank <= 5) {
//                     icon = L.icon({
//                         iconUrl: `images/bottom5-rank${bottomRank}.svg`,  // Use forward slashes for file path
//                         iconSize: [32, 32],
//                         iconAnchor: [16, 32],
//                         popupAnchor: [0, -32]
//                     });
//                 }
//             }

//             // If an icon is determined, set it to the marker
//             if (icon) {
//                 console.log(`Setting icon: ${icon.options.iconUrl}`);  // Debugging line
//                 layer.setIcon(icon);
//             }
//         }
//     });
// }
