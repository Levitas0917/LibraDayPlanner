# LibraDay Planner

## Overview
LibraDay Planner is an interactive web application designed to help users explore public libraries and nearby points of interest (POIs) in Hong Kong. The application provides modules such as selected POI visualization, route templates loading, and customizable timetable, all integrated into a user-friendly interface powered by Leaflet.js.


## Project Structure
```
LibraDayPlanner
├── api
│   ├── db_connect.php
│   └── getUserLayer.php
├── data
│   ├── hongkong.geojson
│   ├── libraries.json
│   ├── restaurant_selected.geojson
│   ├── parks.json
│   └── swimming_pool.json
├── js
│   └── main.js
├── css
│   └── style.css
├── index.html
└── README.md
```

## Modules
- **Interactive Map**: Displays public library locations and nearby POIs with pop-up information window using Leaflet.js.
- **POIs Visualization**: Users can select and display only the selected POIs.
- **Route Templates Loading**: Users can view preset routes by selecting the LibraDay route mode.
- **Timetable Editor**: Users can edit and save daily study-life templates as CSV file.

## Setup Instructions
1. **Server Configuration**: Ensure that a server capable of handling PHP files is set up (e.g., XAMPP, WAMP).
2. **Database Connection**: Configure the database connection in `api/db_connect.php` to connect to your database.
3. **File Structure**: Maintain the project structure as shown above to ensure all files are correctly linked.
4. **Run the Application**: Open `index.html` in a web browser to access the application.

## Usage Guidelines
- Click the library icon to see its name and address on pop-up window.
- Click the "Edit" in Library Selection module to start library select session
- Select a library from the map and click "Load" to finish select session.
- Check the boxes for nearby facilities to filter POIs you want to show on the map to view their locations and pop-up information.
- Same steps as library select session, but to select 2 points in this session.
- Choose a route template to generate a recommended study plan.
- Change the timetable template and edit for your own. Save your timetable as CSV file.

## Acknowledgments
This project utilizes Leaflet.js for mapping and GeoJSON for geographical data representation. Thanks to the contributors of the OpenStreetMap project for providing the base map data.
