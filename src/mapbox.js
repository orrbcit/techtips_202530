import mapboxgl from "mapbox-gl";                     // import the mapbox library
import "mapbox-gl/dist/mapbox-gl.css";                // import the mapbox css
// import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";          // import the geocoder library
// import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";  // import the geocoder css
import { MapboxSearchBox } from '@mapbox/search-js-web';



function showMap() {

    //--------------------------------------------------------------
    // Initialize the Mapbox map
    // With your access token from .env and initial settings
    //--------------------------------------------------------------
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN; // put token in .env
    // BCIT location 49.25324576104826, -123.00163752324765  Centered at BCIT
    const map = new mapboxgl.Map({
        container: "map",                        // <div id="map"></div>
        style: "mapbox://styles/mapbox/streets-v12",// any Mapbox style
        center: [-123.00163752324765, 49.25324576104826],
        zoom: 10
    });

    //------------------------------------------------------------------------
    // Add controls to the map here, and keep things organized
    // You can call additional controls/setup functions from here.
    //------------------------------------------------------------------------
    addControls();
    function addControls() {
        // Add zoom and rotation controls to the map.
        map.addControl(new mapboxgl.NavigationControl());

        // Add other controls here as needed
        addGeolocationControl(map);
        //addGeoCoderControl(map);
        //addSearchBoxControl(map);
        addSearchBoxControlCustom(map);
    }


    //--------------------------------------------------------------
    // Add layers, sources, etc. to the map, and keep things organized.
    // You can call additional layers/setup functions from here.
    // Run setupMap() once when the style loads.
    //--------------------------------------------------------------
    map.once("load", () => setupMap(map)); // run once for the initial style
    function setupMap(map) {
        addUserPin(map);
        //add other layers and stuff here
        //addCustomLayer1(map);
        //addCustomLayer2(map);
        //addCustomLayer3(map);
    }
}
showMap();

//----------------------------------------------------
// Adds the Mapbox Search Box control to the map using Mapbox GL JS
// with custom POI suggestions
//----------------------------------------------------
function addSearchBoxControlCustom(map) {
  const search = new MapboxSearchBox();

  // reuse your token + wire to GL
  search.accessToken = mapboxgl.accessToken;
  search.mapboxgl = mapboxgl;
  search.marker = true;

  // Mapbox API options (bias to center, include POIs)
  search.options = {
    types: 'address,poi',
    country: 'ca',
    proximity: map.getCenter().toArray()
  };

  // ---- 1) your custom places (examples) ----
  // BCIT Parking Lot 7 49.25018869033936, -122.99915767059355
  // BCIT Parking Lot D 49.24796633244321, -122.99919169493681
  // BCIT Parking Lot J 49.245788124997, -123.00204705340452
  const customPOIs = [
    { name: "🚗 BCIT Parking Lot 7", center: [-122.99915767059355, 49.25018869033936,] },
    { name: "🚗 BCIT Parking Lot D", center: [-122.99919169493681, 49.24796633244321] },
    { name: "🚗 BCIT Parking Lot J", center: [-123.00204705340452, 49.245788124997] }
  ];

  // simple case-insensitive contains match (swap for a better fuzzy lib if you want)
  function findCustomMatches(text) {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    return customPOIs
      .filter(p => p.name.toLowerCase().includes(q))
      .map(p => ({
        // Minimal Search Box suggestion shape with geometry:
        name: p.name,                        // shown in the list
        feature_name: p.name,                // also acceptable
        place_formatted: "Custom location",  // subtitle (optional)
        // Required: geometry for when the user selects it
        _geometry: { type: "Point", coordinates: p.center },
        // Optional: tag your source so you can style it differently
        metadata: { source: "custom" }
      }));
  }

  // ---- 2) hook your custom suggestions into Search Box ----
  search.componentOptions = {
    ...search.componentOptions,
    // called for every keystroke; return Promise<array of suggestions>
    customSearch: async (text) => findCustomMatches(text)
  };

  // ---- 3) act on a chosen result (Mapbox or custom) ----
  search.addEventListener("retrieve", (e) => {
    // For custom suggestions, Search JS will use the provided _geometry.
    const [lng, lat] = e.detail.geometry.coordinates;
    map.flyTo({ center: [lng, lat], zoom: 15 });
  });

  map.addControl(search, "top-left");
}

