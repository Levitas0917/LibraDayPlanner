-- insert nearest_node
UPDATE pois_lib p
SET nearest_node = v.node_id
FROM (
    SELECT 
        p.gid AS poi_id,  
        (SELECT id 
         FROM ways_vertices_pgr 
         ORDER BY ST_Distance(p.geom::geography, the_geom::geography) 
         LIMIT 1) AS node_id
    FROM pois_lib p
) v
WHERE p.gid = v.poi_id;