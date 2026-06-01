document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Smooth scrolling is progressive-enhancement only; the site works without it.
  if (window.Lenis && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  }

  const header = document.querySelector(".site-header");
  const onScroll = () => header && header.classList.toggle("scrolled", window.scrollY > 24);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav-links");
  toggle?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => nav.classList.remove("open")));

  const glow = document.querySelector(".mouse-glow");
  if (glow) {
    window.addEventListener("pointermove", (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  }

  // Reveal cards and sections only once to keep scrolling light.
  const revealItems = document.querySelectorAll("[data-reveal]");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("revealed");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });
  revealItems.forEach((item, index) => {
    item.style.setProperty("--delay", `${Math.min(index % 6, 5) * 70}ms`);
    revealObserver.observe(item);
  });

  // Count up metrics when the user reaches the numbers section.
  const counters = document.querySelectorAll("[data-count]");
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || "+";
      const duration = 1400;
      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${Math.floor(target * eased).toLocaleString()}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.4 });
  counters.forEach((counter) => counterObserver.observe(counter));

  document.querySelectorAll(".faq-question").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".faq-item");
      const group = item.parentElement;
      group.querySelectorAll(".faq-item").forEach((faq) => {
        if (faq !== item) faq.classList.remove("open");
      });
      item.classList.toggle("open");
    });
  });

  if (window.Swiper && document.querySelector(".testimonial-slider")) {
    new Swiper(".testimonial-slider", {
      slidesPerView: 1,
      spaceBetween: 18,
      loop: true,
      autoplay: { delay: 4200, disableOnInteraction: false },
      pagination: { el: ".swiper-pagination", clickable: true },
      breakpoints: {
        768: { slidesPerView: 2 },
        1100: { slidesPerView: 3 }
      }
    });
  }

  // Contact validation stays client-side and avoids sending incomplete leads.
  const form = document.querySelector("[data-contact-form]");
  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      let valid = true;
      const success = form.querySelector(".success");
      success?.classList.remove("show");

      form.querySelectorAll("[data-required]").forEach((field) => {
        const error = form.querySelector(`[data-error-for="${field.name}"]`);
        let message = "";
        if (!field.value.trim()) message = "This field is required.";
        if (field.type === "email" && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value)) message = "Please enter a valid email.";
        if (field.name === "phone" && field.value && !/^[0-9+\-\s]{8,16}$/.test(field.value)) message = "Please enter a valid phone number.";
        if (error) error.textContent = message;
        if (message) valid = false;
      });

      if (valid) {
        form.reset();
        success?.classList.add("show");
      }
    });
  }
});