// const bcitCampuses = [
//   // (Use your preferred coords; these are placeholders—fill in your exact ones.)
//   { name: "BCIT Burnaby Campus",   center: [-123.001, 49.250] },
//   { name: "BCIT Downtown Campus",  center: [-123.116, 49.282] },
//   { name: "BCIT Aerospace Campus", center: [-123.146, 49.195] },
//   { name: "BCIT Marine Campus",    center: [-123.088, 49.311] },
//   { name: "BCIT Annacis Island",   center: [-122.949, 49.167] }
// ];

// function bcitLocals(query) {
//   const q = query.trim().toLowerCase();
//   if (!q.includes("bcit")) return [];
//   return bcitCampuses.map((c) => ({
//     type: "Feature",
//     place_name: c.name + " (custom)",
//     place_type: ["poi"],
//     center: c.center,
//     geometry: { type: "Point", coordinates: c.center },
//     properties: { source: "local" },
//     text: c.name
//   }));
// }

//--------------------------------------------------------------------
// Adds the Mapbox Geocoder control to the map using Mapbox GL JS
// You can customize the types of results shown.
//--------------------------------------------------------------------
// function addGeoCoderControl(map) {
//     // Add geocoder control to the map.
//     const geocoder = new MapboxGeocoder({           
//         accessToken: mapboxgl.accessToken,
//         mapboxgl,
//         types: "place,locality,neighborhood,address",
//         countries: "ca",
//         autocomplete: true,
//         localGeocoder: bcitLocals
//     });
//     map.addControl(geocoder, 'top-left');
// }

//----------------------------------------------------
// Adds the Mapbox Search Box control to the map using Mapbox GL JS
// Includes POI search capability. ie, restaurants, shops, etc.
// Zooms to selected place.
//----------------------------------------------------
function addSearchBoxControl(map) {
  const search = new MapboxSearchBox();

  // reuse your existing token
  search.accessToken = mapboxgl.accessToken;

  // make it a proper Mapbox GL control
  search.mapboxgl = mapboxgl;
  search.marker = true; // drop a marker on selection

  // search behavior (now includes POIs - points of interest)
  search.options = {
    types: 'address,poi',     // POIs + addresses
    country: 'ca',            // limit to Canada (same as your "countries: 'ca'")
    proximity: map.getCenter().toArray() // bias to map center
  };

  // optional: react when a place is chosen, eg. to fly to it
  search.addEventListener('retrieve', (e) => {
    const [lng, lat] = e.detail.geometry.coordinates;
    map.flyTo({ center: [lng, lat], zoom: 15 });
  });

  map.addControl(search, 'top-left');
}

//--------------------------------------------------------------------
// Adds geolocation control to the map using Mapbox GL JS
// Mapbox’s GeolocateControl handles the dot + tracking for you.
//--------------------------------------------------------------------
function addGeolocationControl(map) {
    // Add geolocate control to the map.
    const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
    });
    map.addControl(geolocate);
}

//--------------------------------------------------------------------
// Adds a blue circle pin to the map at the user's current location
// using the Geolocation API
// and adds it as a source and layer to the map.
//
// Note: This is a simple example; in practice, you might want to
// update the pin position as the user moves.
// Also, the GeolocateControl above already shows the user's location,
// so this function is optional.
//--------------------------------------------------------------------
function addUserPin(map) {
    // Adds user's current location as a source to the map
    navigator.geolocation.getCurrentPosition(position => {
        const userLocation = [position.coords.longitude, position.coords.latitude];
        if (userLocation) {
            map.addSource('userLocation', {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': userLocation
                        }
                    }]
                }
            });

            // Creates a layer above the map displaying the pin
            map.addLayer({
                'id': 'userLocation',
                'type': 'circle', // what the pins/markers/points look like
                'source': 'userLocation',
                'paint': { // customize colour and size
                    'circle-color': 'blue',
                    'circle-radius': 6,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#ffffff'
                }
            });
            // // Map On Click function that creates a popup displaying the user's location
            // map.on('click', 'userLocation', (e) => {
            //     // Copy coordinates array.
            //     const coordinates = e.features[0].geometry.coordinates.slice();
            //     const description = e.features[0].properties.description;

            //     new mapboxgl.Popup()
            //         .setLngLat(coordinates)
            //         .setHTML(description)
            //         .addTo(map);
            // });

            // // Change the cursor to a pointer when the mouse is over the userLocation layer.
            // map.on('mouseenter', 'userLocation', () => {
            //     map.getCanvas().style.cursor = 'pointer';
            // });

            // // Defaults
            // // Defaults cursor when not hovering over the userLocation layer
            // map.on('mouseleave', 'userLocation', () => {
            //     map.getCanvas().style.cursor = '';
            // });
        }
    });
}