COPY pois_lib("DATASET_EN", "NAME_EN", "ADDRESS_EN", "LATITUDE", "LONGITUDE")
FROM 'C:\webGIS\geog7311_project_package_1\_programs\xampp\htdocs\Labs\LibraDayPlanner\data\swimming_pools.csv' 
WITH (
    FORMAT CSV,
    HEADER TRUE,
    ENCODING 'UTF8',
    DELIMITER ',',
    NULL ''
);