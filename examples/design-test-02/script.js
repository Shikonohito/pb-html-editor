const tasks = [
  {
    title: "Собрать список квадратов",
    topic: "Цикл for",
    level: "Базовый",
    goal: "Напишите код, который создаёт список квадратов чисел от 1 до 6 включительно и выводит его.",
    starter: "squares = []\nfor number in range(1, 7):\n    # ваш код\n\nprint(squares)",
    expected: "[1, 4, 9, 16, 25, 36]",
  },
  {
    title: "Отфильтровать оценки",
    topic: "Условия",
    level: "Средний",
    goal: "Из списка marks оставьте только оценки 4 и 5. Итоговый список сохраните в переменную strong_marks.",
    starter: "marks = [5, 3, 4, 2, 5, 4, 3]\nstrong_marks = []\n\n# ваш код\nprint(strong_marks)",
    expected: "[5, 4, 5, 4]",
  },
  {
    title: "Посчитать сумму покупок",
    topic: "Аккумулятор",
    level: "Базовый",
    goal: "Посчитайте общую стоимость товаров из списка prices и выведите строку с итогом.",
    starter: "prices = [120, 80, 45, 155]\ntotal = 0\n\n# ваш код\nprint(f'Итого: {total}')",
    expected: "Итого: 400",
  },
  {
    title: "Найти самое длинное слово",
    topic: "Строки",
    level: "Средний",
    goal: "В списке words найдите слово с максимальной длиной и выведите его.",
    starter: "words = ['код', 'переменная', 'цикл', 'функция']\nlongest = ''\n\n# ваш код\nprint(longest)",
    expected: "переменная",
  },
  {
    title: "Собрать словарь частот",
    topic: "Словари",
    level: "Повышенный",
    goal: "Посчитайте, сколько раз встречается каждый язык в списке languages. Результат выведите как словарь.",
    starter: "languages = ['python', 'js', 'python', 'go', 'python', 'js']\ncounts = {}\n\n# ваш код\nprint(counts)",
    expected: "{'python': 3, 'js': 2, 'go': 1}",
  },
];

const variants = {
  studio: "variant-studio",
  notebook: "variant-notebook",
  console: "variant-console",
  review: "variant-review",
  exam: "variant-exam",
};

const icons = [
  '<path d="M8 4 3 12l5 8 1.7-1.1L5.4 12l4.3-6.9L8 4Zm8 0-1.7 1.1 4.3 6.9-4.3 6.9L16 20l5-8-5-8Z"/>',
  '<path d="M4 5h16v3H4V5Zm0 5h10v3H4v-3Zm0 5h16v4H4v-4Z"/>',
  '<path d="M6 4h12v2H6V4Zm-2 5h16v11H4V9Zm3 3v5h10v-5H7Z"/>',
  '<path d="M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 2.2 5.4 2.7L12 10.6 6.6 7.9 12 5.2ZM6 9.6l5 2.5v6.2l-5-2.5V9.6Zm7 8.7v-6.2l5-2.5v6.2l-5 2.5Z"/>',
  '<path d="M5 3h14v18H5V3Zm3 4v2h8V7H8Zm0 4v2h8v-2H8Zm0 4v2h5v-2H8Z"/>',
];

const state = {
  activeTask: 0,
  statuses: tasks.map(() => "pending"),
};

const app = document.querySelector(".practice-app");
const variantTabs = document.querySelectorAll(".variant-tab");
const iconNav = document.querySelector(".task-icon-nav");
const taskList = document.querySelector(".task-list");
const kicker = document.querySelector(".task-kicker");
const activeTitle = document.querySelector(".active-title");
const taskContent = document.querySelector(".task-content");
const toggles = document.querySelectorAll(".sidebar-toggle");

