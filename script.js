const menuToggle = document.querySelector(".menu-toggle");
const siteNav = document.querySelector(".site-nav");
const page = document.body.dataset.page;
const tabLinks = document.querySelectorAll("[data-page-link]");

if (menuToggle && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

tabLinks.forEach((link) => {
  if (link.dataset.pageLink === page) {
    link.classList.add("mini-tab--active");
    link.setAttribute("aria-current", "page");
  }
});
