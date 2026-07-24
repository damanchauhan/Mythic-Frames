/* ==========================================
   MYTHIC FRAMES
   Characters
========================================== */

const grid = document.getElementById("charactersGrid");

document.addEventListener("DOMContentLoaded", loadCharacters);

async function loadCharacters() {

    try {

        const response = await fetch("data/characters.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Failed to load characters.json (${response.status})`);
        }

        const characters = await response.json();

        characters.sort((a, b) =>
            a.name.localeCompare(b.name)
        );

        grid.innerHTML = "";

        characters.forEach(character => {

            const artworkCount = Array.isArray(character.artworks)
                ? character.artworks.length
                : 0;

            const card = document.createElement("a");

            card.className = "character-card";

            card.href = `character.html?slug=${encodeURIComponent(character.slug)}`;

            card.innerHTML = `

                <img
                    src="${escapeHtml(character.cover)}"
                    alt="${escapeHtml(character.name)}"
                    loading="lazy">

                <div class="character-content">

                    <h2>${escapeHtml(character.name)}</h2>

                    <p>${escapeHtml(character.series)}</p>

                    <span class="character-count">

                        ${artworkCount}
                        Artwork${artworkCount !== 1 ? "s" : ""}

                    </span>

                </div>

            `;

            grid.appendChild(card);

        });

        updateCharactersSEO(characters.length);

    }

    catch (error) {

        console.error(error);

        grid.innerHTML = `

            <div class="no-results">

                <h2>Unable to load characters</h2>

                <p>Please try again later.</p>

            </div>

        `;

    }

}

/* ========================================== */

function updateCharactersSEO(totalCharacters) {

    if (typeof updateSEO === "function") {

        updateSEO({

            title: "Characters",

            description: `Browse ${totalCharacters} anime, manhwa, novel, and original characters on Mythic Frames.`,

            image: "assets/logo/website-banner.png",

            url: window.location.href

        });

    }

}

/* ========================================== */

function escapeHtml(value = "") {

    return String(value)

        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");

}