document.addEventListener("DOMContentLoaded", function(event) {
  if (document.getElementById('map-brno')) initMap();
});

function initMap() {
  var map = L.map('map-brno', {
    scrollWheelZoom: false
  }).setView([49.19595883560527, 16.605845689773563], 16);

  this.eventIcon = L.icon({
      iconUrl: '/event.png',
      iconSize:     [40, 37], // size of the icon
      iconAnchor:   [20, 18], // point of the icon which will correspond to marker's location
  });
  
  this.jidloIcon = L.icon({
      iconUrl: '/jidlo.png',
      iconSize:     [40, 40], // size of the icon
      iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
  });

  var markerGroup = L.featureGroup().addTo(map).on("click", groupClick);

  // completed on the fly in _default/baseof.html
  markerData.forEach(function(g) {
    var marker = L.marker([g.lat, g.long], {icon: this[g.icon + 'Icon'] });
    marker.name = g.name;
    marker.addTo(markerGroup);
  });

  var layer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
     attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
     subdomains: 'abcd',
     minZoom: 0,
     maxZoom: 20,
     ext: 'png'
  });

  map.addLayer(layer);
}

function groupClick(event) {
  var el = document.getElementById('place-' + event.layer.name);
  if (el) {
    var prevTarget = document.querySelector('.leaflet-marker-icon.active');
    if (prevTarget) prevTarget.classList.remove('active');

    var target = event.sourceTarget._icon;
    target.classList.add('active');

    var prev = document.querySelector('.map-descriptions .active');
    if (prev) prev.classList.remove('active');
    el.classList.add('active');
  }
}