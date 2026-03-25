const revealNodes = document.querySelectorAll(".reveal");
const parallaxNodes = document.querySelectorAll("[data-parallax]");
const mediaFrames = document.querySelectorAll(".media-frame img");
const tiltFrames = document.querySelectorAll(".media-frame");
const navToggle = document.querySelector(".nav-toggle");
const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");
const desktopNavMedia = window.matchMedia("(min-width: 1081px)");
const themeButtons = document.querySelectorAll(".theme-option");
const themeStorageKey = "zoom16-theme";

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.14,
    rootMargin: "0px 0px -8% 0px",
  }
);

revealNodes.forEach((node) => revealObserver.observe(node));

const updateParallax = () => {
  const viewportHeight = window.innerHeight;

  parallaxNodes.forEach((node) => {
    const speed = Number(node.dataset.parallax || 0);
    const rect = node.getBoundingClientRect();
    const offset =
      ((rect.top + rect.height / 2 - viewportHeight / 2) / viewportHeight) *
      speed;

    node.style.setProperty("--parallax-offset", `${offset}px`);
  });
};

const markFallback = (image) => {
  const frame = image.closest(".media-frame");

  if (!frame || frame.classList.contains("is-fallback")) {
    return;
  }

  frame.classList.add("is-fallback");
  image.remove();
};

mediaFrames.forEach((image) => {
  image.addEventListener("error", () => markFallback(image));

  if (image.complete && image.naturalWidth === 0) {
    markFallback(image);
  }
});

const canTilt =
  window.matchMedia("(hover: hover)").matches &&
  window.matchMedia("(pointer: fine)").matches;

if (canTilt) {
  tiltFrames.forEach((frame) => {
    frame.addEventListener("pointermove", (event) => {
      const rect = frame.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const rotateY = (x - 0.5) * 18;

      frame.style.setProperty("--card-tilt-y", `${rotateY}deg`);
    });

    frame.addEventListener("pointerleave", () => {
      frame.style.setProperty("--card-tilt-y", "0deg");
    });
  });
}

if (navToggle) {
  const closeMenu = () => {
    document.body.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");

    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  desktopNavMedia.addEventListener("change", (event) => {
    if (event.matches) {
      closeMenu();
    }
  });
}

if (themeButtons.length > 0) {
  const availableThemes = new Set(
    Array.from(themeButtons, (button) => button.dataset.themeValue).filter(Boolean)
  );

  const setTheme = (theme) => {
    if (!availableThemes.has(theme)) {
      return;
    }

    document.body.dataset.theme = theme;

    themeButtons.forEach((button) => {
      const isActive = button.dataset.themeValue === theme;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });

    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {}
  };

  let initialTheme = document.body.dataset.theme || "rose";

  try {
    const storedTheme = window.localStorage.getItem(themeStorageKey);

    if (storedTheme && availableThemes.has(storedTheme)) {
      initialTheme = storedTheme;
    }
  } catch {}

  setTheme(initialTheme);

  themeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setTheme(button.dataset.themeValue);
    });
  });
}

updateParallax();
window.addEventListener("scroll", updateParallax, { passive: true });
window.addEventListener("resize", updateParallax);
