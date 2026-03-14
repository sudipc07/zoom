const revealNodes = document.querySelectorAll(".reveal");
const parallaxNodes = document.querySelectorAll("[data-parallax]");
const mediaFrames = document.querySelectorAll(".media-frame img");
const tiltFrames = document.querySelectorAll(".media-frame");
const navToggle = document.querySelector(".nav-toggle");
const mobileMenuLinks = document.querySelectorAll(".mobile-menu a");

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
  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("menu-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });

  mobileMenuLinks.forEach((link) => {
    link.addEventListener("click", () => {
      document.body.classList.remove("menu-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Open menu");
    });
  });
}

updateParallax();
window.addEventListener("scroll", updateParallax, { passive: true });
window.addEventListener("resize", updateParallax);
