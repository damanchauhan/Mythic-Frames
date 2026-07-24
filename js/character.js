/* ==========================================
   MYTHIC FRAMES
   Character Page
========================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const params = new URLSearchParams(window.location.search);
    const slugFromUrl = (params.get("slug") || params.get("character") || "").trim().toLowerCase();

    const els = {
        page: document.getElementById("characterPage"),
        image: document.getElementById("characterImage"),
        type: document.getElementById("characterType"),
        name: document.getElementById("characterName"),
        series: document.getElementById("characterSeries"),
        description: document.getElementById("characterDescription"),
        seriesName: document.getElementById("seriesName"),
        collectionName: document.getElementById("collectionName"),
        artworkCount: document.getElementById("artworkCount"),
        category: document.getElementById("characterCategory"),
        tags: document.getElementById("characterTags"),
        galleryButton: document.getElementById("galleryButton"),
        collectionButton: document.getElementById("collectionButton"),
        shareButton: document.getElementById("shareCharacter"),
        gallery: document.getElementById("characterGallery"),
        related: document.getElementById("relatedCharacters"),
        breadcrumb: document.getElementById("breadcrumbCharacter"),
        searchInput: document.getElementById("search"),
    };

    if (!slugFromUrl) {
        renderError("No character selected.");
        return;
    }

    let characters = [];
    let artworks = [];

    try {
        const [charactersResponse, artworksResponse] = await Promise.all([
            fetch("data/characters.json", { cache: "no-store" }),
            fetch("data/artworks.json", { cache: "no-store" })
        ]);

        if (!charactersResponse.ok) {
            throw new Error(`Failed to load characters.json (${charactersResponse.status})`);
        }

        if (!artworksResponse.ok) {
            throw new Error(`Failed to load artworks.json (${artworksResponse.status})`);
        }

        characters = await charactersResponse.json();
        artworks = await artworksResponse.json();
    } catch (error) {
        console.error("Character page load error:", error);
        renderError("Could not load character data.");
        return;
    }

    const character = findCharacter(characters, slugFromUrl);

    if (!character) {
        renderError("Character Not Found");
        return;
    }

    const characterArtworks = getCharacterArtworks(character, artworks);

    renderCharacter(character, characterArtworks);
    renderGallery(characterArtworks);
    renderRelatedCharacters(character, characters);
    setupActions(character);

    function renderCharacter(item, artworkList) {
        if (els.image) {
            els.image.src = item.cover || artworkList[0]?.thumbnail || artworkList[0]?.image || "";
            els.image.alt = item.name || "Character";
        }

        if (els.type) els.type.textContent = item.type || "Anime";
        if (els.name) els.name.textContent = item.name || "Unknown Character";
        if (els.series) els.series.textContent = item.series || "";
        if (els.description) els.description.textContent = item.description || "";
        if (els.seriesName) els.seriesName.textContent = item.series || "—";
        if (els.collectionName) els.collectionName.textContent = item.series || "—";
        if (els.artworkCount) els.artworkCount.textContent = String(artworkList.length);
        if (els.category) els.category.textContent = item.type || "—";
        if (els.breadcrumb) els.breadcrumb.textContent = item.name || "Character";

        if (els.galleryButton) {
            els.galleryButton.href = "gallery.html";
            els.galleryButton.textContent = "Browse All Artwork";
        }

        if (els.collectionButton) {
            const seriesSlug = slugify(item.series || "");
            els.collectionButton.href = `gallery.html?series=${encodeURIComponent(seriesSlug)}`;
            els.collectionButton.textContent = "View Collection";
        }

        populateChips(els.tags, [
            item.name,
            item.series,
            item.type,
            "Character"
        ].filter(Boolean));

        updateCharacterSEO(item);
    }

    function renderGallery(artworkList) {
        if (!els.gallery) return;

        els.gallery.innerHTML = "";

        if (!artworkList.length) {
            els.gallery.innerHTML = `
                <div class="no-results">
                    <h2>No artwork found</h2>
                    <p>This character does not have linked artwork yet.</p>
                </div>
            `;
            return;
        }

        artworkList.forEach(artwork => {
            const card = document.createElement("article");
            card.className = "gallery-card";

            card.innerHTML = `
                <a href="artwork.html?slug=${encodeURIComponent(artwork.slug)}">
                    <img
                        src="${escapeHtmlAttr(artwork.thumbnail || artwork.image || "")}"
                        alt="${escapeHtmlAttr(artwork.title || artwork.character || "Artwork")}"
                        loading="lazy">
                    <div class="gallery-info">
                        <h3>${escapeHtml(artwork.title || "Untitled")}</h3>
                        <span>${escapeHtml(artwork.series || "")}</span>
                    </div>
                </a>
            `;

            els.gallery.appendChild(card);
        });
    }

    function renderRelatedCharacters(current, list) {
        if (!els.related) return;

        const currentSeriesSlug = slugify(current.series || "");

        const related = list
            .filter(item => item.slug !== current.slug)
            .filter(item => slugify(item.series || "") === currentSeriesSlug)
            .slice(0, 4);

        els.related.innerHTML = "";

        if (!related.length) {
            els.related.innerHTML = `
                <div class="no-results">
                    <h2>No related characters</h2>
                    <p>Try another series.</p>
                </div>
            `;
            return;
        }

        related.forEach(item => {
            const card = document.createElement("a");
            card.className = "featured-card";
            card.href = `character.html?slug=${encodeURIComponent(item.slug)}`;

            const relatedCover =
                item.cover ||
                artworks.find(a => (a.characterSlug || slugify(a.character || "")) === item.slug)?.thumbnail ||
                artworks.find(a => (a.characterSlug || slugify(a.character || "")) === item.slug)?.image ||
                "";

            card.innerHTML = `
                <img src="${escapeHtmlAttr(relatedCover)}" alt="${escapeHtmlAttr(item.name || "Character")}" loading="lazy">
                <div class="card-info">
                    <h3>${escapeHtml(item.name || "Unknown Character")}</h3>
                    <span>${escapeHtml(item.series || "")}</span>
                </div>
            `;

            els.related.appendChild(card);
        });
    }

    function setupActions(item) {
        if (els.shareButton) {
            els.shareButton.onclick = async () => {
                const shareData = {
                    title: item.name || "Character",
                    text: item.description || `Explore ${item.name || "this character"} on Mythic Frames.`,
                    url: window.location.href
                };

                try {
                    if (navigator.share) {
                        await navigator.share(shareData);
                    } else if (navigator.clipboard) {
                        await navigator.clipboard.writeText(window.location.href);
                        if (typeof showToast === "function") {
                            showToast("Link copied!");
                        }
                    }
                } catch {
                    // user canceled or clipboard unavailable
                }
            };
        }

        if (els.searchInput) {
            els.searchInput.addEventListener("keydown", (e) => {
                if (e.key !== "Enter") return;
                const query = els.searchInput.value.trim();
                if (!query) return;
                window.location.href = `gallery.html?search=${encodeURIComponent(query)}`;
            });
        }
    }

    function getCharacterArtworks(character, list) {
        const characterSlug = slugify(character.slug || "");
        const artworkSlugs = Array.isArray(character.artworks) ? character.artworks : [];

        return list.filter(artwork => {
            const artworkCharacterSlug = slugify(artwork.characterSlug || artwork.character || "");
            const artworkSlug = slugify(artwork.slug || "");

            return (
                artworkCharacterSlug === characterSlug ||
                artworkSlugs.includes(artworkSlug)
            );
        });
    }

    function findCharacter(list, slugValue) {
        const normalized = String(slugValue).trim().toLowerCase();

        return (
            list.find(item => String(item.slug || "").trim().toLowerCase() === normalized) ||
            list.find(item => slugify(item.name || "") === normalized) ||
            list.find(item => slugify(item.series || "") === normalized)
        );
    }

    function populateChips(container, values) {
        if (!container) return;
        container.innerHTML = "";

        values.forEach(value => {
            const chip = document.createElement("span");
            chip.className = "tag";
            chip.textContent = value;
            container.appendChild(chip);
        });
    }

    function updateCharacterSEO(item) {
        const title = item.name || "Character";
        const desc = item.description || `Explore ${item.name || "this character"} from Mythic Frames.`;
        const image = absoluteUrl(item.cover || "");
        const url = absoluteUrl(`character.html?slug=${encodeURIComponent(item.slug)}`);

        if (typeof updateSEO === "function") {
            updateSEO({
                title,
                description: desc,
                image,
                url
            });
            return;
        }

        document.title = `${title} | Mythic Frames`;
        updateMetaTag("description", desc);
        updateMetaProperty("og:title", `${title} | Mythic Frames`);
        updateMetaProperty("og:description", desc);
        updateMetaProperty("og:type", "website");
        updateMetaProperty("og:image", image);
        updateMetaProperty("og:url", url);
        updateMetaProperty("twitter:card", "summary_large_image");
        updateMetaProperty("twitter:title", `${title} | Mythic Frames`);
        updateMetaProperty("twitter:description", desc);
        updateMetaProperty("twitter:image", image);
        updateCanonical(url);
    }

    function renderError(message) {
        if (!els.page) return;

        els.page.innerHTML = `
            <section style="padding:150px 0;text-align:center;">
                <h1 style="font-family:Cinzel,serif;font-size:48px;margin-bottom:18px;">${escapeHtml(message)}</h1>
                <p style="color:#aaa;margin-bottom:30px;">Try going back to the characters page.</p>
                <a href="characters.html" class="primary">Back to Characters</a>
            </section>
        `;
    }

    function updateMetaTag(name, content) {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("name", name);
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", content);
    }

    function updateMetaProperty(property, content) {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
            meta = document.createElement("meta");
            meta.setAttribute("property", property);
            document.head.appendChild(meta);
        }
        meta.setAttribute("content", content);
    }

    function updateCanonical(url) {
        let canonical = document.querySelector('link[rel="canonical"]');
        if (!canonical) {
            canonical = document.createElement("link");
            canonical.rel = "canonical";
            document.head.appendChild(canonical);
        }
        canonical.href = url;
    }

    function absoluteUrl(path) {
        try {
            return new URL(path, window.location.href).href;
        } catch {
            return path;
        }
    }

    function slugify(value = "") {
        return String(value)
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/:/g, "")
            .replace(/['".,!?()[\]{}]/g, "")
            .replace(/\s+/g, "-");
    }

    function escapeHtml(value = "") {
        return String(value)
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");
    }

    function escapeHtmlAttr(value = "") {
        return escapeHtml(value).replaceAll("`", "&#96;");
    }
});