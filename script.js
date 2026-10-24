(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

  /* ---------- Navegação ---------- */
  const nav = $("#nav");
  const toggle = $("#navToggle");
  const links = $("#navLinks");
  const toTop = $("#toTop");

  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open);
  });
  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });
  window.addEventListener("scroll", () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 10);
    toTop.classList.toggle("is-visible", window.scrollY > 600);
  }, { passive: true });
  toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  // Destaca o link da seção atual
  const navAnchors = $$(".nav__links a");
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        navAnchors.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === "#" + en.target.id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navAnchors.forEach((a) => {
    const target = $(a.getAttribute("href"));
    if (target) sectionObs.observe(target);
  });

  /* ---------- Terminal do hero (digitação) ---------- */
  const heroScript = [
    ["p", "$ ", "c", "git init"],
    ["d", "Initialized empty Git repository in meu-projeto/.git/"],
    ["p", "$ ", "c", "git add ."],
    ["p", "$ ", "c", 'git commit -m "Primeiro commit"'],
    ["d", "[main (root-commit) 3c90aa4] Primeiro commit"],
    ["d", " 3 files changed, 42 insertions(+)"],
    ["p", "$ ", "c", "git push origin main"],
    ["b", "✔ Enviado para o GitHub"],
  ];

  async function typeInto(el, script) {
    el.innerHTML = "";
    if (reduceMotion) {
      el.innerHTML = script.map(renderLine).join("\n");
      return;
    }
    let html = "";
    for (const line of script) {
      if (line[0] === "p") {
        html += `<span class="p">${esc(line[1])}</span><span class="c">`;
        el.innerHTML = html;
        for (const ch of line[3]) {
          html += esc(ch);
          el.innerHTML = html + "</span>";
          await wait(35 + Math.random() * 40);
        }
        html += "</span>\n";
      } else {
        await wait(280);
        html += `<span class="${line[0]}">${esc(line[1])}</span>\n`;
      }
      el.innerHTML = html;
      await wait(220);
    }
  }
  const renderLine = (l) =>
    l[0] === "p" ? `<span class="p">${esc(l[1])}</span><span class="c">${esc(l[3])}</span>` : `<span class="${l[0]}">${esc(l[1])}</span>`;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  const heroTerm = $("#heroTerminal");
  (async function loopHero() {
    while (true) {
      await typeInto(heroTerm, heroScript);
      if (reduceMotion) return;
      await wait(4500);
    }
  })();

  /* ---------- Cards flip (acessível) ---------- */
  $$(".flip").forEach((card) => {
    card.addEventListener("click", () => {
      card.setAttribute("aria-pressed", card.getAttribute("aria-pressed") !== "true");
    });
  });

  /* ---------- Fluxo de trabalho ---------- */
  const steps = $$(".flow__step");
  const activate = (step) => {
    steps.forEach((s) => s.classList.toggle("is-active", s === step));
  };
  steps.forEach((s) => {
    s.addEventListener("mouseenter", () => activate(s));
    s.addEventListener("focus", () => activate(s));
    s.addEventListener("click", () => activate(s));
  });

  /* ---------- Simulador de comandos ---------- */
  const commands = [
    {
      cmd: "git init", scope: "Local",
      desc: "Inicializa um novo repositório Git vazio dentro da pasta atual, criando a estrutura oculta (.git) necessária para o rastreamento.",
      out: [["c", "$ git init"], ["d", "Initialized empty Git repository in /meu-projeto/.git/"]],
    },
    {
      cmd: "git status", scope: "Local",
      desc: "Verifica o estado atual dos arquivos: o que foi modificado, o que está na staging area e o que ainda não é rastreado.",
      out: [["c", "$ git status"], ["d", "On branch main"], ["d", "Untracked files:"], ["a", "        index.html"], ["a", "        style.css"], ["d", 'nothing added to commit but untracked files present (use "git add")']],
    },
    {
      cmd: "git add .", scope: "Local",
      desc: "Adiciona todos os arquivos modificados ou novos do diretório de trabalho à Staging Area, preparando-os para o commit.",
      out: [["c", "$ git add ."], ["d", "(sem saída: os arquivos agora estão na staging area)"], ["c", "$ git status --short"], ["p", "A  index.html"], ["p", "A  style.css"]],
    },
    {
      cmd: 'git commit -m "msg"', scope: "Local",
      desc: "Salva permanentemente um “instantâneo” (snapshot) dos arquivos preparados no histórico local. Exige uma mensagem descritiva.",
      out: [["c", '$ git commit -m "Primeiro commit"'], ["d", "[main (root-commit) 3c90aa4] Primeiro commit"], ["d", " 2 files changed, 38 insertions(+)"]],
    },
    {
      cmd: "git log", scope: "Local",
      desc: "Exibe o histórico cronológico de commits do repositório, do mais recente ao mais antigo.",
      out: [["c", "$ git log --oneline"], ["a", "a1f3c9e Adiciona tela de login"], ["a", "7be21d0 Corrige cálculo da média"], ["a", "3c90aa4 Primeiro commit"]],
    },
    {
      cmd: "git remote add origin <url>", scope: "Remoto",
      desc: "Conecta o seu repositório local a um servidor remoto específico (como o GitHub).",
      out: [["c", "$ git remote add origin https://github.com/usuario/meu-projeto.git"], ["c", "$ git remote -v"], ["b", "origin  https://github.com/usuario/meu-projeto.git (push)"]],
    },
    {
      cmd: "git push", scope: "Remoto",
      desc: "Envia (empurra) seus commits locais para o servidor remoto, atualizando o projeto online.",
      out: [["c", "$ git push -u origin main"], ["d", "Enumerating objects: 4, done."], ["d", "Writing objects: 100% (4/4), 812 bytes"], ["b", "To github.com:usuario/meu-projeto.git"], ["b", " * [new branch]      main -> main"]],
    },
    {
      cmd: "git pull", scope: "Remoto",
      desc: "Busca e baixa as atualizações mais recentes do servidor remoto diretamente para a sua máquina.",
      out: [["c", "$ git pull"], ["d", "remote: Enumerating objects: 5, done."], ["b", "Updating 3c90aa4..7be21d0"], ["p", " README.md | 2 ++"]],
    },
    {
      cmd: "git clone <url>", scope: "Remoto",
      desc: "Baixa uma cópia completa de um projeto já existente na nuvem para iniciar o desenvolvimento local.",
      out: [["c", "$ git clone https://github.com/usuario/meu-projeto.git"], ["d", "Cloning into 'meu-projeto'..."], ["b", "Receiving objects: 100% (12/12), done."]],
    },
    {
      cmd: "git branch [nome]", scope: "Local",
      desc: "Cria uma nova ramificação para trabalhar de forma isolada, sem mexer na linha principal do projeto.",
      out: [["c", "$ git branch minha-feature"], ["c", "$ git branch"], ["p", "* main"], ["d", "  minha-feature"]],
    },
    {
      cmd: "git merge [branch]", scope: "Local",
      desc: "Junta as alterações de uma branch na branch em que você está.",
      out: [["c", "$ git merge minha-feature"], ["d", "Updating 3c90aa4..9d41b2f"], ["b", "Fast-forward"], ["p", " app.js | 14 ++++++++++"]],
    },
  ];

  const list = $("#cmdList");
  const sim = $("#simTerminal");
  const runBtn = $("#runCmd");
  let current = 0;
  let running = false;

  commands.forEach((c, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.textContent = c.cmd;
    b.addEventListener("click", () => select(i));
    list.appendChild(b);
  });

  function select(i) {
    current = i;
    const c = commands[i];
    $$("button", list).forEach((b, j) => b.setAttribute("aria-selected", j === i));
    $("#cmdTitle").textContent = c.cmd;
    $("#cmdDesc").textContent = c.desc;
    const sc = $("#cmdScope");
    sc.textContent = c.scope;
    sc.classList.toggle("scope--remote", c.scope === "Remoto");
    sim.innerHTML = '<span class="d">Clique em “Executar” para ver a saída…</span>';
  }

  async function run() {
    if (running) return;
    running = true;
    runBtn.disabled = true;
    sim.innerHTML = "";
    for (const [cls, text] of commands[current].out) {
      sim.innerHTML += `<span class="${cls}">${esc(text)}</span>\n`;
      if (!reduceMotion) await wait(320);
    }
    running = false;
    runBtn.disabled = false;
  }
  runBtn.addEventListener("click", run);
  select(0);

  /* ---------- Contador animado ---------- */
  const counter = $(".count");
  const countObs = new IntersectionObserver(([en]) => {
    if (!en.isIntersecting) return;
    countObs.disconnect();
    const target = +counter.dataset.target;
    const suffix = counter.dataset.suffix || "";
    if (reduceMotion) { counter.textContent = target + suffix; return; }
    const start = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      counter.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + (p === 1 ? suffix : "");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, { threshold: 0.6 });
  countObs.observe(counter);

  /* ---------- Checklist ---------- */
  const checks = $$(".checklist input");
  const msg = $("#checkMsg");
  const saved = (() => { try { return JSON.parse(localStorage.getItem("lpgit-checks")) || []; } catch { return []; } })();
  checks.forEach((c, i) => {
    c.checked = !!saved[i];
    c.addEventListener("change", update);
  });
  function update() {
    try { localStorage.setItem("lpgit-checks", JSON.stringify(checks.map((c) => c.checked))); } catch {}
    msg.textContent = checks.every((c) => c.checked) ? "Tudo pronto! Te vemos no minicurso 🚀" : "";
  }
  update();

  /* ---------- Reveal ao rolar ---------- */
  const revealEls = $$(".section .container > *, .cta .container > *");
  revealEls.forEach((el) => el.classList.add("reveal"));
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("is-in");
        revealObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => revealObs.observe(el));
})();
