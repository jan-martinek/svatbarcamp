/* globals quotes, markerData, window, document */
var quoteInterval;
var profited = 0;

document.addEventListener("DOMContentLoaded", function(event) {
  document.body.classList.add("js");

  if (document.getElementById('map-brno')) initMap();

  if (document.getElementById('quote-wrapper')) {
    var generateQuote = initQuoteGenerator();
   
    quoteInterval = window.setInterval(function() {
      var q = generateQuote();
      document.getElementById('quote-wrapper').innerHTML = '<blockquote>' + q.quote + '<br><cite>' + q.author + '</cite></blockquote>';
    }, 1000 * 10);

  }

  Array.prototype.slice.call(document.querySelectorAll("dt")).forEach(function(el) {
    el.addEventListener('click', function(e) {
      el.nextElementSibling.classList.toggle("visible");
    });
  });

  document.querySelector("#concept ol").addEventListener("click", function(e) {
    Array.prototype.slice.call(document.querySelectorAll("#concept ol strong")).forEach(function(el) {
      el.innerHTML = '#' + el.innerHTML.replace(/ /g, " #");
    });

    var el = document.createElement("strong");
    el.innerHTML = " #profit";
    document.querySelector("#concept ol").querySelector("li:last-child").appendChild(el);

    profited++;

    if (profited > 6) window.alert('ZOMG MUCH PROFIT!')
  });

});


function initQuoteGenerator() {
  var qGen = new markov(quotes.map(function(q) {return q.quote}).join(" ").toLowerCase().replace(/\./g, ' '), /[AÁBCČDĎEÉĚFGHChIÍJKLMNŇOÓPQRŘSŠTŤUÚŮVWXYÝZŽaábcčdďeéěfghchiíjklmnňoópqrřsštťuúůvwxyýzž']+/g);
  var aGen = new markov(quotes.map(function(q) {return q.author}).join(" ").toLowerCase(), /./g);
  var prob = 0.2;

  return function() {
    prob = prob * 1.1;
    console.log(prob);
    if (Math.random() > prob) {
      return quotes[Math.floor(Math.random()*quotes.length)];
    } else {
      return {
        quote: formatQuote(qGen.gen(Math.ceil(5 + 15 * Math.random()))),
        author: formatAuthor(aGen.gen(Math.ceil(10 + 15 * Math.random())))
      }
    }
  }
}

function formatAuthor(n) {
  return toTitleCase(n.replace(/\|/g, ''));
}

function formatQuote(q) {
  q = q.replace(/\|/g, ' ').trim();
  q = q[0].toUpperCase() + q.slice(1);
  if (q[length - 1] !== '.') q += '.';
  return q;
}

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


// simplified from https://github.com/BrianHicks/Markov-Generator/
function markov(input, reg) {
  this.data = {};
  s = input.match(reg);
  for (var i = 0; i < s.length-1; i++) {
    if(s[i] in this.data) {
      if (s[i+1] in this.data[s[i]]) {
        this.data[s[i]][s[i+1]]++;
      } else {
        this.data[s[i]][s[i+1]] = 1;
      }
    } else {
      this.data[s[i]] = new Object();
      this.data[s[i]][s[i+1]] = 1;
    }
  }
  
  this.gen = function(l) {
    var sanitycheck = false;
    var out = new Array();
    while (sanitycheck == false) {
      sanitycheck = true;
      var rProperty = findRandomProperty(this.data);
      var rList = expand(rProperty);
      var l1 = rList.length;
      out[0] = rList[Math.round(Math.random() * l1)];
      if (typeof out[0] == "undefined") { sanitycheck = false; }
      if (sanitycheck) {
        for (var i = 0; i < l-1; i++) {
          var usableLength = expand(this.data[out[i]]).length-1;
          var randomInt = Math.round(Math.random() * usableLength);
          var nextLetter = expand(this.data[out[i]])[randomInt];
          out.push(nextLetter);
        }
      }
    }

    return out.join("|");
  }
  
  var findRandomProperty = function(o) {
    l1 = 0;
    for (i in o) {
      l1++;
    }
    var r1 = Math.round(Math.random() * l1);
    l2 = 0;
    for (i in o) {
      l2++;
      if (l2 == r1) {
        return o[i];
      }
    }
  }
  
  var expand = function(obj) {
    oArray = new Array();
    for (var prop in obj) {
      for (var i = 0; i < obj[prop]; i++) {
        oArray.push(prop);
      }
    }
    return oArray;
  }
}

function toTitleCase(str) {
  return str.replace( /\w\S*/g, function(txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}