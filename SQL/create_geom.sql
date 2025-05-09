-- 创建geom
-- 添加WGS84几何字段
ALTER TABLE pois_lib 
ADD COLUMN geom geometry(Point, 4326);

ALTER TABLE pois_lib ADD COLUMN geom geometry(Point, 4326);
UPDATE pois_lib 
SET geom = ST_SetSRID(ST_MakePoint("LONGITUDE", "LATITUDE"), 4326);