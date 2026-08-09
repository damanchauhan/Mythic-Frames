/* ==========================================
   MYTHIC FRAMES
   Character Page
========================================== */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       URL
    ===================================================== */

    const params =
        new URLSearchParams(window.location.search);

    const slugFromUrl =
        (
            params.get("slug") ||
            params.get("character") ||
            ""
        )
            .trim()
            .toLowerCase();


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const els = {

        page:
            document.getElementById("characterPage"),

        image:
            document.getElementById("characterImage"),

        type:
            document.getElementById("characterType"),

        name:
            document.getElementById("characterName"),

        series:
            document.getElementById("characterSeries"),

        description:
            document.getElementById("characterDescription"),

        seriesName:
            document.getElementById("seriesName"),

        collectionName:
            document.getElementById("collectionName"),

        artworkCount:
            document.getElementById("artworkCount"),

        category:
            document.getElementById("characterCategory"),

        tags:
            document.getElementById("characterTags"),

        galleryButton:
            document.getElementById("galleryButton"),

        collectionButton:
            document.getElementById("collectionButton"),

        shareButton:
            document.getElementById("shareCharacter"),

        gallery:
            document.getElementById("characterGallery"),

        related:
            document.getElementById("relatedCharacters"),

        breadcrumb:
            document.getElementById("breadcrumbCharacter"),

        searchInput:
            document.getElementById("search")

    };


    /* =====================================================
       VALIDATE URL
    ===================================================== */

    if (!slugFromUrl) {

        renderError(
            "No character selected."
        );

        return;

    }


    /* =====================================================
       LOAD DATA
    ===================================================== */

    let characters = [];
    let artworks = [];

    try {

        const [
            charactersResponse,
            artworksResponse
        ] = await Promise.all([

            fetch(
                "data/characters.json",
                {
                    cache: "no-store"
                }
            ),

            fetch(
                "data/artworks.json",
                {
                    cache: "no-store"
                }
            )

        ]);


        if (!charactersResponse.ok) {

            throw new Error(
                `characters.json failed: ${charactersResponse.status}`
            );

        }


        if (!artworksResponse.ok) {

            throw new Error(
                `artworks.json failed: ${artworksResponse.status}`
            );

        }


        characters =
            await charactersResponse.json();

        artworks =
            await artworksResponse.json();


    } catch (error) {

        console.error(
            "Character page load error:",
            error
        );

        renderError(
            "Could not load character data."
        );

        return;

    }


    /* =====================================================
       FIND CHARACTER
    ===================================================== */

    const character =
        findCharacter(
            characters,
            slugFromUrl
        );


    if (!character) {

        renderError(
            "Character Not Found"
        );

        return;

    }


    /* =====================================================
       FIND CHARACTER ARTWORK
    ===================================================== */

    const characterArtworks =
        getCharacterArtworks(
            character,
            artworks
        );


    /* =====================================================
       RENDER PAGE
    ===================================================== */

    renderCharacter(
        character,
        characterArtworks
    );


    renderGallery(
        characterArtworks
    );


    renderRelatedCharacters(
        character,
        characters,
        artworks
    );


    setupActions(
        character
    );


    /* =====================================================
       CHARACTER
    ===================================================== */

    function renderCharacter(
        item,
        artworkList
    ) {

        /*
         * Character cover from characters.json
         * is preferred.
         *
         * If it fails/is missing, use the first
         * linked artwork.
         */

        const fallbackImage =
            artworkList[0]?.thumbnail ||
            artworkList[0]?.image ||
            "";


        const coverImage =
            item.cover ||
            fallbackImage;


        if (els.image) {

            els.image.src =
                coverImage;

            els.image.alt =
                item.name ||
                "Character";


            /*
             * If the cover path fails,
             * automatically fall back to artwork.
             */

            els.image.onerror =
                () => {

                    if (
                        fallbackImage &&
                        els.image.src !==
                        absoluteUrl(fallbackImage)
                    ) {

                        els.image.src =
                            fallbackImage;

                    }

                };

        }


        if (els.type) {

            els.type.textContent =
                item.type ||
                "Anime";

        }


        if (els.name) {

            els.name.textContent =
                item.name ||
                "Unknown Character";

        }


        if (els.series) {

            els.series.textContent =
                item.series ||
                "";

        }


        if (els.description) {

            els.description.textContent =
                item.description ||
                "";

        }


        if (els.seriesName) {

            els.seriesName.textContent =
                item.series ||
                "—";

        }


        if (els.collectionName) {

            els.collectionName.textContent =
                item.series ||
                "—";

        }


        if (els.artworkCount) {

            els.artworkCount.textContent =
                String(
                    artworkList.length
                );

        }


        if (els.category) {

            els.category.textContent =
                item.type ||
                "—";

        }


        if (els.breadcrumb) {

            els.breadcrumb.textContent =
                item.name ||
                "Character";

        }


        /* =================================================
           BROWSE ARTWORK
        ================================================= */

        if (els.galleryButton) {

            els.galleryButton.href =
                `gallery.html?character=${encodeURIComponent(
                    item.slug
                )}`;

            els.galleryButton.textContent =
                "Browse All Artwork";

        }


        /* =================================================
           VIEW COLLECTION
        ================================================= */

        if (els.collectionButton) {

            const seriesSlug =
                slugify(
                    item.series ||
                    ""
                );


            els.collectionButton.href =
                `gallery.html?series=${encodeURIComponent(
                    seriesSlug
                )}`;


            els.collectionButton.textContent =
                "View Collection";

        }


        /* =================================================
           TAGS
        ================================================= */

        const tags = [

            item.name,

            item.series,

            item.type,

            "Character",

            "Mythic Frames"

        ].filter(Boolean);


        populateChips(
            els.tags,
            tags
        );


        /* =================================================
           SEO
        ================================================= */

        updateCharacterSEO(
            item
        );

    }


    /* =====================================================
       CHARACTER ARTWORK
    ===================================================== */

    function renderGallery(
        artworkList
    ) {

        if (!els.gallery) {
            return;
        }


        els.gallery.innerHTML =
            "";


        if (!artworkList.length) {

            els.gallery.innerHTML = `

                <div class="no-results">

                    <h2>
                        No artwork found
                    </h2>

                    <p>
                        This character does not
                        have linked artwork yet.
                    </p>

                </div>

            `;

            return;

        }


        artworkList.forEach(
            artwork => {

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "gallery-card";


                const image =
                    artwork.thumbnail ||
                    artwork.image ||
                    "";


                card.innerHTML = `

                    <a
                        href="artwork.html?slug=${encodeURIComponent(
                            artwork.slug
                        )}">

                        <img
                            src="${escapeHtmlAttr(
                                image
                            )}"

                            alt="${escapeHtmlAttr(
                                artwork.title ||
                                artwork.character ||
                                "Artwork"
                            )}"

                            loading="lazy">


                        <div class="gallery-info">

                            <h3>
                                ${escapeHtml(
                                    artwork.title ||
                                    "Untitled"
                                )}
                            </h3>

                            <span>
                                ${escapeHtml(
                                    artwork.series ||
                                    ""
                                )}
                            </span>

                        </div>

                    </a>

                `;


                els.gallery.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       RELATED CHARACTERS
    ===================================================== */

    function renderRelatedCharacters(
        current,
        characterList,
        artworkList
    ) {

        if (!els.related) {
            return;
        }


        const currentSeries =
            slugify(
                current.series ||
                ""
            );


        /*
         * Build a reliable cover lookup
         * from artworks.json.
         */

        const artworkByCharacter =
            new Map();


        artworkList.forEach(
            artwork => {

                const characterSlug =
                    slugify(
                        artwork.characterSlug ||
                        artwork.character ||
                        ""
                    );


                if (
                    characterSlug &&
                    !artworkByCharacter.has(
                        characterSlug
                    )
                ) {

                    artworkByCharacter.set(
                        characterSlug,
                        artwork.thumbnail ||
                        artwork.image ||
                        ""
                    );

                }

            }
        );


        /*
         * Characters from the same series.
         */

        const related =
            characterList

                .filter(
                    item =>
                        item.slug !==
                        current.slug
                )

                .filter(
                    item =>
                        slugify(
                            item.series ||
                            ""
                        ) ===
                        currentSeries
                )

                .slice(0, 4);


        els.related.innerHTML =
            "";


        if (!related.length) {

            els.related.innerHTML = `

                <div class="no-results">

                    <h2>
                        No related characters
                    </h2>

                    <p>
                        Try exploring another series.
                    </p>

                </div>

            `;

            return;

        }


        related.forEach(
            item => {

                const card =
                    document.createElement(
                        "a"
                    );


                card.className =
                    "featured-card";


                card.href =
                    `character.html?slug=${encodeURIComponent(
                        item.slug
                    )}`;


                const image =
                    item.cover ||
                    artworkByCharacter.get(
                        item.slug
                    ) ||
                    "";


                card.innerHTML = `

                    <img
                        src="${escapeHtmlAttr(
                            image
                        )}"

                        alt="${escapeHtmlAttr(
                            item.name ||
                            "Character"
                        )}"

                        loading="lazy">


                    <div class="card-info">

                        <h3>
                            ${escapeHtml(
                                item.name ||
                                "Unknown Character"
                            )}
                        </h3>

                        <span>
                            ${escapeHtml(
                                item.series ||
                                ""
                            )}
                        </span>

                    </div>

                `;


                /*
                 * Fallback if related cover fails.
                 */

                const relatedImage =
                    card.querySelector(
                        "img"
                    );


                if (relatedImage) {

                    relatedImage.onerror =
                        () => {

                            const fallback =
                                artworkByCharacter.get(
                                    item.slug
                                );


                            if (
                                fallback &&
                                relatedImage.src !==
                                absoluteUrl(
                                    fallback
                                )
                            ) {

                                relatedImage.src =
                                    fallback;

                            }

                        };

                }


                els.related.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       ACTIONS
    ===================================================== */

    function setupActions(
        item
    ) {

        /* =================================================
           SHARE
        ================================================= */

        if (els.shareButton) {

            els.shareButton.onclick =
                async () => {

                    const shareData = {

                        title:
                            item.name ||
                            "Character",

                        text:
                            item.description ||
                            `Explore ${
                                item.name ||
                                "this character"
                            } on Mythic Frames.`,

                        url:
                            window.location.href

                    };


                    try {

                        if (
                            navigator.share
                        ) {

                            await navigator.share(
                                shareData
                            );

                        }

                        else if (
                            navigator.clipboard
                        ) {

                            await navigator.clipboard.writeText(
                                window.location.href
                            );


                            if (
                                typeof showToast ===
                                "function"
                            ) {

                                showToast(
                                    "Link copied!"
                                );

                            }

                        }

                    } catch {

                        /*
                         * User cancelled share.
                         */

                    }

                };

        }


        /* =================================================
           SEARCH
        ================================================= */

        if (els.searchInput) {

            els.searchInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key !==
                        "Enter"
                    ) {

                        return;

                    }


                    const query =
                        els.searchInput.value
                            .trim();


                    if (!query) {
                        return;
                    }


                    window.location.href =
                        `gallery.html?search=${encodeURIComponent(
                            query
                        )}`;

                }
            );

        }

    }


    /* =====================================================
       CHARACTER ARTWORK MATCHING
    ===================================================== */

    function getCharacterArtworks(
        character,
        artworkList
    ) {

        const characterSlug =
            slugify(
                character.slug ||
                ""
            );


        const linkedArtworkSlugs =
            Array.isArray(
                character.artworks
            )

                ? character.artworks.map(
                    slug =>
                        slugify(slug)
                )

                : [];


        return artworkList.filter(
            artwork => {

                const artworkSlug =
                    slugify(
                        artwork.slug ||
                        ""
                    );


                const artworkCharacterSlug =
                    slugify(
                        artwork.characterSlug ||
                        ""
                    );


                const artworkCharacter =
                    slugify(
                        artwork.character ||
                        ""
                    );


                return (

                    /*
                     * Exact characterSlug
                     */

                    artworkCharacterSlug ===
                    characterSlug

                    ||

                    /*
                     * Character name
                     */

                    artworkCharacter ===
                    slugify(
                        character.name ||
                        ""
                    )

                    ||

                    /*
                     * Explicit artwork list
                     */

                    linkedArtworkSlugs.includes(
                        artworkSlug
                    )

                );

            }
        );

    }


    /* =====================================================
       FIND CHARACTER
    ===================================================== */

    function findCharacter(
        list,
        slugValue
    ) {

        const normalized =
            String(slugValue)
                .trim()
                .toLowerCase();


        return (

            list.find(
                item =>
                    String(
                        item.slug ||
                        ""
                    )
                        .trim()
                        .toLowerCase() ===
                    normalized
            )

            ||

            list.find(
                item =>
                    slugify(
                        item.name ||
                        ""
                    ) ===
                    normalized
            )

        );

    }


    /* =====================================================
       CHIPS
    ===================================================== */

    function populateChips(
        container,
        values
    ) {

        if (!container) {
            return;
        }


        container.innerHTML =
            "";


        values.forEach(
            value => {

                const chip =
                    document.createElement(
                        "span"
                    );


                chip.className =
                    "tag";


                chip.textContent =
                    value;


                container.appendChild(
                    chip
                );

            }
        );

    }


    /* =====================================================
       SEO
    ===================================================== */

    function updateCharacterSEO(
        item
    ) {

        const title =
            item.name ||
            "Character";


        const description =
            item.description ||
            `Explore ${
                item.name ||
                "this character"
            } from Mythic Frames.`;


        const image =
            absoluteUrl(
                item.cover ||
                ""
            );


        const url =
            absoluteUrl(
                `character.html?slug=${encodeURIComponent(
                    item.slug
                )}`
            );


        if (
            typeof updateSEO ===
            "function"
        ) {

            updateSEO({

                title,

                description,

                image,

                url

            });

            return;

        }


        document.title =
            `${title} | Mythic Frames`;


        updateMetaTag(
            "description",
            description
        );


        updateMetaProperty(
            "og:title",
            `${title} | Mythic Frames`
        );


        updateMetaProperty(
            "og:description",
            description
        );


        updateMetaProperty(
            "og:type",
            "website"
        );


        updateMetaProperty(
            "og:image",
            image
        );


        updateMetaProperty(
            "og:url",
            url
        );


        updateMetaProperty(
            "twitter:card",
            "summary_large_image"
        );


        updateMetaProperty(
            "twitter:title",
            `${title} | Mythic Frames`
        );


        updateMetaProperty(
            "twitter:description",
            description
        );


        updateMetaProperty(
            "twitter:image",
            image
        );


        updateCanonical(
            url
        );

    }


    /* =====================================================
       ERROR
    ===================================================== */

    function renderError(
        message
    ) {

        if (!els.page) {
            return;
        }


        els.page.innerHTML = `

            <section
                style="
                    padding:150px 0;
                    text-align:center;
                ">

                <h1
                    style="
                        font-family:Cinzel,serif;
                        font-size:48px;
                        margin-bottom:18px;
                    ">

                    ${escapeHtml(
                        message
                    )}

                </h1>


                <p
                    style="
                        color:#aaa;
                        margin-bottom:30px;
                    ">

                    Try going back to the
                    characters page.

                </p>


                <a
                    href="characters.html"
                    class="primary">

                    Back to Characters

                </a>

            </section>

        `;

    }


    /* =====================================================
       META HELPERS
    ===================================================== */

    function updateMetaTag(
        name,
        content
    ) {

        let meta =
            document.querySelector(
                `meta[name="${name}"]`
            );


        if (!meta) {

            meta =
                document.createElement(
                    "meta"
                );


            meta.setAttribute(
                "name",
                name
            );


            document.head.appendChild(
                meta
            );

        }


        meta.setAttribute(
            "content",
            content
        );

    }


    function updateMetaProperty(
        property,
        content
    ) {

        let meta =
            document.querySelector(
                `meta[property="${property}"]`
            );


        if (!meta) {

            meta =
                document.createElement(
                    "meta"
                );


            meta.setAttribute(
                "property",
                property
            );


            document.head.appendChild(
                meta
            );

        }


        meta.setAttribute(
            "content",
            content
        );

    }


    function updateCanonical(
        url
    ) {

        let canonical =
            document.querySelector(
                'link[rel="canonical"]'
            );


        if (!canonical) {

            canonical =
                document.createElement(
                    "link"
                );


            canonical.rel =
                "canonical";


            document.head.appendChild(
                canonical
            );

        }


        canonical.href =
            url;

    }


    /* =====================================================
       UTILITIES
    ===================================================== */

    function absoluteUrl(
        path
    ) {

        try {

            return new URL(
                path,
                window.location.href
            ).href;

        } catch {

            return path;

        }

    }


    function slugify(
        value = ""
    ) {

        return String(value)

            .toLowerCase()

            .trim()

            .replace(
                /&/g,
                "and"
            )

            .replace(
                /:/g,
                ""
            )

            .replace(
                /['".,!?()[\]{}]/g,
                ""
            )

            .replace(
                /\s+/g,
                "-"
            );

    }


    function escapeHtml(
        value = ""
    ) {

        return String(value)

            .replaceAll(
                "&",
                "&amp;"
            )

            .replaceAll(
                "<",
                "&lt;"
            )

            .replaceAll(
                ">",
                "&gt;"
            )

            .replaceAll(
                '"',
                "&quot;"
            )

            .replaceAll(
                "'",
                "&#39;"
            );

    }


    function escapeHtmlAttr(
        value = ""
    ) {

        return escapeHtml(
            value
        )
            .replaceAll(
                "`",
                "&#96;"
            );

    }

});
