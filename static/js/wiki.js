function toggleRocketInfo(rocketId) {
    const rocketElement = document.getElementById(rocketId);
    const rocketCard = rocketElement.closest('.rocket-card');
    const toggleIcon = rocketCard.querySelector('.toggle-icon');

    if (rocketElement.style.display === 'none') {
      rocketElement.style.display = 'block';
      toggleIcon.style.transform = 'rotate(180deg)';
    } else {
      rocketElement.style.display = 'none';
      toggleIcon.style.transform = 'rotate(0deg)';
    }
  }