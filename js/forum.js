let journalEntries = [];
let filteredTag = null;

function addEntry() {
    const title = document.getElementById("title").value;
    const tags = document.getElementById("tags").value;
    const description = document.getElementById("description").value;
    const timestamp = new Date().toLocaleString();

    if (title && description) {
        const entry = {
            title,
            tags: tags.split(",").map(tag => tag.trim()), // Convert tags to array
            description,
            timestamp
        };

        journalEntries.push(entry);
        displayEntries();
        clearForm();
    } else {
        alert("Please fill in both the title and description.");
    }
}

function clearForm() {
    document.getElementById("title").value = "";
    document.getElementById("tags").value = "";
    document.getElementById("description").value = "";
}

// Function to display entries
function displayEntries() {
    const entriesContainer = document.getElementById("entries");
    entriesContainer.innerHTML = "<h2>Journal Entries</h2>";

    const entriesToShow = filteredTag 
        ? journalEntries.filter(entry => entry.tags.includes(filteredTag)) 
        : journalEntries;

    entriesToShow.forEach(entry => {
        const entryDiv = document.createElement("div");
        entryDiv.classList.add("entry");

        entryDiv.innerHTML = `
            <h3>${entry.title}</h3>
            <p>${entry.description}</p>
            <div class="tags">
                <strong>Tags:</strong>
                ${entry.tags.map(tag => `<span class="tag" onclick="filterByTag('${tag}')">${tag}</span>`).join("")}
            </div>
            <p class="timestamp"><small>${entry.timestamp}</small></p>
        `;

        entriesContainer.appendChild(entryDiv);
    });

    if (filteredTag) {
        const clearFilterButton = document.createElement("button");
        clearFilterButton.textContent = `Clear Filter: ${filteredTag}`;
        clearFilterButton.onclick = () => {
            filteredTag = null;
            displayEntries();
        };
        entriesContainer.appendChild(clearFilterButton);
    }
}

function filterByTag(tag) {
    filteredTag = tag;
    displayEntries();
}