function taskIcon(index) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[index]}</svg>`;
}

function renderNav() {
  iconNav.innerHTML = tasks
    .map(
      (task, index) => `
        <button
          class="task-btn ${index === state.activeTask ? "is-active" : ""}"
          type="button"
          data-task="${index}"
          data-status="${state.statuses[index]}"
          aria-label="Открыть задание ${index + 1}: ${task.title}"
          title="${task.title}"
        >
          ${taskIcon(index)}
        </button>
      `,
    )
    .join("");
}

function renderList() {
  taskList.innerHTML = tasks
    .map(
      (task, index) => `
        <li class="toc-item">
          <button
            class="toc-button ${index === state.activeTask ? "is-active" : ""}"
            type="button"
            data-task="${index}"
            data-status="${state.statuses[index]}"
          >
            <span>
              <strong>${task.title}</strong><br />
              <span>${task.topic} · ${task.level}</span>
            </span>
            <i class="toc-status" aria-hidden="true"></i>
          </button>
        </li>
      `,
    )
    .join("");
}

function renderTask() {
  const task = tasks[state.activeTask];
  kicker.textContent = `Задание ${state.activeTask + 1} · ${task.topic}`;
  activeTitle.textContent = task.title;
  taskContent.innerHTML = `
    <section class="prompt-band">
      <div class="task-meta">
        <span class="chip">${task.level}</span>
        <span class="chip">Python 3</span>
        <span class="chip">Состояние: ${statusLabel(state.statuses[state.activeTask])}</span>
      </div>
      <p>${task.goal}</p>
    </section>

    <section class="workbench">
      <div class="editor-zone">
        <div class="panel-title">
          <span>Решение</span>
          <span>main.py</span>
        </div>
        <textarea class="code-input" spellcheck="false" aria-label="Код решения">${task.starter}</textarea>
      </div>
      <div class="expected-zone">
        <div class="panel-title">
          <span>Ожидаемый результат</span>
          <span>stdout</span>
        </div>
        <pre class="expected-output">${task.expected}</pre>
      </div>
    </section>

    <section class="result-row" aria-live="polite">
      <span class="result-text">${resultText(state.statuses[state.activeTask])}</span>
      <div class="check-actions">
        <button class="check-btn correct" type="button" data-result="correct">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 16.2-3.5-3.5L4 14.2 9 19 20.5 7.5 19 6 9 16.2Z"/></svg>
          Верно
        </button>
        <button class="check-btn wrong" type="button" data-result="wrong">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6.4 5 5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6L6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5Z"/></svg>
          Неверно
        </button>
      </div>
    </section>
  `;
}

function statusLabel(status) {
  if (status === "correct") return "решено верно";
  if (status === "wrong") return "нужна правка";
  return "не проверено";
}

function resultText(status) {
  if (status === "correct") return "Задание отмечено как решённое верно. Иконка в шапке обновлена.";
  if (status === "wrong") return "Решение отмечено неверным. Иконка в шапке показывает ошибку.";
  return "Проверьте решение, чтобы обновить состояние задания.";
}

function render() {
  renderNav();
  renderList();
  renderTask();
}

function setTask(index) {
  state.activeTask = Number(index);
  render();
}

function setStatus(status) {
  state.statuses[state.activeTask] = status;
  render();
}

function setVariant(name) {
  const nextClass = variants[name];
  if (!nextClass) return;
  Object.values(variants).forEach((variantClass) => app.classList.remove(variantClass));
  app.classList.add(nextClass);
  app.dataset.currentVariant = name;
  variantTabs.forEach((tab) => {
    const active = tab.dataset.variant === name;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
  });
}

document.addEventListener("click", (event) => {
  const taskButton = event.target.closest("[data-task]");
  if (taskButton) {
    setTask(taskButton.dataset.task);
    return;
  }

  const checkButton = event.target.closest("[data-result]");
  if (checkButton) {
    setStatus(checkButton.dataset.result);
    return;
  }

  const variantButton = event.target.closest("[data-variant]");
  if (variantButton) {
    setVariant(variantButton.dataset.variant);
  }
});

toggles.forEach((toggle) => {
  toggle.addEventListener("click", () => {
    app.classList.toggle("is-sidebar-closed");
  });
});

render();
