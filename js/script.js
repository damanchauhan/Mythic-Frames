/* =========================================
   MYTHIC FRAMES
   Main JavaScript
========================================= */

document.addEventListener("DOMContentLoaded", async () => {
    // ==================================================
    // Helpers
    // ==================================================
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const $ = (selector, scope = document) => scope.querySelector(selector);
    const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));

    const slugify = (value = "") =>
        String(value)
            .toLowerCase()
            .trim()
            .replace(/&/g, "and")
            .replace(/:/g, "")
            .replace(/['".,!?()[\]{}]/g, "")
            .replace(/\s+/g, "-");

    const safeText = (value) => (value == null ? "" : String(value));

    // ==================================================
    // Elements
    // ==================================================
    const header = $("header");
    const hero = $(".hero");
    const heroContent = $(".hero-content");
    const primaryButton = $(".primary");
    const searchInput = $(".nav-buttons input");
    const footerText = $("footer p");
    const featuredCards = $$(".featured-card");
    const sections = $$("section");
    const galleryImages = $$(".masonry img");

    // ==================================================
    // Header Scroll State
    // ==================================================
    const updateHeaderState = () => {
        if (!header) return;
        header.classList.toggle("scrolled", window.scrollY > 80);
    };

    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });

    // ==================================================
    // Reveal Sections on Scroll
    // ==================================================
    if ("IntersectionObserver" in window && sections.length) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("show");
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.15 }
        );

        sections.forEach((section) => {
            section.classList.add("hidden");
            observer.observe(section);
        });
    } else {
        sections.forEach((section) => section.classList.add("show"));
    }

    // ==================================================
    // Scroll to Top Button
    // ==================================================
    const topButton = document.createElement("button");
    topButton.type = "button";
    topButton.className = "scroll-top";
    topButton.setAttribute("aria-label", "Scroll to top");
    topButton.textContent = "↑";
    document.body.appendChild(topButton);

    const updateTopButton = () => {
        topButton.classList.toggle("show", window.scrollY > 500);
    };

    updateTopButton();
    window.addEventListener("scroll", updateTopButton, { passive: true });

    topButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

    // ==================================================
    // Hero Slideshow (from artworks.json)
    // Uses featured artworks first, then falls back safely.
    // ==================================================
    const fallbackHeroImages = [
        "/assets/images/overlord/Albedo1.png",
        "/assets/images/bsd/Dazai01.png",
        "/assets/images/death-note/Misa1.png",
        "/assets/images/originals/AnimeGirl.png",
        "/assets/images/originals/AnimeBoy.png",
        "/assets/images/tokyo-revengers/Draken.png",
        "/assets/images/solo-leveling/SoloLeveling.png"
    ];

    async function loadHeroImages() {
        if (!hero || prefersReducedMotion) return;

        let heroImages = [];

        try {
            const response = await fetch("data/artworks.json", { cache: "no-store" });
            if (response.ok) {
                const artworks = await response.json();

                heroImages = artworks
                    .filter((item) => item && item.featured && item.image)
                    .map((item) => item.image)
                    .filter(Boolean);
            }
        } catch {
            // ignore and use fallback
        }

        if (!heroImages.length) {
            heroImages = fallbackHeroImages;
        }

        // Preload first image so the transition feels stable
        const preload = (src) =>
            new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(true);
                img.onerror = () => resolve(false);
                img.src = src;
            });

        await preload(heroImages[0]);

        let index = 0;

        const setHeroBackground = (src) => {
            hero.style.backgroundImage = `
                linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.82)),
                url("${src}")
            `;
            hero.style.backgroundPosition = "center top";
            hero.style.backgroundSize = "cover";
            hero.style.backgroundRepeat = "no-repeat";
        };

        setHeroBackground(heroImages[index]);

        if (heroImages.length > 1) {
            setInterval(() => {
                index = (index + 1) % heroImages.length;
                setHeroBackground(heroImages[index]);
            }, 6000);
        }
    }

    loadHeroImages();

    // ==================================================
    // Featured Card Hover Tilt
    // ==================================================
    featuredCards.forEach((card) => {
        if (prefersReducedMotion) return;

        card.addEventListener("mousemove", (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const rotateY = (x - rect.width / 2) / 35;
            const rotateX = -(y - rect.height / 2) / 35;

            card.style.transform = `
                perspective(900px)
                rotateY(${rotateY}deg)
                rotateX(${rotateX}deg)
                translateY(-8px)
            `;
        });

        card.addEventListener("mouseleave", () => {
            card.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
        });
    });

    // ==================================================
    // Hero Button
    // Works whether .primary is a button or a link.
    // ==================================================
    if (primaryButton && primaryButton.tagName.toLowerCase() === "button") {
        primaryButton.addEventListener("click", () => {
            const gallerySection = $(".gallery");
            if (gallerySection) {
                gallerySection.scrollIntoView({
                    behavior: prefersReducedMotion ? "auto" : "smooth",
                    block: "start"
                });
            }
        });
    }

    // ==================================================
    // Footer Year
    // ==================================================
    if (footerText) {
        footerText.textContent = `© ${new Date().getFullYear()} Mythic Frames. All Rights Reserved.`;
    }

    // ==================================================
    // Home Search Shortcut
    // Typing here jumps to gallery with a search query.
    // ==================================================
    if (searchInput) {
        searchInput.addEventListener("keydown", (e) => {
            if (e.key !== "Enter") return;

            const query = searchInput.value.trim();
            if (!query) return;

            window.location.href = `gallery.html?search=${encodeURIComponent(query)}`;
        });
    }

    // ==================================================
    // Home Gallery Card Links
    // If your homepage gallery images are wrapped in links,
    // no special JS is needed here.
    // ==================================================

    // ==================================================
    // Console
    // ==================================================
    console.log("Mythic Frames Loaded Successfully");
});