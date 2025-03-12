mapboxgl.accessToken = "pk.eyJ1IjoiZmFpemExMzIiLCJhIjoiY201d3E1Y2JwMDByYzJrb290MWltMTN1dyJ9.JsEiKVuT3vMCT8JQDlDA4g";
const map_can_fed = new mapboxgl.Map({
    container: "can-fed-map",
    style: 'mapbox://styles/faiza132/cm72f283a007a01quayc2g04v',
    center: [-79.3878583, 43.7205208],
    zoom: 12
});

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