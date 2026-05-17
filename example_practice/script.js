const appShell = document.querySelector("#appShell");
const sidebarToggle = document.querySelector("#sidebarToggle");
const innerToggle = document.querySelector("#innerToggle");
const themeToggle = document.querySelector("#themeToggle");
const tocItems = document.querySelectorAll(".toc-item");
const taskButtons = document.querySelectorAll(".task-jump");
const taskSections = document.querySelectorAll(".task-section");
const codeLabs = document.querySelectorAll("[data-code-lab]");
const mobileSidebarQuery = window.matchMedia("(max-width: 820px)");
const sectionById = new Map(Array.from(taskSections, (section) => [section.id, section]));
const statusLabels = {
  pending: "В ожидании проверки",
  correct: "Верно",
  incorrect: "Неверно",
};
const copyIconSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8 7a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-7a2 2 0 0 1-2-2V7Z" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v1" />
  </svg>
`;
const copiedIconSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12 5 5L20 7" />
  </svg>
`;
const resetIconSvg = `
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5.2 8.1a8 8 0 1 1-.5 7.3" />
    <path d="M5 4v4h4" />
  </svg>
`;
let pyodideReadyPromise;
let monacoReadyPromise;
const monacoEditors = new Set();

function setSidebar(open) {
  appShell.classList.toggle("sidebar-collapsed", !open);
  sidebarToggle.setAttribute("aria-expanded", String(open));
  sidebarToggle.setAttribute("aria-label", open ? "Скрыть левую панель" : "Открыть левую панель");
}

function toggleSidebar() {
  setSidebar(appShell.classList.contains("sidebar-collapsed"));
}

function getTaskStatus(sectionId) {
  return document.querySelector(`.toc-item[href="#${sectionId}"]`)?.dataset.status || "pending";
}

function setActiveTask(sectionId) {
  if (!sectionById.has(sectionId)) {
    return;
  }

  taskSections.forEach((section) => {
    section.classList.toggle("active", section.id === sectionId);
  });

  tocItems.forEach((item) => {
    const isCurrent = item.getAttribute("href") === `#${sectionId}`;
    item.classList.toggle("current", isCurrent);
    if (isCurrent) {
      item.setAttribute("aria-current", "location");
    } else {
      item.removeAttribute("aria-current");
    }
  });

  taskButtons.forEach((button) => {
    const isCurrent = button.dataset.taskTarget === sectionId;
    button.classList.toggle("current", isCurrent);
    if (isCurrent) {
      button.setAttribute("aria-current", "true");
    } else {
      button.removeAttribute("aria-current");
    }
  });

  window.requestAnimationFrame(relayoutMonacoEditors);
}

function updateTaskStatus(sectionId, status) {
  const label = statusLabels[status] || statusLabels.pending;
  const tocItem = document.querySelector(`.toc-item[href="#${sectionId}"]`);
  const topbarButton = document.querySelector(`.task-jump[data-task-target="${sectionId}"]`);

  if (tocItem) {
    tocItem.dataset.status = status;
    tocItem.querySelector("em").textContent = label;
  }

  if (topbarButton) {
    topbarButton.dataset.status = status;
    topbarButton.setAttribute("aria-label", `${sectionById.get(sectionId).dataset.taskTitle}: ${label}`);
  }
}

sidebarToggle.addEventListener("click", toggleSidebar);
innerToggle.addEventListener("click", toggleSidebar);

tocItems.forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    setActiveTask(item.getAttribute("href").slice(1));

    if (mobileSidebarQuery.matches) {
      setSidebar(false);
    }
  });
});

taskButtons.forEach((button) => {
  button.dataset.status = getTaskStatus(button.dataset.taskTarget);
  button.addEventListener("click", () => setActiveTask(button.dataset.taskTarget));
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
  updateEditorThemes();
});

function getEditorTheme() {
  return "vs-dark";
}

function updateEditorThemes() {
  if (window.monaco) {
    window.monaco.editor.setTheme(getEditorTheme());
  }
}

function relayoutMonacoEditors() {
  monacoEditors.forEach((editor) => editor.layout());
}

function getMonaco() {
  if (monacoReadyPromise) {
    return monacoReadyPromise;
  }

  monacoReadyPromise = new Promise((resolve, reject) => {
    if (window.monaco) {
      resolve(window.monaco);
      return;
    }

    if (!window.require) {
      reject(new Error("Monaco loader is not available"));
      return;
    }

    window.require.config({
      paths: {
        vs: "https://cdn.jsdelivr.net/npm/monaco-editor@0.49.0/min/vs",
      },
    });
    window.require(["vs/editor/editor.main"], () => resolve(window.monaco), reject);
  });

  return monacoReadyPromise;
}

