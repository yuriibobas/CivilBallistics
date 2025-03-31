$(document).ready(function () {
    var map = L.map('map').setView([50.4501, 30.5234], 13); // Київ
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    var marker;
    var selectedLatLng = null;
    var circles = [];

    // Додавання маркера при кліку на карту
    map.on('click', function (e) {
        if (marker) {
            map.removeLayer(marker);
        }
        marker = L.marker(e.latlng).addTo(map);
        selectedLatLng = e.latlng;
    });

    // Функція для відображення помилок
    function showError(message) {
        $('#result').html(`<div style="color: red">${message}</div>`);
    }

    // Завантаження списку ракет
    function loadRockets() {
        $.ajax({
            url: '/get_rockets',
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                let select = $('#rocketSelect');
                select.empty();
                
                if (data && data.length > 0) {
                    data.forEach(rocket => {
                        select.append(`<option value="${rocket[0]}">${rocket[1]}</option>`);
                    });
                    $('#calculateButton').prop('disabled', false);
                } else {
                    select.append(`<option value="">Ракети не знайдено</option>`);
                    $('#calculateButton').prop('disabled', true);
                    showError("Не вдалося завантажити дані ракет. Спробуйте оновити сторінку.");
                }
            },
            error: function(xhr, status, error) {
                console.error("Помилка завантаження списку ракет:", error);
                showError("Не вдалося завантажити дані ракет. Спробуйте оновити сторінку.");
                $('#rocketSelect').append(`<option value="">Помилка завантаження</option>`);
                $('#calculateButton').prop('disabled', true);
            }
        });
    }

    // Викликаємо функцію завантаження при старті
    loadRockets();

    // Обчислення радіусів небезпеки
    $('#calculateButton').click(function () {
        if (!selectedLatLng) {
            alert("Будь ласка, виберіть точку на карті!");
            return;
        }

        let rocketId = $('#rocketSelect').val();
        if (!rocketId) {
            alert("Будь ласка, виберіть ракету!");
            return;
        }

        $.ajax({
            url: `/get_rocket/${rocketId}`,
            type: 'GET',
            dataType: 'json',
            success: function(data) {
                if (!data) {
                    showError("Не вдалося отримати дані вибраної ракети.");
                    return;
                }
                
                let explosionPower = data[3]; // Вибухова сила

                $.ajax({
                    url: '/calculate_safety',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        lat: selectedLatLng.lat,
                        lon: selectedLatLng.lng,
                        explosion_power: explosionPower
                    }),
                    success: function (response) {
                        // Видаляємо попередні кола
                        circles.forEach(circle => map.removeLayer(circle));
                        circles = [];

                        // Додаємо нові кола
                        response.zones.forEach(function (zone) {
                            var circle = L.circle([selectedLatLng.lat, selectedLatLng.lng], {
                                radius: zone.outer_radius,
                                color: zone.color,
                                fillColor: zone.color,
                                fillOpacity: 0.4
                            }).addTo(map);
                            circles.push(circle);
                        });

                        $('#result').html(`
                            <b>Ракета:</b> ${data[1]}<br>
                            <b>Швидкість:</b> ${data[2]} м/с<br>
                            <b>Вибухова сила:</b> ${explosionPower}<br>
                            <b>Дальність:</b> ${data[4]} м<br>
                            <b>Радіус червоної зони:</b> ${response.zones[0].outer_radius} м<br>
                            <b>Радіус жовтої зони:</b> ${response.zones[1].outer_radius} м<br>
                            <b>Радіус зеленої зони:</b> ${response.zones[2].outer_radius} м
                        `);
                    },
                    error: function(xhr, status, error) {
                        console.error("Помилка розрахунку зон:", error);
                        showError("Помилка під час розрахунку зон безпеки.");
                    }
                });
            },
            error: function(xhr, status, error) {
                console.error("Помилка отримання даних ракети:", error);
                showError("Не вдалося отримати дані вибраної ракети.");
            }
        });
    });
});
