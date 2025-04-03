// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1IjoiZmFpemExMzIiLCJhIjoiY201d3E1Y2JwMDByYzJrb290MWltMTN1dyJ9.JsEiKVuT3vMCT8JQDlDA4g';

// Initialize the first map (CanFed Map)
const map_can_fed = new mapboxgl.Map({
    container: "map1",
    style: 'mapbox://styles/faiza132/cm72f283a007a01quayc2g04v',
    center: [-79.640579, 43.595310], // Location [lon, lat] (Mississauga)
    zoom: 10
});

// 1st Map Navigation Controls
map_can_fed.addControl(new mapboxgl.NavigationControl());

map_can_fed.on('load', () => {
    map_can_fed.addSource('can_fed', {
        type: 'geojson',
        data: "https://raw.githubusercontent.com/faizachwd/GGR472-Final-Project/refs/heads/main/can_fed.geojson"
    });

    //can fed layer
    map_can_fed.addLayer({
        'id': 'can_fed_da',
        'type': 'fill',
        'source': 'can_fed',
        'paint': {
            'fill-outline-color': 'black',
            'fill-color': [
                'step',
                ['get', 'mRFEI_cat_ON'],
                '#B3C3D1', // Default color for values <1 but there should be no values
                1.0, '#EE6055', // Values >= 1 
                2.0, '#D59967', // Values >= 2 
                3.0, '#C8B570', // Values >= 3 
                4.0, '#BBD178'  // Values >= 4 
            ]
        },
    });
});

// 1st Map Pop-Up
map_can_fed.on('click', 'can_fed_da', (e) => {
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML("<b>DA ID: </b>" + e.features[0].properties['dauid'] + "<br>" + '<b>mRFEI: </b>' + e.features[0].properties['mRFEI_cat_ON'])
        .addTo(map_can_fed);
});

// Initialize the second map (Demographics Map)
const map_dem = new mapboxgl.Map({
    container: 'map2',
    style: 'mapbox://styles/mapbox/light-v11',
    center: [-79.640579, 43.595310], // Location [lon, lat] (Mississauga)
    zoom: 10
});

fetch('https://raw.githubusercontent.com/faizachwd/GGR472-Final-Project/refs/heads/main/bus_stops.geojson')

