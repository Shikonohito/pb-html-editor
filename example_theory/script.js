const appShell = document.querySelector("#appShell");
const sidebarToggle = document.querySelector("#sidebarToggle");
const innerToggle = document.querySelector("#innerToggle");
const themeToggle = document.querySelector("#themeToggle");
const tocItems = document.querySelectorAll(".toc-item");
const lessonSections = document.querySelectorAll(".lesson-section");
const quizOptions = document.querySelectorAll(".quiz-option");
const quizInputForms = document.querySelectorAll(".quiz-input-form");
const mobileSidebarQuery = window.matchMedia("(max-width: 820px)");
const sectionById = new Map(Array.from(lessonSections, (section) => [section.id, section]));
let scrollTicking = false;

function setSidebar(open) {
  appShell.classList.toggle("sidebar-collapsed", !open);
  sidebarToggle.setAttribute("aria-expanded", String(open));
  sidebarToggle.setAttribute("aria-label", open ? "Скрыть левую панель" : "Открыть левую панель");
}

function toggleSidebar() {
  setSidebar(appShell.classList.contains("sidebar-collapsed"));
}

function setCurrentTocItem(sectionId) {
  tocItems.forEach((item) => {
    const isCurrent = item.getAttribute("href") === `#${sectionId}`;

    item.classList.toggle("current", isCurrent);
    if (isCurrent) {
      item.setAttribute("aria-current", "location");
    } else {
      item.removeAttribute("aria-current");
    }
  });
}

function getCurrentSectionId() {
  const headerOffset = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header-height")) || 0;
  let currentSectionId = lessonSections[0]?.id;
  let bestVisibleRatio = 0;

  lessonSections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, headerOffset);
    const visibleRatio = Math.max(0, visibleHeight) / rect.height;

    if (visibleRatio >= bestVisibleRatio) {
      bestVisibleRatio = visibleRatio;
      currentSectionId = section.id;
    }
  });

  return currentSectionId;
}

function updateCurrentTocItem() {
  setCurrentTocItem(getCurrentSectionId());
  scrollTicking = false;
}

function requestCurrentTocUpdate() {
  if (scrollTicking) {
    return;
  }

  scrollTicking = true;
  window.requestAnimationFrame(updateCurrentTocItem);
}

sidebarToggle.addEventListener("click", toggleSidebar);
innerToggle.addEventListener("click", toggleSidebar);

tocItems.forEach((item) => {
  item.addEventListener("click", () => {
    const sectionId = item.getAttribute("href").slice(1);

    if (sectionById.has(sectionId)) {
      setCurrentTocItem(sectionId);
    }

    if (mobileSidebarQuery.matches) {
      setSidebar(false);
    }
  });
});

window.addEventListener("scroll", requestCurrentTocUpdate, { passive: true });
window.addEventListener("resize", requestCurrentTocUpdate);
setCurrentTocItem(getCurrentSectionId());

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

quizOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const quizBlock = option.closest(".quiz-block");
    const blockOptions = quizBlock.querySelectorAll(".quiz-option");
    const isMultiple = quizBlock.dataset.quizMode === "multiple";
    const isCorrect = option.dataset.correct === "true";

    if (!isMultiple) {
      blockOptions.forEach((item) => {
        item.classList.remove("is-correct", "is-incorrect");
        item.setAttribute("aria-pressed", "false");

        const itemFeedback = item.closest(".quiz-choice").querySelector(".quiz-feedback");
        itemFeedback.textContent = "";
        itemFeedback.className = "quiz-feedback";
      });
    } else if (option.getAttribute("aria-pressed") === "true") {
      const feedback = option.closest(".quiz-choice").querySelector(".quiz-feedback");

      option.classList.remove("is-correct", "is-incorrect");
      option.setAttribute("aria-pressed", "false");
      feedback.textContent = "";
      feedback.className = "quiz-feedback";
      return;
    }

    const feedback = option.closest(".quiz-choice").querySelector(".quiz-feedback");

    option.classList.add(isCorrect ? "is-correct" : "is-incorrect");
    option.setAttribute("aria-pressed", "true");
    feedback.textContent = option.dataset.feedback;
    feedback.className = `quiz-feedback is-visible ${isCorrect ? "is-correct" : "is-incorrect"}`;
  });
});

quizInputForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const input = form.querySelector(".quiz-input");
    const feedback = form.querySelector(".quiz-feedback");
    const acceptedAnswers = form.dataset.answer.split("|").map((answer) => answer.trim().toLowerCase());
    const userAnswer = input.value.trim().toLowerCase();
    const isCorrect = acceptedAnswers.includes(userAnswer);

    feedback.textContent = isCorrect
      ? feedback.dataset.correctFeedback
      : feedback.dataset.incorrectFeedback;
    feedback.className = `quiz-feedback is-visible ${isCorrect ? "is-correct" : "is-incorrect"}`;
  });
});
