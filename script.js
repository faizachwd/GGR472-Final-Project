// Mapbox access token
mapboxgl.accessToken = 'pk.eyJ1Ijoic2FuYWhhc2hpbSIsImEiOiJjbTV5NnpreTcwMTBqMnJvN2ltN2Jjcmo1In0.JpuPVI1IOhbjC1mjNPi5YQ'; 

// Initialize the first map (CanFed Map)
var map1 = new mapboxgl.Map({
    container: 'map1', 
    style: 'mapbox://styles/mapbox/streets-v12', 
    center: [-79.640579, 43.595310], // Location [lon, lat] (Mississauga)
    zoom: 10 
});

// 1st Map Navigation Controls
map1.addControl(new mapboxgl.NavigationControl());

// 1st Map Pop-Up
new mapboxgl.Marker()
    .setLngLat([-79.640579, 43.595310])
    .setPopup(new mapboxgl.Popup().setHTML('<p>Mississauga: High Food Insecurity</p>'))
    .addTo(map1);

// Initialize the second map (Demographics Map)
var map2 = new mapboxgl.Map({
    container: 'map2', 
    style: 'mapbox://styles/mapbox/light-v11', 
    center: [-79.640579, 43.595310], // Location [lon, lat] (Mississauga)
    zoom: 10 
});

// 2nd Map Navigation Controls
map2.addControl(new mapboxgl.NavigationControl());

// 2nd Map Pop-Up
new mapboxgl.Marker()
    .setLngLat([-79.640579, 43.595310])
    .setPopup(new mapboxgl.Popup().setHTML('<p>Mississauga: High Population Density</p>'))
    .addTo(map2);