function getPyodide() {
  if (pyodideReadyPromise) {
    return pyodideReadyPromise;
  }

  pyodideReadyPromise = window.loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.26.4/full/",
  });

  return pyodideReadyPromise;
}

function appendOutput(output, text) {
  output.append(document.createTextNode(text));
  output.scrollTop = output.scrollHeight;
}

function getCodeLabCode(lab) {
  const source = lab.querySelector(".code-source");
  return lab.editor ? lab.editor.getValue() : source.value;
}

function getCopyButtonCode(copyButton) {
  const lab = copyButton.closest("[data-code-lab]");
  return getCodeLabCode(lab);
}

function setBusy(button, isBusy) {
  button.disabled = isBusy;
  button.setAttribute("aria-busy", String(isBusy));
}

function setCopyButtonCopied(copyButton) {
  const originalLabel = copyButton.getAttribute("aria-label");

  copyButton.setAttribute("aria-label", "Код скопирован");
  copyButton.innerHTML = copiedIconSvg;
  copyButton.classList.add("is-copied");

  window.setTimeout(() => {
    copyButton.setAttribute("aria-label", originalLabel || "Скопировать код");
    copyButton.innerHTML = copyIconSvg;
    copyButton.classList.remove("is-copied");
  }, 1200);
}

async function copyCode(copyButton) {
  const code = getCopyButtonCode(copyButton);

  try {
    await navigator.clipboard.writeText(code);
    setCopyButtonCopied(copyButton);
  } catch {
    const copyArea = document.createElement("textarea");

    copyArea.value = code;
    copyArea.setAttribute("readonly", "");
    copyArea.style.position = "fixed";
    copyArea.style.inset = "0 auto auto 0";
    copyArea.style.opacity = "0";
    document.body.append(copyArea);
    copyArea.select();
    document.execCommand("copy");
    copyArea.remove();
    setCopyButtonCopied(copyButton);
  }
}

async function runCodeLab(lab) {
  const runButton = lab.querySelector(".run-button");
  const output = lab.querySelector(".code-output");
  const code = getCodeLabCode(lab);

  output.className = "code-output";
  output.textContent = "";
  setBusy(runButton, true);

  try {
    if (!window.loadPyodide) {
      throw new Error("Pyodide is not loaded");
    }

    const pyodide = await getPyodide();

    pyodide.setStdout({
      batched: (text) => appendOutput(output, `${text}\n`),
    });
    pyodide.setStderr({
      batched: (text) => appendOutput(output, `${text}\n`),
    });
    await pyodide.runPythonAsync(code);

    if (!output.textContent.trim()) {
      appendOutput(output, "Код выполнен без вывода.\n");
    }
  } catch (error) {
    output.classList.add("is-error");
    appendOutput(output, `${error.message || error}\n`);
  } finally {
    setBusy(runButton, false);
  }
}

function getTaskTests(lab) {
  return JSON.parse(lab.querySelector(".task-tests").textContent);
}

function buildCheckScript(code, tests) {
  return `
import json
import traceback

user_code = ${JSON.stringify(code)}
tests = json.loads(${JSON.stringify(JSON.stringify(tests))})
namespace = {}
results = []

try:
    exec(user_code, namespace)
    for test in tests:
        try:
            actual = eval(test["expression"], namespace)
            results.append({
                "expression": test["expression"],
                "actual": actual,
                "expected": test["expected"],
                "passed": actual == test["expected"],
            })
        except Exception:
            results.append({
                "expression": test["expression"],
                "actual": traceback.format_exc(limit=1).strip(),
                "expected": test["expected"],
                "passed": False,
            })
except Exception:
    results.append({
        "expression": "запуск решения",
        "actual": traceback.format_exc(limit=1).strip(),
        "expected": "код без ошибок",
        "passed": False,
    })

json.dumps(results, ensure_ascii=False)
`;
}

