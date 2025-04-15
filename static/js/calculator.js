document.addEventListener('DOMContentLoaded', function() {
    // Переконаємося, що HTML-елемент уже існує
    if (!document.getElementById('rocket-info-panel')) {
      // Створюємо інформаційну панель, якщо її ще немає
      const rocketInfoPanel = document.createElement('div');
      rocketInfoPanel.id = 'rocket-info-panel';
      rocketInfoPanel.className = 'rocket-info-panel';
      rocketInfoPanel.innerHTML = `
        <h3>Інформація про ракету</h3>
        <div class="rocket-info-content">
          <div class="rocket-info-image">
            <img id="rocket-photo" src="/api/placeholder/150/150" alt="Фото ракети">
          </div>
          <div class="rocket-info-details">
            <div class="rocket-info-item">
              <span class="info-label">Назва:</span>
              <span id="rocket-name" class="info-value">Не вибрано</span>
            </div>
            <div class="rocket-info-item">
              <span class="info-label">Тип:</span>
              <span id="rocket-type" class="info-value">-</span>
            </div>
            <div class="rocket-info-item">
              <span class="info-label">Походження:</span>
              <span id="rocket-origin" class="info-value">-</span>
            </div>
            <div class="rocket-info-item">
              <span class="info-label">На озброєнні з:</span>
              <span id="rocket-service" class="info-value">-</span>
            </div>
            <div class="rocket-info-item">
              <span class="info-label">Виробник:</span>
              <span id="rocket-manufacturer" class="info-value">-</span>
            </div>
          </div>
        </div>
      `;
      
      // Додаємо до body або іншого контейнера
      document.body.appendChild(rocketInfoPanel);
      
      // Додаємо стилі
      const style = document.createElement('style');
      style.textContent = `
        .rocket-info-panel {
          position: absolute;
          top: 100px;
          right: 20px;
          background: rgba(255, 255, 255, 0.95);
          padding: 15px;
          border-radius: 10px;
          z-index: 1000;
          width: 280px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          display: none; /* Прихований за замовчуванням, показується при виборі ракети */
        }
        
        .rocket-info-panel h3 {
          margin-top: 0;
          margin-bottom: 15px;
          color: #3e5f3e;
          font-size: 18px;
          text-align: center;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 8px;
        }
        
        .rocket-info-content {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .rocket-info-image {
          text-align: center;
          margin-bottom: 10px;
        }
        
        .rocket-info-image img {
          max-width: 100%;
          max-height: 150px;
          object-fit: contain;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
          background-color: #f5f5f5;
        }
        
        .rocket-info-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .rocket-info-item {
          display: flex;
          flex-direction: row;
          line-height: 1.5;
        }
        
        .info-label {
          font-weight: bold;
          width: 40%;
          color: #444;
        }
        
        .info-value {
          width: 60%;
        }
      `;
      document.head.appendChild(style);
    }
  });
  
  // Функція для отримання інформації про ракету
  function fetchRocketInfo(rocketName) {
    // Показуємо панель з інформацією
    document.getElementById('rocket-info-panel').style.display = 'block';
    
    // Отримуємо дані про ракету з API
    fetch(`/api/rocket-info?name=${encodeURIComponent(rocketName)}`)
      .then(response => response.json())
      .then(data => {
        updateRocketInfoPanel(data);
      })
      .catch(error => {
        console.error('Помилка отримання даних про ракету:', error);
        
        // Встановлюємо значення за замовчуванням у разі помилки
        updateRocketInfoPanel({
          name: rocketName,
          photo: '/api/placeholder/150/150',
          type: 'Немає даних',
          origin: 'Немає даних',
          service: 'Немає даних',
          manufacturer: 'Немає даних'
        });
      });
  }
  
  // Функція для оновлення панелі з інформацією про ракету
  function updateRocketInfoPanel(data) {
    document.getElementById('rocket-name').textContent = data.name || 'Невідомо';
    document.getElementById('rocket-type').textContent = data.type || '-';
    document.getElementById('rocket-origin').textContent = data.origin || '-';
    document.getElementById('rocket-service').textContent = data.service || '-';
    document.getElementById('rocket-manufacturer').textContent = data.manufacturer || '-';
    
    // Оновлюємо фото
    const photoElement = document.getElementById('rocket-photo');
    if (data.photo) {
      photoElement.src = data.photo;
      photoElement.alt = data.name;
    } else {
      photoElement.src = '/api/placeholder/150/150';
      photoElement.alt = 'Фото відсутнє';
    }
  }
  
  // Підключаємо до події натискання кнопки "Розрахувати"
  // Функція для підключення обробника подій після завантаження сторінки
  function attachCalculateHandler() {
    const calculateButton = document.querySelector('button[onclick="calculate()"]');
    if (calculateButton) {
      // Зберігаємо оригінальний обробник
      const originalOnClick = calculateButton.onclick;
      
      // Переназначаємо обробник
      calculateButton.onclick = function() {
        // Викликаємо оригінальний обробник, якщо він існує
        if (typeof originalOnClick === 'function') {
          originalOnClick.call(this);
        } else if (typeof calculate === 'function') {
          calculate();
        }
        
        // Отримуємо вибрану ракету
        const rocketSelect = document.getElementById('missile-select');
        if (rocketSelect && rocketSelect.selectedIndex > 0) {
          const selectedRocket = rocketSelect.options[rocketSelect.selectedIndex].text;
          fetchRocketInfo(selectedRocket);
        } else {
          // Приховуємо панель, якщо ракета не вибрана
          const infoPanel = document.getElementById('rocket-info-panel');
          if (infoPanel) {
            infoPanel.style.display = 'none';
          }
        }
      };
    }
  }
  
  // Чекаємо, поки сторінка завантажиться повністю
  document.addEventListener('DOMContentLoaded', attachCalculateHandler);
  // Також пробуємо підключити через невелику затримку, якщо DOM завантажується асинхронно
  setTimeout(attachCalculateHandler, 1000);