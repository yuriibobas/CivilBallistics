$(document).ready(function () {
    const map = L.map('map', {
        zoomControl: false,
        maxZoom: 20
      }).setView([50.4501, 30.5234], 7);
    L.control.zoom({
      position: 'bottomleft'
    }).addTo(map);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  
    let marker;
    let selectedLatLng = null;
    let circles = [];
  
    map.on('click', function (e) {
      if (marker) map.removeLayer(marker);
      marker = L.marker(e.latlng).addTo(map);
      selectedLatLng = e.latlng;
    });
  
    function loadRockets() {
      const select = $('#missile-select');
      select.empty();
      fetch('/get_mongo_rockets')
        .then(res => res.json())
        .then(data => {
          if (data && data.length > 0) {
            select.append(`<option value="">-- Виберіть --</option>`);
            data.forEach(rocket => {
              if (rocket.Назва) {
                const option = document.createElement("option");
                option.value = rocket._id;
                option.textContent = rocket.Назва;
                select.append(option);
              }
            });
          }
        });
    }
  
    loadRockets();
  
    window.calculate = function () {
      const missileId = document.getElementById("missile-select").value;
      if (!marker) {
        alert("Будь ласка, виберіть точку на мапі.");
        return;
      }
      if (!missileId) {
        alert("Будь ласка, оберіть ракету.");
        return;
      }
      const { lat, lng } = marker.getLatLng();
      fetch(`/get_mongo_rocket/${missileId}`)
        .then(res => res.json())
        .then(data => {
          const rocketName = data.Назва || 'Невідома';
          const speed = parseFloat(data['Швидкість м/с'] || 0);
          const explosionPower = parseFloat(
            data.Вибухова_сила ||
            data['Вибухова сила кт'] ||
            0
          );
          const range = parseFloat(data['Операційна дальність'] || 0);
  
          if (!explosionPower || isNaN(explosionPower) || explosionPower <= 0) {
            alert("У ракети немає даних про вибухову силу.");
            return;
          }
  
          fetch('/calculate_safety', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              lat: lat,
              lon: lng,
              explosion_power: explosionPower
            })
          })
            .then(res => res.json())
            .then(response => {
              const [red, yellow, green] = response.zones;
              circles.forEach(c => map.removeLayer(c));
              circles = [];
  
              const scaleFactor = 0.05;
  
              circles.push(L.circle([lat, lng], {
                color: red.color,
                fillColor: red.color,
                fillOpacity: 0.3,
                radius: red.outer_radius * scaleFactor
              }).addTo(map));
  
              circles.push(L.circle([lat, lng], {
                color: yellow.color,
                fillColor: yellow.color,
                fillOpacity: 0.2,
                radius: yellow.outer_radius * scaleFactor
              }).addTo(map));
  
              circles.push(L.circle([lat, lng], {
                color: green.color,
                fillColor: green.color,
                fillOpacity: 0.1,
                radius: green.outer_radius * scaleFactor
              }).addTo(map));
  

              map.setView([lat, lng], 18);
  
              const infoBox = document.getElementById("info-box");
              infoBox.style.display = 'block';
              infoBox.innerHTML = `
                <strong>Розрахунок:</strong><br>
                Координати: ${lat.toFixed(5)}, ${lng.toFixed(5)}<br>
                Ракета: ${rocketName}<br>
                Швидкість: ${speed} м/с<br>
                Вибухова сила: ${explosionPower} кт<br>
                Дальність: ${range} км<br>
                Радіус червоної зони: ${Math.round(red.outer_radius * scaleFactor)} м<br>
                Радіус жовтої зони: ${Math.round(yellow.outer_radius * scaleFactor)} м<br>
                Радіус зеленої зони: ${Math.round(green.outer_radius * scaleFactor)} м
              `;
            });
        });
    }
  });