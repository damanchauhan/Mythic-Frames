/* ==========================================
   MYTHIC FRAMES
   Dynamic SEO
========================================== */

function updateSEO({
    title,
    description,
    image,
    url
}) {

    if (title) {
        document.title = `${title} | Mythic Frames`;
    }

    updateMeta("description", description);

    updateProperty("og:title", `${title} | Mythic Frames`);
    updateProperty("og:description", description);
    updateProperty("og:image", image);
    updateProperty("og:url", url);

    updateMeta("twitter:title", `${title} | Mythic Frames`);
    updateMeta("twitter:description", description);
    updateMeta("twitter:image", image);

    updateCanonical(url);

}

function updateMeta(name, content) {

    if (!content) return;

    let meta = document.querySelector(`meta[name="${name}"]`);

    if (!meta) {

        meta = document.createElement("meta");
        meta.name = name;
        document.head.appendChild(meta);

    }

    meta.content = content;

}

function updateProperty(property, content) {

    if (!content) return;

    let meta = document.querySelector(`meta[property="${property}"]`);

    if (!meta) {

        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);

    }

    meta.content = content;

}

function updateCanonical(url){

    let canonical = document.querySelector('link[rel="canonical"]');

    if(!canonical){

        canonical = document.createElement("link");

        canonical.rel = "canonical";

        document.head.appendChild(canonical);

    }

    canonical.href = url;

}