/* ==========================================
   MYTHIC FRAMES
   Gallery
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    let artworks = [];

    const gallery = document.getElementById("galleryGrid");
    const searchInput = document.getElementById("search");
    const seriesFilter = document.getElementById("seriesFilter");
    const typeFilter = document.getElementById("typeFilter");
    const sortSelect = document.getElementById("sort");

    const params = new URLSearchParams(window.location.search);

    const urlSeries = (params.get("series") || "").trim().toLowerCase();
    const urlCharacter = (params.get("character") || "").trim().toLowerCase();
    const urlCollection = (params.get("collection") || "").trim().toLowerCase();
    const urlSearch = (params.get("search") || "").trim();

    try {

        const response = await fetch("data/artworks.json", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(`Unable to load artworks.json (${response.status})`);
        }

        artworks = await response.json();

        buildSeriesFilter();

        if (urlSearch) {
            searchInput.value = urlSearch;
        }

        if (urlSeries) {
            seriesFilter.value = urlSeries;
        }

        filterGallery();

    } catch (error) {

        console.error(error);

        gallery.innerHTML = `
            <div class="no-results">
                <h2>Unable to load gallery.</h2>
                <p>Please try again later.</p>
            </div>
        `;
    }

    /* ====================================== */

    function buildSeriesFilter() {

        const map = new Map();

        artworks.forEach(item => {

            const slug = item.seriesSlug || slugify(item.series);

            if (!map.has(slug)) {

                map.set(slug, item.series);

            }

        });

        [...map.entries()]
            .sort((a, b) => a[1].localeCompare(b[1]))
            .forEach(([slug, name]) => {

                const option = document.createElement("option");

                option.value = slug;
                option.textContent = name;

                seriesFilter.appendChild(option);

            });

    }

    /* ====================================== */

    function renderGallery(list) {

        gallery.innerHTML = "";

        if (!list.length) {

            gallery.innerHTML = `
                <div class="no-results">
                    <h2>No artwork found</h2>
                    <p>Try another search or filter.</p>
                </div>
            `;

            return;

        }

        list.forEach(item => {

            const card = document.createElement("article");

            card.className = "gallery-card";

            card.innerHTML = `

                <a href="artwork.html?slug=${encodeURIComponent(item.slug)}">

                    <img
                        src="${escapeHtml(item.thumbnail || item.image)}"
                        alt="${escapeHtml(item.title)}"
                        loading="lazy">

                    <div class="gallery-info">

                        <h3>${escapeHtml(item.title)}</h3>

                        <span>${escapeHtml(item.series)}</span>

                    </div>

                </a>

            `;

            gallery.appendChild(card);

        });

    }

    /* ====================================== */

    function filterGallery() {

        let results = [...artworks];

        const search = searchInput.value.trim().toLowerCase();

        if (search) {

            results = results.filter(item => {

                const tags = Array.isArray(item.tags)
                    ? item.tags.join(" ").toLowerCase()
                    : "";

                return (

                    (item.title || "").toLowerCase().includes(search) ||

                    (item.character || "").toLowerCase().includes(search) ||

                    (item.series || "").toLowerCase().includes(search) ||

                    tags.includes(search)

                );

            });

        }

        if (seriesFilter.value !== "all") {

            results = results.filter(item =>

                (item.seriesSlug || slugify(item.series)) ===
                seriesFilter.value

            );

        }

        if (urlCharacter) {

            results = results.filter(item =>

                (item.characterSlug || slugify(item.character)) ===
                urlCharacter

            );

        }

        if (urlCollection) {

            results = results.filter(item =>

                slugify(item.collection || "") ===
                urlCollection

            );

        }

        if (typeFilter.value !== "all") {

            results = results.filter(item =>

                item.type === typeFilter.value

            );

        }

        switch (sortSelect.value) {

            case "featured":

                results.sort((a, b) => {

                    if (a.featured === b.featured) {

                        return a.title.localeCompare(b.title);

                    }

                    return Number(b.featured) - Number(a.featured);

                });

                break;

            case "az":

                results.sort((a, b) =>

                    a.title.localeCompare(b.title)

                );

                break;

            default:

                results.sort((a, b) =>

                    new Date(b.created || 0) -
                    new Date(a.created || 0)

                );

        }

        renderGallery(results);

        updateGallerySEO(results.length);

    }

    /* ====================================== */

    function updateGallerySEO(count) {

        let title = "Gallery";
        let description = `Browse ${count} realistic AI artworks on Mythic Frames.`;

        if (seriesFilter.value !== "all") {

            const seriesName = seriesFilter.options[
                seriesFilter.selectedIndex
            ]?.textContent;

            title = `${seriesName} Gallery`;

            description =
                `Browse every ${seriesName} artwork on Mythic Frames.`;

        }

        if (typeof updateSEO === "function") {

            updateSEO({

                title,
                description,
                image: "assets/logo/website-banner.png",
                url: window.location.href

            });

        }

    }

    /* ====================================== */

    function slugify(text = "") {

        return String(text)

            .toLowerCase()

            .trim()

            .replace(/&/g, "and")

            .replace(/[^\w\s-]/g, "")

            .replace(/\s+/g, "-");

    }

    function escapeHtml(text = "") {

        return String(text)

            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#39;");

    }

    /* ====================================== */

    searchInput.addEventListener("input", filterGallery);

    seriesFilter.addEventListener("change", filterGallery);

    typeFilter.addEventListener("change", filterGallery);

    sortSelect.addEventListener("change", filterGallery);

});