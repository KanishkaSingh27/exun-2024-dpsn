
const alertContainer = document.getElementById("alert-container");

document.addEventListener("DOMContentLoaded", function() {
    const sidebar = document.getElementById("sidebar");
    const openSidebarButton = document.getElementById("openSidebar");
    const closeSidebarButton = document.getElementById("closeSidebar");
    const tempSlider = document.getElementById("tempSlider");
    const oxygenSlider = document.getElementById("oxygenSlider");
    const salinitySlider = document.getElementById("salinitySlider");
    const phSlider = document.getElementById("phSlider");
    const tempValue = document.getElementById("tempValue");
    const oxygenValue = document.getElementById("oxygenValue");
    const salinityValue = document.getElementById("salinityValue");
    const phValue = document.getElementById("phValue");
    const applyLevelsButton = document.getElementById("applyLevels");

    openSidebarButton.onclick = () => sidebar.style.right = "0";
    closeSidebarButton.onclick = () => sidebar.style.right = "-350px";

    tempSlider.oninput = () => tempValue.textContent = tempSlider.value;
    oxygenSlider.oninput = () => oxygenValue.textContent = oxygenSlider.value;
    salinitySlider.oninput = () => salinityValue.textContent = salinitySlider.value;
    phSlider.oninput = () => phValue.textContent = phSlider.value;

    applyLevelsButton.onclick = function() {
        temperatureLevel = parseFloat(tempSlider.value);
        oxygenLevel = parseFloat(oxygenSlider.value);
        salinityLevel = parseFloat(salinitySlider.value);
        phLevel = parseFloat(phSlider.value);
        sidebar.style.right = "-350px";
    };

    let temperatureLevel = 10, oxygenLevel = 50, salinityLevel = 35, phLevel=7.2;
    let prevTemperatureLevel = temperatureLevel, prevOxygenLevel = oxygenLevel, prevSalinityLevel = salinityLevel;
    const labels = [], temperatureData = [], oxygenData = [], salinityData = [];
    const anomalyThresholds = { temperature: 5.0, oxygen: 8.0, salinity: 6.0 };

    const ctx = document.getElementById('predictionChart').getContext('2d');
    const liveChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: "Temperature (°C)", data: temperatureData, borderColor: "rgb(255, 204, 0)", borderWidth: 2, fill: false },
                { label: "Oxygen Level (%)", data: oxygenData, borderColor: "rgb(75, 192, 192)", borderWidth: 2, fill: false },
                { label: "Salinity Level (PSU)", data: salinityData, borderColor: "rgb(54, 162, 235)", borderWidth: 2, fill: false }
            ]
        },
        options: {
            animation: false,
            scales: { x: { title: { display: true, text: "Time (s)" } }, y: { title: { display: true, text: "Level" }, min: 0, max: 100 } }
        }
    });

    function getRandomFluctuation(rate, isSpike = false) {
        return isSpike ? (Math.random() - 0.5) * 20 : (Math.random() - 0.5) * 2;
    }

    function introduceRandomSpike(level, chance = 0.1) {
        if (Math.random() < chance) {
            console.log("Spike triggered!");
            return level + getRandomFluctuation(level, true);
        }
        return level + getRandomFluctuation(0.2);
    }

    function updateLiveChart() {
        temperatureLevel = Math.min(Math.max(introduceRandomSpike(temperatureLevel), 0), 100);
        oxygenLevel = Math.min(Math.max(introduceRandomSpike(oxygenLevel), 0), 100);
        salinityLevel = Math.min(Math.max(introduceRandomSpike(salinityLevel), 0), 100);

        document.getElementById("temp").innerText = `${temperatureLevel.toFixed(1)}°C`;
        document.getElementById("oxygen").innerText = `${oxygenLevel.toFixed(1)}%`;
        document.getElementById("salinity").innerText = `${salinityLevel.toFixed(1)} PSU`;
        document.getElementById("ph").innerText = `${phLevel.toFixed(1)}`;

        if (labels.length >= 30) { //keep 30 points
            labels.shift();
            temperatureData.shift();
            oxygenData.shift();
            salinityData.shift();
        }
        labels.push(labels.length + 1);
        temperatureData.push(temperatureLevel.toFixed(1));
        oxygenData.push(oxygenLevel.toFixed(1));
        salinityData.push(salinityLevel.toFixed(1));

        liveChart.update();

        detectAnomalies();
        checkCriticalLevels();

        prevTemperatureLevel = temperatureLevel;
        prevOxygenLevel = oxygenLevel;
        prevSalinityLevel = salinityLevel;
    }

    function detectAnomalies() {
        if (Math.abs(temperatureLevel - prevTemperatureLevel) > anomalyThresholds.temperature) {
            showNotification(`Anomaly detected in Temperature! Change: ${Math.abs(temperatureLevel - prevTemperatureLevel).toFixed(1)}°C`);
        }
        if (Math.abs(oxygenLevel - prevOxygenLevel) > anomalyThresholds.oxygen) {
            showNotification(`Anomaly detected in Oxygen Level! Change: ${Math.abs(oxygenLevel - prevOxygenLevel).toFixed(1)}%`);
        }
        if (Math.abs(salinityLevel - prevSalinityLevel) > anomalyThresholds.salinity) {
            showNotification(`Anomaly detected in Salinity! Change: ${Math.abs(salinityLevel - prevSalinityLevel).toFixed(1)} PSU`);
        }
    }

    function checkCriticalLevels() {
        if (temperatureLevel < 5 || temperatureLevel > 30) {
            showNotification("Temperature level critical!");
        }
        if (oxygenLevel < 20) {
            showNotification("Oxygen level critical!");
        }
        if (salinityLevel < 10 || salinityLevel > 50) {
            showNotification("Salinity level critical!");
        }
    }

    function showNotification(message) {
        const notification = document.createElement("div");
        notification.className = "alert";
        notification.textContent = message;
        alertContainer.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    setInterval(updateLiveChart, 1000);
});
