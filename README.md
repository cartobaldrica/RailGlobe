# RailGlobe

Behold, the behind-the-scenes of RAILGLOBE! 

How this map was made
---------------------

Here I describe step-by-step how this map was made. While I have taken care to make the language accessible, and describe my process in detail, I assume some familiarity with geospatial data and cartography. If you just are intersted in accessing our data, check out the [download](#download) section.

This map was created using a variety of free and open-source (FOSS) data and technologies, including [OpenStreetMap (OSM)](https://www.openstreetmap.org/#map=3/39.84/-91.93) and [Overpass](https://overpass-turbo.eu/) (the OSM API), [OSMPythonTools](https://github.com/mocnik-science/osm-python-tools), [QGIS](https://qgis.org/), [ProtoMaps](https://protomaps.com/), [PMTiles](https://docs.protomaps.com/pmtiles/), [TippeCanoe](https://github.com/felt/tippecanoe), and [MapLibre](https://maplibre.org/maplibre-gl-js/docs/).

Rail globe is primarily comprised to two datasets, passenger stops and railways.

**Passenger Stop Data**

Passenger stops were acquired using a custom Python script built using the OSMPythonTools library. The script goes country-by-country searching for railway stations (`railway=station` within OSM), and excluding a variety of other station types, such as light rail, tram, monorail, and subway. While these may be added in the future, they were deemed beyond scope for this iteration of the project.

The script creates a .json file with all the passenger stops. This file was then brought into QGIS, and many of the attribute fields were removed to reduce file size. That said, the diversity of languages and information about the passenger stops in the fully dataset is amazing, and there provide useful insights. For the purposes of this project however, a reduction of file size to reduce load-time in the browser was the priority.

Finally, the stop data were converted into a pmtiles file using tippecanoe for seamless viewing in the browser.

_Step-by-Step:_

1\. Extract data using the [stops\_scraper.py](data/processing/stops_scraper.py) script.

2\. Remove irrelevant fields from .json.

3\. Convert from .json to .pmtiles using tippecanoe using the following parameters:  
`tippecanoe -z11 -Z2 -B6 --projection=EPSG:4326 -o rail_stops.pmtiles -l stops rail_stops.geojson.`

**Railway Data**

Railway data were acquired through ProtoMaps, which aggregates OSM data into a single file that can be queried. Due to the amount of railways across the globe, it was useful to have a straightforward way to make simple queries on a global scale. Unlike the passenger stops, the railway data represent the `>railway=rail` with no exclusions.

Within protomaps, rail is only visible beginning at zoom 12, and at this level much of the hyperlocal detail is excluded—acceptable for our purpose. Protomaps also uses different attribute tags, with rail identifiable using `kind=rail`. To begin the process, I generated a protomaps file at zoom level 12, then extracted railways from the file. This produced a .pmtiles file which I then converted into .json and simplified to 5% of nodes. This file was then converted back into a .pmtiles file.

_Step-by-Step:_

1\. Extract protomaps full-world file with a min-zoom 12 (which is the zoom when railroads appear), using the [.pmtiles](https://github.com/protomaps/PMTiles) executable. This Produces a file approx. 10 GB: `./pmtiles extract https://build.protomaps.com/20260422.pmtiles planet_z12.pmtiles —minzoom=12 --maxzoom=12`

2\. Filter railways using the [tile-join](https://github.com/felt/tippecanoe#tile-join) plugin of tippecanoe: `tile-join -j '{"*":["all",["==","kind","rail"]]}' -f -o rail.pmtiles planet_z12.pmtiles`

3\. Extract a .json file: `tippecanoe-decode rail.pmtiles -c > rail.json`

4\. Simplify rail.json using [mapshaper](https://mapshaper.org/) to 5% using the Douglas-Peucker algorithm. This will make it load much faster.

5\. Delete all but the first 5 attribute fields.

6\. While these data are quite comphrensive, there are some important features missing. Specifically, narrow-gauge railways, and disused railways, which are both important parts of the story. These supplemental data were acquired using [overpass-turbo](https://overpass-turbo.eu/). The query for narrow-gauge rails, with the interface zoomed out to the whole globe, was: `[out:json][timeout:500]; nwr["railway"="narrow_gauge"]({{bbox}}); out geom;`. For disused railways, the query was: `[out:json][timeout:500]; nwr["railway"="disused"]({{bbox}}); out geom;`

7\. After generating the data, export each query as a .geojson.

8\. Simplify each .geojson using [mapshaper](https://mapshaper.org/) to 5% using the Douglas-Peucker algorithm..

9\. In QGIS, add a field named "kind" for each file. For the narrow\_gauge railways, set the value to "ng", for the disused railways, set the value to "du". This will allow these subtypes to be stylized differently than the main rail.

11\. Copy all features from both files into the rail.json file.

12\. Delete unnecessary attributes from the file. We remved everything except the "fid" and "kind" attributes. It is now ready to be converted!

13\. Convert the rail.json file into .pmtiles: `tippecanoe -z10 -Z2 --coalesce-densest-as-needed --projection=EPSG:4326 -o rail_routes.pmtiles -l rail rail_routes.geojson`

14\. The .pmtiles file is now ready to use!

Note: our own data seperate the used and disused railways into seperate .pmtiles files. This was done to reduce file size so the site can be served using GitHub Pages.