const clockEl = document.getElementById('clock');

function updateClock() {
    clockEl.textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', hour12: false});
}

updateClock();
setInterval(updateClock, 1000);