// creating map event inside fetch so that all data has loaded before the map begins
    .then(response => response.json())
    .then(response => {

        bus_data = response
        map_dem.on('load', () => {
            let evnresult = turf.envelope(bus_data);

            let bbox = turf.transformScale(evnresult, 1.1);

            // accessing and store the bounding box coordinates as an array variable
            let bbox_coords = [
                bbox.geometry.coordinates[0][0][0],
                bbox.geometry.coordinates[0][0][1],
                bbox.geometry.coordinates[0][2][0],
                bbox.geometry.coordinates[0][2][1]
            ]

            let hexdata = turf.hexGrid(bbox_coords, 0.5, { units: "kilometers" });

            //creating hexagons and collecting how many bus stops per hexagon
            let bushex = turf.collect(hexdata, bus_data, 'Stop_Numbe', 'values');

            bushex.features.forEach((feature) => {
                feature.properties.COUNT = feature.properties.values.length
            });

            map_dem.addSource('hexgrid', {
                type: 'geojson',
                data: bushex
            });

            map_dem.addSource('age', {
                type: 'geojson',
                data: "https://raw.githubusercontent.com/faizachwd/GGR472-Final-Project/refs/heads/main/age.geojson"
            });

            map_dem.addSource('mother_tongue', {
                type: 'geojson',
                data: "https://raw.githubusercontent.com/faizachwd/GGR472-Final-Project/refs/heads/main/mother_tongue.geojson"
            });

            map_dem.addSource('da_boundaries', {
                type: 'geojson',
                data: "https://raw.githubusercontent.com/faizachwd/GGR472-Final-Project/refs/heads/main/da_boundaries.geojson"
            });

            map_dem.addSource('bus_stops', {
                type: 'geojson',
                data: "https://raw.githubusercontent.com/faizachwd/GGR472-Final-Project/refs/heads/main/bus_stops.geojson"
            });

            //da boundaries added to base map to make bus stops stand out
            map_dem.addLayer({
                'id': 'da',
                'type': 'line',
                'source': 'da_boundaries',
                'paint': {
                    'line-color': 'rgb(32, 33, 32)',
                    'line-width': 1.3
                },
                'layout': { 'visibility': 'visible' },
            });

            //bus stops
            map_dem.addLayer({
                'id': 'bus',
                'type': 'circle',
                'source': 'bus_stops',
                'layout': { 'visibility': 'visible' },
                'paint': {
                    'circle-opacity': 0.6,
                    'circle-color': '#ffbe0b',
                    'circle-stroke-color': 'rgb(0, 0, 0)',
                    'circle-stroke-width': 0.1,
                    'circle-radius': 3
                },
            });

            //transit hex grid
            map_dem.addLayer({
                'id': 'Transit',
                'type': 'fill',
                'source': 'hexgrid',
                'paint': {
                    'fill-color': 'rgb(152, 211, 144)',
                    'fill-opacity': 0.9,
                    'fill-outline-color': 'black',
                },
                'layout': { 'visibility': 'none' },  //intial layer visibility set to none so the button can toggle it
                filter: ["!=", "COUNT", 0]
            });


            //mother tongue layer
            map_dem.addLayer({
                'id': 'Mother Tongue',
                'type': 'fill',
                'source': 'mother_tongue',
                'layout': { 'visibility': 'none' },  //intial layer visibility set to none so the button can toggle it
                'paint': {
                    'fill-outline-color': 'black',
                    'fill-color': [
                        'step',
                        ['get', "Residents that who speak a non official language as a first language (%):"],
                        '#F4D3C4', // default, 0 to 19% inclusive 
                        20.0, "#F0B1A0", // 20 to 39% inclusive
                        40.0, "#DC725E", // 40 to 59% inclusive
                        60.0, "#B84A36", // 60 to 79% inclusive
                        80.0, "#973220", // >= 80 
                    ]
                },
            });

            //age layer
            map_dem.addLayer({
                'id': 'Age',
                'type': 'fill',
                'source': 'age',
                'layout': { 'visibility': 'none' },  //intial layer visibility set to none so the button can toggle it
                'paint': {
                    'fill-outline-color': 'black',
                    'fill-color': [
                        'step',
                        ['get', "Population above 65 (%)"], 
                        '#67A4CE', // default, 0 to 4% inclusive 
                        5.0, "#8DBCDB", // 5 to 9% inclusive
                        10.0, "#A6CBE3", // 10 to 14% inclusive
                        15.0, "#B7B5C7", // 15 to 19% inclusive
                        20.0, "#C0A7B6", // 20 to 29% inclusive
                        30.0, "#DD9298", // 30 to 59% inclusive
                        60.0, "#D4737B", // 60 to 89% inclusive
                        90.0, "#C5444F", // >= 90%
                    ]
                },
            });

            //layer to show number of bus stops in each hex
            map_dem.addLayer({
                id: 'bus_labels',
                type: 'symbol',
                source: 'hexgrid',
                layout: {
                    'text-field': ['to-string', ['get', 'COUNT']], // Pulls number of stops from GeoJSON
                    'text-font': ['DIN Offc Pro Bold', 'Arial Unicode MS Bold'],
                    'text-size': 10,
                    'visibility': 'none' //intial layer visibility set to none so the button can toggle it
                },
                paint: {
                    'text-color': 'black'
                },
                filter: ["!=", "COUNT", 0]
            });

        });
    });


// Wait for the DOM to fully load before running the script
// buttons for controlling layres
document.addEventListener('DOMContentLoaded', () => {
    // Layer toggle functionality for static buttons
    document.getElementById('toggle-age').addEventListener('click', function () {
        toggleLayer(['Age'], this);
    });

    document.getElementById('toggle-mother-tongue').addEventListener('click', function () {
        toggleLayer(['Mother Tongue'], this);
    });

    document.getElementById('toggle-transit').addEventListener('click', function () {
        toggleLayer(['Transit', 'hexline', 'bus_labels'], this);
    });

    function toggleLayer(layerIds, button) {

        layerIds.forEach(layerId => {
            const visibility = map_dem.getLayoutProperty(layerId, 'visibility');

            if (visibility === 'visible') {
                map_dem.setLayoutProperty(layerId, 'visibility', 'none');
                button.classList.remove('active');
            } else {
                map_dem.setLayoutProperty(layerId, 'visibility', 'visible');
                button.classList.add('active');
            }
        })
    }
});


// 2nd Map Navigation Controls
map_dem.addControl(new mapboxgl.NavigationControl());

//2nd map pop-ups

map_dem.on('click', 'Age', (e) => {
    console.log(e.features[0].properties['GEO_NAME'])
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML("<b>DA ID: </b>" + e.features[0].properties['GEO_NAME'] + "<br>"
            + '<b>Population Above 65 (%): </b>' + e.features[0].properties['Population above 65 (%)'] + "<br>"
            + '<b>Average Age: </b>' + e.features[0].properties['Average age'])
        .addTo(map_dem);
});

map_dem.on('click', 'Mother Tongue', (e) => {
    console.log(e.features[0].properties)
    new mapboxgl.Popup()
        .setLngLat(e.lngLat)
        .setHTML("<b>DA ID: </b>" + e.features[0].properties['GEO_NAME'] + "<br>" +
            '<b>Residents that speak a non official language as a first language (%): </b>' +
            e.features[0].properties['Residents that who speak a non official language as a first language (%):'].toFixed(2))
        .addTo(map_dem);
});

//syncs maps
syncMaps(map_can_fed, map_dem)