async function checkCodeLab(lab) {
  const section = lab.closest(".task-section");
  const checkButton = lab.querySelector(".check-button");
  const output = lab.querySelector(".code-output");
  const code = getCodeLabCode(lab);

  output.className = "code-output";
  output.textContent = "";
  setBusy(checkButton, true);

  try {
    if (!window.loadPyodide) {
      throw new Error("Pyodide is not loaded");
    }

    const pyodide = await getPyodide();
    const results = JSON.parse(await pyodide.runPythonAsync(buildCheckScript(code, getTaskTests(lab))));
    const passed = results.every((result) => result.passed);

    output.classList.add(passed ? "is-success" : "is-error");
    appendOutput(output, `${passed ? "Верно" : "Неверно"}\n\n`);
    results.forEach((result, index) => {
      appendOutput(output, `Тест ${index + 1}: ${result.expression}\n`);
      appendOutput(output, `Ожидалось: ${JSON.stringify(result.expected)}\n`);
      appendOutput(output, `Получено: ${JSON.stringify(result.actual)}\n`);
      appendOutput(output, `${result.passed ? "Пройден" : "Не пройден"}\n\n`);
    });
    updateTaskStatus(section.id, passed ? "correct" : "incorrect");
  } catch (error) {
    output.classList.add("is-error");
    appendOutput(output, `${error.message || error}\n`);
    updateTaskStatus(section.id, "incorrect");
  } finally {
    setBusy(checkButton, false);
  }
}

function getPresetCode(source) {
  return source?.dataset.initialCode ?? source?.value ?? "";
}

function addResetCodeButton(lab) {
  const actions = lab.querySelector(".code-lab-actions");

  if (!actions || actions.querySelector(".reset-code-button")) {
    return;
  }

  const resetButton = document.createElement("button");

  resetButton.type = "button";
  resetButton.className = "reset-code-button";
  resetButton.setAttribute("aria-label", "Сбросить код");
  resetButton.innerHTML = resetIconSvg;
  actions.prepend(resetButton);
  resetButton.addEventListener("click", () => resetCodeLab(lab));
}

function resetCodeLab(lab) {
  const section = lab.closest(".task-section");
  const source = lab.querySelector(".code-source");
  const presetCode = getPresetCode(source);

  if (lab.editor) {
    lab.editor.setValue(presetCode);
    lab.editor.focus();
  } else if (source) {
    source.value = presetCode;
    source.focus();
  }

  const output = lab.querySelector(".code-output");

  output.className = "code-output";
  output.textContent = "";
  updateTaskStatus(section.id, "pending");
}

function initFallbackEditor(lab) {
  const source = lab.querySelector(".code-source");
  const container = lab.querySelector(".code-editor");

  source.style.display = "block";
  source.classList.add("code-editor");
  autoSizeTextarea(source);
  container.replaceWith(source);
}

function autoSizeTextarea(textarea) {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight + 2}px`;
  textarea.addEventListener("input", () => {
    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight + 2}px`;
  });
}

function autoSizeMonacoEditor(editor, container) {
  let resizeFrame = null;

  const updateHeight = () => {
    resizeFrame = null;
    const contentHeight = Math.ceil(editor.getContentHeight());

    container.style.height = `${contentHeight + 2}px`;
    editor.layout({ width: container.clientWidth, height: contentHeight });
  };

  const scheduleUpdate = () => {
    if (resizeFrame !== null) {
      return;
    }

    resizeFrame = window.requestAnimationFrame(updateHeight);
  };

  editor.onDidContentSizeChange(updateHeight);

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container);
  }

  scheduleUpdate();
}

function createMonacoEditor(monaco, container, source) {
  const editor = monaco.editor.create(container, {
    value: source.value,
    language: "python",
    theme: getEditorTheme(),
    automaticLayout: true,
    fontSize: 14,
    minimap: { enabled: false },
    padding: { top: 12, bottom: 12 },
    scrollBeyondLastLine: false,
    scrollbar: {
      alwaysConsumeMouseWheel: false,
      handleMouseWheel: false,
    },
    tabSize: 4,
    wordWrap: "on",
  });

  autoSizeMonacoEditor(editor, container);
  monacoEditors.add(editor);
  container.editor = editor;

  return editor;
}

window.addEventListener("resize", () => {
  window.requestAnimationFrame(relayoutMonacoEditors);
});

codeLabs.forEach((lab) => {
  const source = lab.querySelector(".code-source");

  if (source) {
    source.dataset.initialCode = source.value;
  }

  lab.querySelector(".run-button").addEventListener("click", () => runCodeLab(lab));
  lab.querySelector(".check-button").addEventListener("click", () => checkCodeLab(lab));
  lab.querySelector(".copy-code-button").addEventListener("click", (event) => copyCode(event.currentTarget));
  addResetCodeButton(lab);
});

if (codeLabs.length) {
  getMonaco()
    .then((monaco) => {
      codeLabs.forEach((lab) => {
        const container = lab.querySelector(".code-editor");
        const source = lab.querySelector(".code-source");

        lab.editor = createMonacoEditor(monaco, container, source);
      });
    })
    .catch(() => {
      codeLabs.forEach(initFallbackEditor);
    });
}
