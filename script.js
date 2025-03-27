// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FuYWhhc2hpbSIsImEiOiJjbTV5NnpreTcwMTBqMnJvN2ltN2Jjcmo1In0.JpuPVI1IOhbjC1mjNPi5YQ'; 

// Initialize the first map (CanFed Map)
const map_can_fed = new mapboxgl.Map({
    container: "can-fed-map",
    style: 'mapbox://styles/faiza132/cm72f283a007a01quayc2g04v',
    center: [-79.3878583, 43.7205208], // Location [lon, lat] (Mississauga)
    zoom: 12
});

// 1st Map Navigation Controls
map_can_fed.addControl(new mapboxgl.NavigationControl());

map_can_fed.on('load', () => {
    map_can_fed.addSource('transit_data', {
        'type': 'vector',
        'url': "mapbox://faiza132.6pdcyj1q"
    });
    //Layer with symbology
    map_can_fed.addLayer({
        'id': 'transit_buffers',
        'type': 'circle',
        'source': 'transit_data',
        'minzoom': 0,
        'maxzoom': 24,
        'paint': {
            'circle-color': "#f77f00",
            'circle-opacity': 0.9,
            'circle-stroke-color': 'black',
            'circle-radius': 6
        },
        'source-layer': "transit_data-9938bw"

    });
});

// 1st Map Pop-Up
new mapboxgl.Marker()
    .setLngLat([-79.640579, 43.595310])
    .setPopup(new mapboxgl.Popup( 'click', 'transit_buffers'  ).setHTML('<p>Mississauga: High Food Insecurity</p>'))
    .addTo(map_can_fed);

// Initialize the second map (Demographics Map)
var map_dem = new mapboxgl.Map({
    container: 'map2', 
    style: 'mapbox://styles/mapbox/light-v11', 
    center: [-79.640579, 43.595310], // Location [lon, lat] (Mississauga)
    zoom: 10 
});

// 2nd Map Navigation Controls
map_dem.addControl(new mapboxgl.NavigationControl());

// 2nd Map Pop-Up
new mapboxgl.Marker('click', 
                   )
    .setLngLat([-79.640579, 43.595310])
    .setPopup(new mapboxgl.Popup().setHTML('<p>Mississauga: High Population Density</p>'))
    .addTo(map_dem);



    
