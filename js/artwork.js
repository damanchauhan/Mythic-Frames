/* ==========================================
   MYTHIC FRAMES
   Artwork Detail Page
========================================== */

document.addEventListener("DOMContentLoaded", async () => {
    const PINTEREST_URL =
        "https://in.pinterest.com/mythic_frames/?invite_code=062c7008dd814f44abd65669552c20bd&sender=1099793308911688834";

    const params = new URLSearchParams(window.location.search);
    const slugFromUrl = (params.get("slug") || params.get("art") || "").trim().toLowerCase();

    const els = {
        page: document.getElementById("artworkPage"),
        image: document.getElementById("artworkImage"),
        title: document.getElementById("artworkTitle"),
        subtitle: document.getElementById("artworkSubtitle"),
        description: document.getElementById("artworkDescription"),
        character: document.getElementById("artworkCharacter"),
        series: document.getElementById("artworkSeries"),
        collection: document.getElementById("artworkCollection"),
        artworkType: document.getElementById("artworkType"),
        resolution: document.getElementById("artworkResolution"),
        orientation: document.getElementById("artworkOrientation"),
        artist: document.getElementById("artworkArtist"),
        created: document.getElementById("artworkCreated"),
        typeBadge: document.getElementById("badgeType"),
        featuredBadge: document.getElementById("badgeFeatured"),
        newBadge: document.getElementById("badgeNew"),
        tagList: document.getElementById("tagList"),
        colorList: document.getElementById("colorList"),
        relatedGrid: document.getElementById("relatedGrid"),
        breadcrumbSeries: document.getElementById("breadcrumbSeries"),
        breadcrumbTitle: document.getElementById("breadcrumbTitle"),
        pinterestLink: document.getElementById("pinterestLink"),
        shareButton: document.getElementById("shareButton"),
        downloadButton: document.getElementById("downloadButton"),
        prevButton: document.getElementById("prevArtwork"),
        nextButton: document.getElementById("nextArtwork"),
        characterButton: document.getElementById("characterButton"),
        searchInput: document.getElementById("search"),
        lightbox: document.getElementById("lightbox"),
        lightboxImage: document.getElementById("lightboxImage"),
        lightboxClose: document.getElementById("lightboxClose"),
    };

    if (!slugFromUrl) {
        renderError("No artwork selected.");
        return;
    }

    let artworks = [];

    try {
        const response = await fetch("data/artworks.json", { cache: "no-store" });
        if (!response.ok) throw new Error(`Failed to load JSON (${response.status})`);
        artworks = await response.json();
    } catch (error) {
        console.error("Failed to load artworks.json:", error);
        renderError("Could not load artwork data.");
        return;
    }

    const artwork = findArtwork(artworks, slugFromUrl);

    if (!artwork) {
        renderError("Artwork not found.");
        return;
    }

    const currentIndex = artworks.findIndex(item => item.slug === artwork.slug);

    renderArtwork(artwork);
    renderRelated(artwork, artworks);
    setupNavigation(artworks, currentIndex);
    setupActions(artwork);
    setupLightbox();
    updateSEOState(artwork);

    function renderArtwork(item) {
        if (els.image) {
            els.image.src = item.image || item.thumbnail || "";
            els.image.alt = item.title || item.character || "Artwork";
        }

        if (els.title) els.title.textContent = item.title || "Untitled";
        if (els.subtitle) els.subtitle.textContent = item.series || "";
        if (els.description) els.description.textContent = item.description || "";
        if (els.character) els.character.textContent = item.character || "—";
        if (els.series) els.series.textContent = item.series || "—";
        if (els.collection) els.collection.textContent = item.collection || item.series || "—";
        if (els.artworkType) els.artworkType.textContent = item.type || "—";
        if (els.resolution) els.resolution.textContent = item.resolution || "—";
        if (els.orientation) els.orientation.textContent = capitalize(item.orientation) || "—";
        if (els.artist) els.artist.textContent = item.artist || "Mythic Frames";
        if (els.created) els.created.textContent = item.created || "—";

        if (els.typeBadge) els.typeBadge.textContent = item.type || "Artwork";
        if (els.featuredBadge) els.featuredBadge.style.display = item.featured ? "inline-flex" : "none";
        if (els.newBadge) els.newBadge.style.display = item.new ? "inline-flex" : "none";

        if (els.breadcrumbTitle) {
            els.breadcrumbTitle.textContent = item.title || "Artwork";
        }

        if (els.breadcrumbSeries) {
            els.breadcrumbSeries.textContent = item.series || "Series";
            const seriesSlug = item.seriesSlug || slugify(item.series || "");
            els.breadcrumbSeries.href = `gallery.html?series=${encodeURIComponent(seriesSlug)}`;
        }

        if (els.pinterestLink) {
            els.pinterestLink.href = PINTEREST_URL;
        }

        if (els.characterButton) {
            const characterSlug = item.characterSlug || slugify(item.character || "");
            els.characterButton.href = `character.html?slug=${encodeURIComponent(characterSlug)}`;
        }

        if (els.searchInput) {
            els.searchInput.value = item.title || "";
        }

        populateChips(els.tagList, item.tags || []);
        populateChips(els.colorList, item.colors || []);
    }

    function renderRelated(current, list) {
        if (!els.relatedGrid) return;

        const currentSeriesSlug = current.seriesSlug || slugify(current.series || "");
        const currentCharacterSlug = current.characterSlug || slugify(current.character || "");

        const related = list
            .filter(item => item.slug !== current.slug)
            .map(item => {
                const itemSeriesSlug = item.seriesSlug || slugify(item.series || "");
                const itemCharacterSlug = item.characterSlug || slugify(item.character || "");

                let score = 0;
                if (itemSeriesSlug === currentSeriesSlug) score += 4;
                if (itemCharacterSlug === currentCharacterSlug) score += 5;
                if (item.type === current.type) score += 1;
                if (item.featured) score += 1;
                if (item.trending) score += 1;
                if (item.new) score += 1;

                return { item, score };
            })
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return new Date(b.item.created || 0) - new Date(a.item.created || 0);
            })
            .slice(0, 6)
            .map(entry => entry.item);

        els.relatedGrid.innerHTML = "";

        if (!related.length) {
            els.relatedGrid.innerHTML = `<p style="color:#999;">No related artwork found.</p>`;
            return;
        }

        related.forEach(item => {
            const card = document.createElement("a");
            card.className = "related-card";
            card.href = `artwork.html?slug=${encodeURIComponent(item.slug)}`;

            card.innerHTML = `
                <img src="${escapeHtmlAttr(item.thumbnail || item.image || "")}" alt="${escapeHtmlAttr(item.title || item.character || "Artwork")}" loading="lazy">
                <div class="related-info">
                    <h3>${escapeHtml(item.title || "Untitled")}</h3>
                    <span>${escapeHtml(item.series || "")}</span>
                </div>
            `;

            els.relatedGrid.appendChild(card);
        });
    }

    function setupNavigation(list, index) {
        if (!els.prevButton || !els.nextButton) return;

        els.prevButton.disabled = index <= 0;
        els.nextButton.disabled = index >= list.length - 1;

        els.prevButton.onclick = () => {
            if (index > 0) {
                window.location.href = `artwork.html?slug=${encodeURIComponent(list[index - 1].slug)}`;
            }
        };

        els.nextButton.onclick = () => {
            if (index < list.length - 1) {
                window.location.href = `artwork.html?slug=${encodeURIComponent(list[index + 1].slug)}`;
            }
        };

        window.addEventListener("keydown", (e) => {
            if (e.key === "ArrowLeft" && !els.prevButton.disabled) els.prevButton.click();
            if (e.key === "ArrowRight" && !els.nextButton.disabled) els.nextButton.click();
        });
    }

    function setupActions(current) {
        if (els.shareButton) {
            els.shareButton.onclick = async () => {
                const shareData = {
                    title: current.title || "Mythic Frames",
                    text: current.description || current.title || "Mythic Frames artwork",
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

        if (els.downloadButton) {
            els.downloadButton.onclick = () => {
                const imageUrl = current.image || current.thumbnail || els.image?.src || "";
                if (!imageUrl) return;

                const link = document.createElement("a");
                link.href = imageUrl;
                link.download = `${current.slug || "artwork"}.png`;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                if (typeof showToast === "function") {
                    showToast("Download started", "⬇");
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

    function setupLightbox() {
        if (!els.lightbox || !els.lightboxImage || !els.lightboxClose || !els.image) return;

        els.image.addEventListener("click", () => {
            els.lightboxImage.src = els.image.src;
            els.lightbox.classList.add("active");
        });

        els.lightboxClose.addEventListener("click", () => {
            els.lightbox.classList.remove("active");
        });

        els.lightbox.addEventListener("click", (e) => {
            if (e.target === els.lightbox) {
                els.lightbox.classList.remove("active");
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") {
                els.lightbox.classList.remove("active");
            }
        });
    }

    function updateSEOState(item) {
        const title = item.title || "Artwork";
        const desc = item.description || `View ${item.title || "this artwork"} from Mythic Frames.`;
        const image = absoluteUrl(item.image || item.thumbnail || "");
        const url = absoluteUrl(`artwork.html?slug=${encodeURIComponent(item.slug)}`);

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
            <section class="artwork-hero">
                <div style="padding:120px 0;text-align:center;">
                    <h1 style="font-family:Cinzel,serif;font-size:48px;margin-bottom:18px;">${escapeHtml(message)}</h1>
                    <p style="color:#aaa;margin-bottom:30px;">Try going back to the gallery.</p>
                    <a href="gallery.html" class="primary">Back to Gallery</a>
                </div>
            </section>
        `;
    }

    function findArtwork(list, slugValue) {
        const normalized = String(slugValue).trim().toLowerCase();

        return (
            list.find(item => String(item.slug || "").trim().toLowerCase() === normalized) ||
            list.find(item => slugify(item.title || "") === normalized) ||
            list.find(item => slugify(item.character || "") === normalized)
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

    function updateMetaTag(name, content) {
        let el = document.querySelector(`meta[name="${name}"]`);
        if (!el) {
            el = document.createElement("meta");
            el.setAttribute("name", name);
            document.head.appendChild(el);
        }
        el.setAttribute("content", content);
    }

    function updateMetaProperty(property, content) {
        let el = document.querySelector(`meta[property="${property}"]`);
        if (!el) {
            el = document.createElement("meta");
            el.setAttribute("property", property);
            document.head.appendChild(el);
        }
        el.setAttribute("content", content);
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

    function capitalize(value = "") {
        const text = String(value).trim();
        if (!text) return "";
        return text.charAt(0).toUpperCase() + text.slice(1);
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
