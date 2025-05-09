// filepath: c:\webGIS\geog7311_project_package_1\_programs\xampp\htdocs\Labs\LibraDayPlanner\js\main.js

/////////// Initialize the map centered on Hong Kong //////////////////////////////////////////////////////////////////////////////////////////////////////////
const map = L.map('map').setView([22.3193, 114.1694], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);


///////// Load libraries from GeoJSON ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Layer groups for libraries and selected library
let libraryLayer = L.featureGroup().addTo(map);
let selectedLibraryLayer = L.layerGroup().addTo(map);

// Variable to store the selected library
let selectedLibrary = null;

fetch('/Labs/LibraDayPlanner/data/libraries.json')
  .then(response => response.json())
  .then(data => {
    const libraries = L.geoJSON(data, {
      pointToLayer: (feature, latlng) => {
        // extract latitude and longitude from properties
        const lat = parseFloat(feature.properties.LATITUDE);
        const lng = parseFloat(feature.properties.LONGITUDE);
        // use circle marker for library icons
        return L.circleMarker([lat, lng], {  
          className: 'library-icon',
          radius: 8,
          fillColor: '#0078a8',
          color: '#fff',
          weight: 1,
          opacity: 1,
          fillOpacity: 0.8
        });
      },
      onEachFeature: (feature, layer) => {
        const { NAME_EN, ADDRESS_EN } = feature.properties;
        layer.bindPopup(`<b>${NAME_EN}</b><br>${ADDRESS_EN}`);

        // Add click event to select a library during selection session
        layer.on('click', () => {
          if (isEditing) {
              // Highlight the selected library
              // if (selectedLibrary) {
              //     selectedLibrary.setStyle({ fillColor: '#0078a8' }); // Reset previous selection
              // }
              // layer.setStyle({ fillColor: '#ff7800' }); // Highlight current selection
              selectedLibrary = layer;
              alert(`Selected Library: ${NAME_EN}`);
          }
        });
      }
    });
    // Add the libraries to the libraryLayer
    libraryLayer.addLayer(libraries);

    map.fitBounds(libraries.getBounds());
  })
  .catch(error => console.error('Error loading libraries:', error));


//////////// Libraries Selection Session //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Variable to track if editing mode is active
let isEditing = false;

// Handle "Edit" button click
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('editLibraryBtn').addEventListener('click', () => {
    isEditing = true;
    alert('Selection session started. Click on a library marker to select it.');
  });

// Handle "Load" button click
  document.getElementById('loadLibraryBtn').addEventListener('click', () => {
    if (!selectedLibrary) {
      alert('Please select a library first.');
      return;
    }

    // Clear all layers except the selected library
    libraryLayer.clearLayers();
    selectedLibraryLayer.clearLayers();

    // Add the selected library to a new layer
    selectedLibraryLayer.addLayer(selectedLibrary);
    //selectedLibrary.bindPopup(`<b>${NAME_EN}</b><br>${ADDRESS_EN}`).openPopup();

    // Disable editing mode
    isEditing = false;
    alert('Library selection completed.');
  });
});



///////////// Load User History //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
async function loadUserHistory() {
  try {
      const username = document.getElementById('username').value;
      if (!username) throw new Error("Please input username");

      // Clear old layers
      if (window.currentPathLayer) {
          map.removeLayer(window.currentPathLayer);
          window.currentPathLayer = null;
      }

      // Send request
      const response = await fetch('/Labs/LibraDayPlanner/api/getUserLayer.php?username=' + encodeURIComponent(username));
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error);

      // Add new layers
      const pathLayerName = `travel:${data.pathLayer}`;

      window.currentPathLayer = L.tileLayer.wms('http://localhost:8080/geoserver/travel/wms', {
          layers: pathLayerName,
          format: 'image/png',
          transparent: true,
          version: '1.3.0',
          t: Date.now()
      }).addTo(map);

      // Force map redraw
      map.invalidateSize();

  } catch (error) {
      console.error('Error:', error);
      alert(`Failed to load history: ${error.message}`);
  }
}



/////////////// POI Loading and Selection /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// poiLayers group
const poiLayers = {
  restaurant: L.featureGroup(),
  park: L.featureGroup(),
  swim: L.featureGroup()
};

// Add POI layers to the map
Object.values(poiLayers).forEach(layer => layer.addTo(map));

