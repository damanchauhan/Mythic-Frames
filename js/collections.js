/* ==========================================
   MYTHIC FRAMES
   Collections
========================================== */

const grid = document.getElementById("collectionsGrid");

document.addEventListener("DOMContentLoaded", loadCollections);

async function loadCollections() {

    try {

        const response = await fetch("data/collections.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Unable to load collections.");
        }

        const collections = await response.json();

        collections.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        grid.innerHTML = "";

        collections.forEach(collection => {

            const card = document.createElement("a");

            card.className = "collection-card";

            card.href = `gallery.html?series=${encodeURIComponent(collection.slug)}`;

            card.innerHTML = `

                <img
                    src="${collection.cover}"
                    alt="${escapeHtml(collection.name)}"
                    loading="lazy">

                <div class="collection-content">

                    <h2>${escapeHtml(collection.name)}</h2>

                    <p>${escapeHtml(collection.description)}</p>

                    <span class="collection-count">

                        ${collection.count}
                        Artwork${collection.count !== 1 ? "s" : ""}

                    </span>

                </div>

            `;

            grid.appendChild(card);

        });

        updateCollectionSEO(collections.length);

    }

    catch (error) {

        console.error(error);

        grid.innerHTML = `

            <div class="no-results">

                <h2>Unable to load collections</h2>

                <p>Please try again later.</p>

            </div>

        `;

    }

}

function updateCollectionSEO(totalCollections) {

    if (typeof updateSEO === "function") {

        updateSEO({

            title: "Collections",

            description: `Browse ${totalCollections} anime, manhwa, novel, and original art collections on Mythic Frames.`,

            image: "assets/logo/website-banner.png",

            url: window.location.href

        });

    }

}

function escapeHtml(value = "") {

    return String(value)

        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

}