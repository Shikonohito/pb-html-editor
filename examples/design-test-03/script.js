const appShell = document.querySelector("#appShell");
const sidebarToggle = document.querySelector("#sidebarToggle");
const innerToggle = document.querySelector("#innerToggle");
const themeToggle = document.querySelector("#themeToggle");
const tocItems = document.querySelectorAll(".toc-item");
const mobileSidebarQuery = window.matchMedia("(max-width: 820px)");

function setSidebar(open) {
  appShell.classList.toggle("sidebar-collapsed", !open);
  sidebarToggle.setAttribute("aria-expanded", String(open));
  sidebarToggle.setAttribute("aria-label", open ? "Скрыть левую панель" : "Открыть левую панель");
}

function toggleSidebar() {
  setSidebar(appShell.classList.contains("sidebar-collapsed"));
}

sidebarToggle.addEventListener("click", toggleSidebar);
innerToggle.addEventListener("click", toggleSidebar);

tocItems.forEach((item) => {
  item.addEventListener("click", () => {
    if (mobileSidebarQuery.matches) {
      setSidebar(false);
    }
  });
});

function setLightTheme(enabled) {
  document.body.classList.toggle("theme-light", enabled);
  themeToggle.setAttribute("aria-pressed", String(enabled));
  themeToggle.setAttribute(
    "aria-label",
    enabled ? "Включить темный вариант" : "Включить светлый вариант",
  );
}

themeToggle.addEventListener("click", () => {
  setLightTheme(!document.body.classList.contains("theme-light"));
});
