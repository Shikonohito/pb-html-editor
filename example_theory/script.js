document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Sidebar Toggle Logic
    // ==========================================
    const sidebar = document.getElementById('sidebar');
    const toggleBtn = document.getElementById('toggle-sidebar');
    const fabBtn = document.getElementById('mobile-fab');
    const tocLinks = document.querySelectorAll('.toc-link');
    const overlay = document.getElementById('overlay');

    function isMobileOrTablet() {
        return window.innerWidth <= 1024;
    }

    function toggleSidebar() {
        if (isMobileOrTablet()) {
            sidebar.classList.toggle('open');
            sidebar.classList.remove('closed');
            overlay.classList.toggle('active');
        } else {
            sidebar.classList.toggle('closed');
            sidebar.classList.remove('open');
        }
    }

    if(toggleBtn) toggleBtn.addEventListener('click', toggleSidebar);
    if(fabBtn) fabBtn.addEventListener('click', toggleSidebar);
    if(overlay) overlay.addEventListener('click', toggleSidebar);

    window.addEventListener('resize', () => {
        if (isMobileOrTablet()) {
            sidebar.classList.remove('closed');
        } else {
            sidebar.classList.remove('open');
            if (overlay) overlay.classList.remove('active');
        }
    });

    tocLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default hash jump

            if (isMobileOrTablet()) {
                sidebar.classList.remove('open');
                if (overlay) overlay.classList.remove('active');
            }

            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection && contentWrapper) {
                // Calculate position to center the section header
                const header = targetSection.querySelector('h3');
                const targetEl = header ? header : targetSection;

                const wrapperRect = contentWrapper.getBoundingClientRect();
                const targetRect = targetEl.getBoundingClientRect();

                // Calculate distance to scroll:
                // Current scroll position + distance from top of wrapper to target - quarter wrapper height + half target height
                const scrollPos = contentWrapper.scrollTop + (targetRect.top - wrapperRect.top) - (wrapperRect.height / 4) + (targetRect.height / 2);

                contentWrapper.scrollTo({
                    top: scrollPos,
                    behavior: 'smooth'
                });
            }

            // Update active marker immediately on click
            tocLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Update TOC active link using Intersection Observer
    const contentWrapper = document.querySelector('.content-wrapper');
    const sections = document.querySelectorAll('.lesson-section');

    const observerOptions = {
        root: contentWrapper,
        rootMargin: '-30% 0px -50% 0px',
        threshold: 0
    };

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                
                tocLinks.forEach(link => {
                    const isActive = link.classList.contains('active');
                    const shouldBeActive = link.getAttribute('href') === `#${id}`;

                    if (shouldBeActive && !isActive) {
                        link.classList.add('active');
                    } else if (!shouldBeActive && isActive) {
                        link.classList.remove('active');
                    }
                });
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        sectionObserver.observe(section);
    });


    // ==========================================
    // 2. Special Blocks Toggle Logic
    // ==========================================
    // Wrap block bodies to allow smooth CSS grid animation
    document.querySelectorAll('.block-body').forEach(blockBody => {
        const wrapper = document.createElement('div');
        wrapper.className = 'block-body-wrapper';
        blockBody.parentNode.insertBefore(wrapper, blockBody);
        wrapper.appendChild(blockBody);
    });

    const toggleButtons = document.querySelectorAll('.toggle-block');
    toggleButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const wrapper = e.target.closest('.special-block').querySelector('.block-body-wrapper');
            const isHidden = wrapper.classList.contains('collapsed');

            if (isHidden) {
                wrapper.classList.remove('collapsed');
                e.target.textContent = '▼';
            } else {
                wrapper.classList.add('collapsed');
                e.target.textContent = '▶';
            }
        });
    });


    // ==========================================
    // 3. Tests Logic
    // ==========================================

    function animateFeedbackText(element, text) {
        element.innerHTML = `<span class="feedback-text-content">${text}</span>`;
        // Trigger reflow
        void element.offsetWidth;
        element.classList.add('show');
    }

    // Radio (Один вариант)
    const radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            const label = e.target.closest('label');
            const isCorrect = e.target.dataset.correct === "true";
            const feedbackText = e.target.dataset.feedback;

            // For radio buttons in the same group, we need to hide feedback of others
            const groupName = e.target.getAttribute('name');
            const groupRadios = document.querySelectorAll(`input[type="radio"][name="${groupName}"]`);
            groupRadios.forEach(r => {
                if (r !== e.target) {
                    const rLabel = r.closest('label');
                    const rFeedback = rLabel.nextElementSibling;
                    if (rFeedback && rFeedback.classList.contains('inline-feedback')) {
                        rFeedback.classList.remove('show');
                        // Optional: remove it from DOM after transition, but keeping it is fine
                    }
                }
            });

            let feedbackEl = label.nextElementSibling;
            if (!feedbackEl || !feedbackEl.classList.contains('inline-feedback')) {
                feedbackEl = document.createElement('div');
                feedbackEl.className = 'inline-feedback';
                label.parentNode.insertBefore(feedbackEl, label.nextSibling);
            }

            feedbackEl.className = `inline-feedback feedback-item ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
            animateFeedbackText(feedbackEl, feedbackText);
        });
    });

    // Checkbox (Несколько вариантов)
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const label = e.target.closest('label');
            const isCorrect = e.target.dataset.correct === "true";
            const feedbackText = e.target.dataset.feedback;

            let feedbackEl = label.nextElementSibling;
            if (!feedbackEl || !feedbackEl.classList.contains('inline-feedback')) {
                feedbackEl = document.createElement('div');
                feedbackEl.className = 'inline-feedback';
                label.parentNode.insertBefore(feedbackEl, label.nextSibling);
            }

            if (e.target.checked) {
                feedbackEl.className = `inline-feedback feedback-item ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
                animateFeedbackText(feedbackEl, feedbackText);
            } else {
                feedbackEl.classList.remove('show');
            }
        });
    });

    // Text Input (Поле ввода)
    const checkBtns = document.querySelectorAll('.check-input-btn');
    checkBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const group = e.target.closest('.test-input-group');
            const input = group.querySelector('.test-text-input');
            const questionDiv = e.target.closest('.test-question');
            const feedbackArea = questionDiv.querySelector('.feedback-area');

            const correctAns = input.dataset.correctAnswer.toLowerCase();
            const userAns = input.value.trim().toLowerCase();

            const isCorrect = correctAns === userAns;

            // "Объяснение всегда одно и то же" -> очищаем старое и показываем новое
            feedbackArea.innerHTML = '';

            const msg = document.createElement('div');
            const textContent = isCorrect ? e.target.dataset.feedback : e.target.dataset.wrong;
            msg.className = `feedback-item ${isCorrect ? 'feedback-correct' : 'feedback-wrong'}`;
            feedbackArea.appendChild(msg);

            animateFeedbackText(msg, textContent);
        });
    });


    // ==========================================
    // 4. Code Block Copy
    // ==========================================
    const copyBtns = document.querySelectorAll('.copy-btn:not(.copy-sandbox-btn)');
    copyBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.currentTarget;
            const container = button.closest('.code-container');
            const codeElem = container.querySelector('code');
            const code = codeElem.innerText;

            navigator.clipboard.writeText(code).then(() => {
                const originalHTML = button.innerHTML;
                button.innerHTML = '<svg width="16" height="16"><use href="#icon-check"></use></svg>';
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                }, 3000);
            }).catch(err => {
                console.error('Ошибка при копировании:', err);
            });
        });
    });


    // ==========================================
    // 5. Sandbox (Monaco + Pyodide) Support Multiple & Runnable Code Blocks
    // ==========================================
    const sandboxInstances = document.querySelectorAll('.sandbox-body');
    const runnableCodeBlocks = document.querySelectorAll('.runnable-code');

    if ((sandboxInstances.length > 0 || runnableCodeBlocks.length > 0) && typeof loadPyodide !== 'undefined' && typeof require !== 'undefined') {
        let pyodideInstance = null;

        async function executePythonCode(code, sandboxOutput, runCodeBtn) {
            if (!pyodideInstance) return;

            sandboxOutput.innerHTML = '';
            sandboxOutput.style.color = '#e0e0e0';

            runCodeBtn.disabled = true;
            runCodeBtn.style.opacity = '0.7';

            const namespace = pyodideInstance.globals.get("dict")();

            // 1. Изолируем функцию input
            namespace.set("__async_input", async (promptText) => {
                return new Promise((resolve) => {
                    if (promptText) {
                        sandboxOutput.appendChild(document.createTextNode(promptText));
                    }
                    const inputField = document.createElement('input');
                    inputField.type = 'text';
                    inputField.className = 'sandbox-input-field';

                    sandboxOutput.appendChild(inputField);
                    sandboxOutput.scrollTop = sandboxOutput.scrollHeight;
                    inputField.focus();

                    inputField.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') {
                            const val = inputField.value;
                            inputField.remove();

                            const valSpan = document.createElement('span');
                            valSpan.textContent = val + '\n';
                            valSpan.style.color = 'var(--color-text-accent)';
                            sandboxOutput.appendChild(valSpan);
                            sandboxOutput.scrollTop = sandboxOutput.scrollHeight;

                            resolve(val);
                        }
                    });
                });
            });

            // 2. Изолируем вывод (print)
            namespace.set("__js_print", (str) => {
                sandboxOutput.appendChild(document.createTextNode(str));
                sandboxOutput.scrollTop = sandboxOutput.scrollHeight;
            });

            namespace.set("__js_err_print", (str) => {
                const span = document.createElement('span');
                span.style.color = 'var(--color-wrong)';
                span.textContent = str;
                sandboxOutput.appendChild(span);
                sandboxOutput.scrollTop = sandboxOutput.scrollHeight;
            });

            try {
                await pyodideInstance.runPythonAsync(`
import sys
import builtins
import ast

def __custom_print(*args, sep=' ', end='\\n', file=None, flush=False):
    if file is None or file == getattr(sys, 'stdout', None):
        __js_print(sep.join(map(str, args)) + end)
    elif file == getattr(sys, 'stderr', None):
        __js_err_print(sep.join(map(str, args)) + end)
    else:
        builtins.print(*args, sep=sep, end=end, file=file, flush=flush)

print = __custom_print

class AsyncInputTransformer(ast.NodeTransformer):
    def visit_Call(self, node):
        self.generic_visit(node)
        if isinstance(node.func, ast.Name) and node.func.id == 'input':
            return ast.Await(value=ast.Call(
                func=ast.Name(id='__async_input', ctx=ast.Load()),
                args=node.args,
                keywords=node.keywords
            ))
        return node

def __transform_and_run(code_str):
    tree = ast.parse(code_str)
    tree = AsyncInputTransformer().visit(tree)
    ast.fix_missing_locations(tree)
    return ast.unparse(tree)
                `, { globals: namespace });

                namespace.set("__user_code", code);
                const asyncCode = await pyodideInstance.runPythonAsync(`__transform_and_run(__user_code)`, { globals: namespace });

                await pyodideInstance.runPythonAsync(asyncCode, { globals: namespace });

                if (sandboxOutput.childNodes.length === 0) {
                    sandboxOutput.textContent = 'No output';
                    sandboxOutput.style.color = '#e0e0e0';
                }
            } catch (err) {
                const span = document.createElement('span');
                span.style.color = 'var(--color-wrong)';
                span.textContent = err.toString() + '\n';
                sandboxOutput.appendChild(span);
                sandboxOutput.scrollTop = sandboxOutput.scrollHeight;
            } finally {
                namespace.destroy();
                runCodeBtn.disabled = false;
                runCodeBtn.style.opacity = '1';
            }
        }

        async function initSandboxes() {
            try {
                // Initialize Pyodide once
                pyodideInstance = await loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.23.4/full/"
                });

                // Initialize Monaco
                // TODO(Future): AMD сборка Monaco Editor (require.config, loader.min.js) устарела и будет удалена.
                // При обновлении версии Monaco Editor необходимо перейти на использование стандартных ES-модулей (ESM).
                // Пример загрузки: import * as monaco from 'https://cdn.jsdelivr.net/npm/monaco-editor@+esm';
                require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.38.0/min/vs' }});
                require(['vs/editor/editor.main'], function() {

                    sandboxInstances.forEach((sandboxEl, index) => {
                        const sandboxLoader = sandboxEl.querySelector('.sandbox-loader');
                        const sandboxContainer = sandboxEl.querySelector('.sandbox-container');
                        const monacoEditorDiv = sandboxEl.querySelector('.monaco-editor-div');
                        const runCodeBtn = sandboxEl.querySelector('.run-btn');
                        const sandboxOutput = sandboxEl.querySelector('.sandbox-output');
                        const copySandboxBtn = sandboxEl.querySelector('.copy-sandbox-btn');

                        // Use data-code attribute if available, else fallback
                        let defaultCode = monacoEditorDiv.getAttribute('data-code');
                        if (!defaultCode) {
                            defaultCode = "print('Hello World')";
                        } else {
                            // Unescape basic html entities just in case
                            defaultCode = defaultCode.replace(/\\n/g, '\n');
                        }

                        const monacoEditorInstance = monaco.editor.create(monacoEditorDiv, {
                            value: defaultCode,
                            language: 'python',
                            theme: 'vs-dark',
                            automaticLayout: true,
                            minimap: { enabled: false },
                            fontSize: 14,
                            fontFamily: "'JetBrains Mono', monospace",
                            scrollBeyondLastLine: false,
                            padding: { top: 16, bottom: 16 }
                        });

                        // Show editor, hide loader
                        sandboxLoader.style.display = 'none';
                        sandboxContainer.style.display = 'block';

                        // Auto-resize editor height based on content
                        const updateEditorHeight = () => {
                            const contentHeight = monacoEditorInstance.getContentHeight();
                            monacoEditorDiv.style.height = `${contentHeight + 2}px`; // +2px for top/bottom borders
                            monacoEditorInstance.layout();
                        };

                        monacoEditorInstance.onDidContentSizeChange(updateEditorHeight);
                        updateEditorHeight();

                        if (copySandboxBtn) {
                            copySandboxBtn.addEventListener('click', () => {
                                const code = monacoEditorInstance.getValue();
                                navigator.clipboard.writeText(code).then(() => {
                                    const originalHTML = copySandboxBtn.innerHTML;
                                    copySandboxBtn.innerHTML = '<svg width="16" height="16"><use href="#icon-check"></use></svg>';
                                    setTimeout(() => {
                                        copySandboxBtn.innerHTML = originalHTML;
                                    }, 3000);
                                }).catch(err => {
                                    console.error('Ошибка при копировании:', err);
                                });
                            });
                        }

                        runCodeBtn.addEventListener('click', () => {
                            const code = monacoEditorInstance.getValue();
                            executePythonCode(code, sandboxOutput, runCodeBtn);
                        });
                    });
                    
                    // Initialize Runnable Code Blocks
                    runnableCodeBlocks.forEach((blockEl) => {
                        const codeElem = blockEl.querySelector('code');
                        const runCodeBtn = blockEl.querySelector('.run-btn');
                        const sandboxOutputWrapper = blockEl.querySelector('.sandbox-output-wrapper');
                        const sandboxOutput = blockEl.querySelector('.sandbox-output');
                        
                        // Only add event listener if we have a run button
                        if (runCodeBtn && codeElem) {
                            runCodeBtn.addEventListener('click', () => {
                                sandboxOutputWrapper.style.display = 'block';
                                const code = codeElem.innerText;
                                executePythonCode(code, sandboxOutput, runCodeBtn);
                            });
                        }
                    });
                });
            } catch (err) {
                sandboxInstances.forEach(sandboxEl => {
                    const loader = sandboxEl.querySelector('.sandbox-loader');
                    if (loader) loader.innerHTML = '<p style="color:var(--color-wrong); font-weight: bold;">Ошибка загрузки среды: ' + err.message + '</p>';
                });
                console.error("Pyodide Load Error", err);
            }
        }

        initSandboxes();
    } else if (sandboxInstances.length > 0 || runnableCodeBlocks.length > 0) {
        sandboxInstances.forEach(sandboxEl => {
            const loader = sandboxEl.querySelector('.sandbox-loader');
            if(loader) loader.innerHTML = '<p style="color:var(--color-wrong); font-weight: bold;">Скрипты песочницы не загружены (проверьте интернет-соединение).</p>';
        });
        console.warn("Pyodide could not be loaded or is not defined.");
    }
});
