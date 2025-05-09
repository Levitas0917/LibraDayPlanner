-- 创建包含路径几何和属性的表 testpath
CREATE TABLE path_intensive_study AS
WITH 
-- 1. 定义严格按顺序访问的节点数组
poi_order AS (
  SELECT ARRAY(
    SELECT nearest_node 
    FROM pois_lib 
    WHERE gid IN (44, 555, 536)
    ORDER BY CASE gid  -- 强制按指定顺序排列
      WHEN 44 THEN 1
      WHEN 555 THEN 2
      WHEN 536 THEN 3
    END
  ) AS node_sequence
),
-- 2. 生成路径分段
paths AS (
  SELECT 
    path_id,
    path_seq,
    edge,
    (SELECT the_geom FROM ways WHERE gid = edge) AS geom
  FROM pgr_dijkstraVia(
    'SELECT gid AS id, source, target, cost, reverse_cost FROM ways',
    (SELECT node_sequence FROM poi_order),  -- 按顺序的节点数组
    directed := TRUE,
    U_turn_on_edge := FALSE  -- 禁止在同一路段掉头
  )
),
-- 3. 按路径顺序合并几何
ordered_geom AS (
  SELECT 
    path_id,
    ST_Multi(ST_Collect(geom ORDER BY path_seq))::geometry(MultiLineString, 4326) AS geom
  FROM paths
  GROUP BY path_id
)
-- 4. 最终合并并生成连续路径
SELECT 
  ROW_NUMBER() OVER (ORDER BY path_id) AS path_id,  -- 生成连续ID
  ST_LineMerge(ST_Collect(geom ORDER BY path_id)) AS geom  -- 合并为单一几何
FROM ordered_geom
GROUP BY path_id;  -- 关键：按 path_id 分组