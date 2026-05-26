(function(){
    //create pmtiles protocol
    const protocol = new pmtiles.Protocol();
    //assign protocol to map
    maplibregl.addProtocol('pmtiles', protocol.tile);
    //get initial file URL
    const PMTILES_URL = 'data/earth.pmtiles';
    const p = new pmtiles.PMTiles(PMTILES_URL);

    //assign specific file protocol to the map
    protocol.add(p);

    //determine container based on screen size
    let c;
    if (window.innerWidth <= 767)
        c = 'map-m';
    else
       c = 'map-f';

    //function to create map object
    p.getHeader().then(h => {
        let map = new maplibregl.Map({
            container: c,
            zoom: h.minZoom,
            maxZoom:10.5,
            minZoom:2.5,
            scrollZoom:false,
            center: [h.centerLon, h.centerLat],
            style: {
                version: 8,
                sources: {
                    'earth': {
                        type: 'vector',
                        url: `pmtiles://${PMTILES_URL}`,
                        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                    },
                    'rail': {
                        type: 'vector',
                        url: `pmtiles://${'data/rail_routes_simplified.pmtiles'}`,
                        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                    },
                    'disused': {
                        type: 'vector',
                        url: `pmtiles://${'data/rail_disused.pmtiles'}`,
                        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                    },
                    'stops': {
                        type: 'vector',
                        url: `pmtiles://${'data/rail_stops_simplified.pmtiles'}`,
                        attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                    },
                    'boundaries': {
                        type: 'vector',
                        url: `pmtiles://${'data/boundary_lines.pmtiles'}`,
                        attribution: 'Natural Earth'
                    }
                },
                projection: {
                    "type":"vertical-perspective"
                },
                layers: [
                    {
                        'id': "background",
                        'type': "background",
                        'paint': {
                            "background-color": '#efeff5',
                        }
                    },
                    {
                        'id': "earth",
                        'type': "fill",
                        'source': "earth",
                        'source-layer': 'earth',
                        'layout':{
                            'fill-sort-key':1
                        },
                        'paint': {
                            "fill-color": "#d1d1e0",
                            "fill-outline-color":'#29293d'
                        }
                    },
                    {
                        'id': 'rail',
                        'source': 'rail',
                        'source-layer': 'rail',
                        'type': 'line',
                        'layout':{
                            'line-sort-key':5,
                            'line-cap':'round',
                        },
                        'paint': {
                            'line-color':"#8585ad"
                        }
                    },
                    {
                        'id': 'disused',
                        'source': 'disused',
                        'source-layer': 'disused',
                        'type': 'line',
                        'layout':{
                            'line-sort-key':5,
                            'line-cap':'round'
                        },
                        'paint': {
                            'line-color':'#ffffff'
                        }
                    },
                    {
                        'id': 'stops',
                        'source': 'stops',
                        'source-layer': 'stops',
                        'type': 'circle',
                        'layout':{
                            'circle-sort-key':15
                        },
                        'paint': {
                            'circle-color': '#e0e0eb',
                            'circle-radius':3,
                            'circle-stroke-color': '#1f1f2e',
                            'circle-stroke-width':1.5
                        }
                    },
                    {
                        'id': 'stop-labels',
                        'source': 'stops',
                        'source-layer': 'stops',
                        'type': 'symbol',
                        'layout':{
                            'text-field':['get', 'name'],
                            'text-size':12,
                            "text-variable-anchor": ["left"],
                            "text-variable-anchor-offset": [ "left", [0.3,-0.5]],
                            "text-font":["Roboto Mono Bold","monospace"] 
                        },
                        'paint':{
                            'text-color':"#1e1e2f"
                        }
                    },
                    {
                        'id': 'boundaries',
                        'source': 'boundaries',
                        'source-layer': 'boundaries',
                        'type': 'line',
                        'layout':{
                            'line-sort-key':5,
                            'line-cap':'round',
                            'visibility':'none'
                        },
                        'paint': {
                            'line-color':"#ffffff",
                            'line-dasharray':[2,4]
                        }
                    }
                ]
            }
        });
        // Add zoom and rotation controls to the map.
        map.addControl(new maplibregl.NavigationControl({
            showZoom: true
        }));
        if (window.innerWidth < 767){
            map.scrollZoom.disable();
            map.setZoom(2)
        }
        //add fullscreen button
        map.addControl(new maplibregl.FullscreenControl());        
        //add legend
        class legendControl extends maplibregl.LogoControl{
            onAdd(map) {
                this._map = map;
                this._container = document.createElement('div');
                this._container.className = 'legend';
                this._container.innerHTML = '<p><b class="use-rail">—————</b> Rail in Use <br> <b class="disused-rail">—————</b> Disused Rail</p>';
                return this._container;
            }
        
            onRemove() {
                this._container.remove();
                this._map = undefined;
            }
        }
        map.addControl(new legendControl({
            position: "bottom-left"
        }))
        //zoom control for place buttons
        document.querySelectorAll('.place-button').forEach(function(elem){
            elem.addEventListener('click',function(){
                map.flyTo({
                    center: [
                        elem.dataset.lon,
                        elem.dataset.lat
                    ],
                    zoom:elem.dataset.zoom,
                    essential: true // this animation is considered essential with respect to prefers-reduced-motion
                });
            })
        })
    });
})();