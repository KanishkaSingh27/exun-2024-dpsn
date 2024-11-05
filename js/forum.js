// Toggle sidebar visibility
function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    sidebar.style.right = sidebar.style.right === "0px" ? "-250px" : "0px";
}

// Navigate to a post's discussion page (Simulated)
function navigateToPost(postTitle) {
    alert(`Navigating to the discussion on: ${postTitle}`);
    // Here you could set up actual navigation to a separate page
}

// Apply changes from the sidebar sliders
function applyChanges() {
    const tempValue = document.getElementById("temp").value;
    document.getElementById("tempValue").innerText = tempValue;
    alert(`Temperature Threshold set to ${tempValue}`);
}