// Load POI data based on different type
function loadPOI(type) {
  const fileMap = {
      restaurant: 'restaurant_selected.geojson',
      park: 'parks.json',
      swim: 'swimming_pool.json'
  };

  fetch(`/Labs/LibraDayPlanner/data/${fileMap[type]}?t=${Date.now()}`)
      .then(response => response.json())
      .then(data => {
          const layer = L.geoJSON(data, {
              pointToLayer: (feature, latlng) => {
                  const color = getColorByType(type);
                  const radius = getRadiusByType(type);
                  const lat = parseFloat(feature.properties.LATITUDE);
                  const lng = parseFloat(feature.properties.LONGITUDE);
                  return L.circleMarker([lat, lng], {
                      className: 'poi-icon',
                      radius: radius,
                      fillColor: color,
                      color: '#000',
                      weight: 1,
                      fillOpacity: 0.9
                  });
              },
              onEachFeature: (feature, layer) => {
                  const { NAME_EN, ADDRESS_EN } = feature.properties;
                  layer.bindPopup(`<b>${NAME_EN}</b><br>${ADDRESS_EN}`);

                  // Add click event to each POI marker
                  layer.on('click', () => {
                    if (isPOISelecting) {
                      handlePOISelection(layer, feature.properties.NAME_EN);
                    }
                  });
              }
          });
          
          // Clear previous layers of the same type
          poiLayers[type].clearLayers();
          poiLayers[type].addLayer(layer);
          
      })
      .catch(error => console.error(`Error loading ${type} data:`, error));
}

// set radius by type
function getRadiusByType(type) {
  const radii = {
      restaurant: 4,  
      park: 6,        
      swim: 6       
  };
  return radii[type] || 5;  // default radius
}

// set color by type
function getColorByType(type) {
  const colors = {
      restaurant: '#f9a48a',  
      park: '#2dab60',        
      swim: '#1e90ff'         
  };
  return colors[type] || '#0078a8';  
}

// Add event listeners to checkboxes
document.querySelectorAll('.poi-type').forEach(checkbox => {
  checkbox.addEventListener('change', function() {
      if (this.checked) {
          loadPOI(this.value);
      } else {
          poiLayers[this.value].clearLayers();
      }
  });
});


function handlePOISelection(layer, name) {
  // Check if the layer is already selected
  if (!isPOISelecting) return;
  
  if (selectedPOIs.includes(layer)) {
    // Deselect the marker
    selectedPOIs = selectedPOIs.filter(poi => poi !== layer);
    alert(`POI deselected: ${name}`);
  } else if (selectedPOIs.length < 2) {
    // Select the marker
    selectedPOIs.push(layer);
    alert(`POI selected: ${name}`);
  } else {
    alert('You can only select up to 2 POI points.');
  }
}

// Variables to store selected POIs
let selectedPOIs = [];
let isPOISelecting = false;

// Handle "Edit POI" button click
document.getElementById('editPOIBtn').addEventListener('click', () => {
  isPOISelecting = true;
  selectedPOIs = []; // Reset selected POIs
  alert('Selection session started. Click on POI markers to select up to 2 points.');
});

// Handle "Load POI" button click
document.getElementById('loadPOIBtn').addEventListener('click', () => {
  console.log('Selected POIs:', selectedPOIs); 
  if (selectedPOIs.length !== 2) {
    alert('Please select exactly 2 POI points.');
    return;
  }

  // Clear all POI layers except the selected ones
  Object.values(poiLayers).forEach(layer => layer.clearLayers());
  selectedPOIs.forEach(marker => marker.addTo(map));

  isPOISelecting = false;
  alert('POI selection completed.');
});


///////////// Route Template ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.getElementById('loadRouteBtn').addEventListener('click', () => {
  const route = document.getElementById('routeTemplate').value;

  const routeLayer = L.tileLayer.wms('http://localhost:8080/geoserver/travel/wms', {
      layers: `travel:${route}`,
      format: 'image/png',
      transparent: true,
  }).addTo(map);

  map.invalidateSize();
});




////////////// Timetable Editor ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
document.addEventListener('DOMContentLoaded', () => {
  const templateSelect = document.getElementById('templateSelect');
  const editableCells = document.querySelectorAll('.editable');
  const exportBtn = document.querySelector('.export-csv-btn');

  // preset templates
  const templates = {
    study: ['Reciting  08:00-09:00', 'Reading 09:20-10:00', 'Mini Test 15:20-18:00', 'Recreation 18:00-19:00'],
    fitness: ['Morning Run', 'Lunch Meal', 'Gym Session', 'Stretching'],
    balanced: ['Study Session', 'Out Lunch', 'Swimming', 'Reading']
  };

  // select template
  templateSelect.addEventListener('change', (e) => {
    const template = templates[e.target.value];
    if (template) {
      editableCells.forEach((cell, index) => {
        cell.textContent = template[index] || '';
      });
    }
  });

  // CSV export function
  function exportToCSV() {
    const csvContent = [
      ['Period', 'Task'], // CSV header
      ...Array.from(document.querySelectorAll('tr')).slice(1).map(row => [
        row.cells[0].textContent,
        row.cells[1].textContent
      ])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", "timetable.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export button event listener
  exportBtn.addEventListener('click', exportToCSV);

  // 'Enter' key to move to the next cell
  editableCells.forEach(cell => {
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const nextRow = cell.parentElement.nextElementSibling;
        if (nextRow) nextRow.querySelector('.editable').focus();
      }
    });
  });
});
