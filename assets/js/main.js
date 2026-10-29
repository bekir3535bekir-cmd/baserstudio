// ==========================================================
// Başer Studio · Isparta
// WhatsApp numarası: ülke koduyla, boşluksuz
// ==========================================================
const WHATSAPP_NUMBER = "905528861012";

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const waLink = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

// Skip the intro animation after the first page of the visit
try { sessionStorage.setItem("bs-loaded", "1"); } catch (e) {}

// ---------- WhatsApp links ----------
$$("[data-wa]").forEach((a) => {
  a.href = waLink(a.dataset.wa || "Merhaba Başer Studio, bilgi almak istiyorum.");
  a.target = "_blank";
  a.rel = "noopener";
});

$$(".year").forEach((el) => (el.textContent = new Date().getFullYear()));
$$(".to-top").forEach((b) => b.addEventListener("click", () => scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })));

// ---------- Header: solid after scroll, hides while scrolling down ----------
const header = $(".header");
let lastY = scrollY;
const onHeaderScroll = () => {
  const y = scrollY;
  header.classList.toggle("is-scrolled", y > 60);
  header.classList.toggle("is-hidden", y > 400 && y > lastY && !document.body.classList.contains("menu-open"));
  lastY = y;
};
addEventListener("scroll", onHeaderScroll, { passive: true });
onHeaderScroll();

// ---------- Fullscreen menu ----------
const menuBtn = $(".menu-btn");
const setMenu = (open) => {
  document.body.classList.toggle("menu-open", open);
  document.body.classList.toggle("is-locked", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.querySelector(".label").textContent = open ? "Kapat" : "Menü";
};
menuBtn.addEventListener("click", () => setMenu(!document.body.classList.contains("menu-open")));
addEventListener("keydown", (e) => e.key === "Escape" && document.body.classList.contains("menu-open") && setMenu(false));

// Mark the current page in the menu
const here = location.pathname.split("/").pop() || "index.html";
$$(".menu-nav a").forEach((a) => {
  if (a.getAttribute("href") === here) a.setAttribute("aria-current", "page");
});

// Menu image preview follows hovered link
const previews = $$(".menu-preview img");
$$(".menu-nav a").forEach((a, i) =>
  a.addEventListener("mouseenter", () => previews.forEach((img, j) => img.classList.toggle("is-active", i === j)))
);

// ---------- Page transition curtain ----------
const curtain = $(".curtain");
// Safety net: never leave the intro layers on screen if animations are delayed
setTimeout(() => curtain.classList.add("is-done"), 1200);
setTimeout(() => $(".preloader")?.classList.add("is-done"), 4000);
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href]");
  if (!a || reduceMotion || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
  const url = new URL(a.href, location.href);
  if (url.origin !== location.origin || url.pathname === location.pathname || !url.pathname.endsWith(".html") && !url.pathname.endsWith("/")) return;
  e.preventDefault();
  curtain.classList.remove("is-done");
  curtain.classList.add("is-leaving");
  setTimeout(() => (location.href = a.href), 550);
});
addEventListener("pageshow", (e) => e.persisted && curtain.classList.remove("is-leaving"));

// ---------- Custom cursor ----------
if (finePointer && !reduceMotion) {
  const cursor = document.createElement("div");
  cursor.className = "cursor";
  cursor.innerHTML = "<span>Gör</span>";
  document.body.appendChild(cursor);
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  const loop = () => {
    cx += (x - cx) * 0.22;
    cy += (y - cy) * 0.22;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(loop);
  };
  loop();
  document.addEventListener("mouseover", (e) => {
    const link = e.target.closest("a, button, summary, label");
    const viewEl = e.target.closest("[data-cursor]");
    // A link inside a "view" area (e.g. hero buttons) gets the link cursor
    const view = viewEl && !(link && viewEl.contains(link) && link !== viewEl) ? viewEl : null;
    cursor.classList.toggle("is-view", !!view);
    cursor.querySelector("span").textContent = view ? view.dataset.cursor : "";
    cursor.classList.toggle("is-link", !view && !!link);
  });
}

// ---------- Magnetic buttons ----------
if (finePointer && !reduceMotion) {
  $$(".magnetic").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
    });
    el.addEventListener("mouseleave", () => (el.style.transform = ""));
  });
}

// ---------- Split headings into words ----------
const splitWords = (node) => {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === 3) {
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(" "));
        const w = document.createElement("span");
        w.className = "w";
        w.innerHTML = `<span>${part}</span>`;
        frag.appendChild(w);
      });
      child.replaceWith(frag);
    } else if (child.nodeType === 1 && child.tagName !== "BR") {
      splitWords(child);
    }
  });
};
$$(".split").forEach((el) => {
  splitWords(el);
  $$(".w > span", el).forEach((s, i) => (s.style.transitionDelay = `${Math.min(i * 0.06, 0.9)}s`));
});

// ---------- Reveal on scroll ----------
const revealTargets = $$(".reveal, .reveal-img, .split, .t-item");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in");
      io.unobserve(en.target);
    }),
    { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
  );
  $$(".reveal, .split, .t-item").forEach((el) => io.observe(el));

  // .reveal-img starts fully clipped, and Chrome counts the target's own
  // clip-path, so it would never intersect. Watch the parent instead.
  const imgParents = new Map();
  $$(".reveal-img").forEach((el) => {
    const p = el.parentElement;
    if (!imgParents.has(p)) imgParents.set(p, []);
    imgParents.get(p).push(el);
  });
  const ioImg = new IntersectionObserver(
    (entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      imgParents.get(en.target).forEach((el) => el.classList.add("is-in"));
      ioImg.unobserve(en.target);
    }),
    { threshold: 0, rootMargin: "0px 0px -10% 0px" }
  );
  imgParents.forEach((_, p) => ioImg.observe(p));
} else {
  revealTargets.forEach((el) => el.classList.add("is-in"));
}

// ---------- Scroll-driven effects ----------
const scrollFns = [];
const onScroll = () => scrollFns.forEach((fn) => fn());
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);

// Statement words fill in as you read
$$(".statement").forEach((st) => {
  splitStatement(st);
  const words = $$(".fw", st);
  scrollFns.push(() => {
    const r = st.getBoundingClientRect();
    const p = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35);
    const n = Math.round(Math.max(0, Math.min(1, p)) * words.length);
    words.forEach((w, i) => w.classList.toggle("on", i < n));
  });
});
function splitStatement(el) {
  const walk = (node, accent) => {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const frag = document.createDocumentFragment();
        child.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) return frag.appendChild(document.createTextNode(" "));
          const s = document.createElement("span");
          s.className = "fw" + (accent ? " accent" : "");
          s.textContent = part;
          frag.appendChild(s);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === 1) {
        walk(child, accent || child.tagName === "EM");
      }
    });
  };
  walk(el, false);
}

// ---------- Camera viewfinder hero ----------
const cam = $(".hero-cam");
if (cam) {
  const video = $(".hero-video", cam);
  const flash = $(".flash", cam);
  const focus = $(".vf-focus", cam);
  const tc = $(".tc", cam);
  const sceneBtns = $$(".scenes button", cam);
  // Each clip plays to its end, but no scene runs longer than this
  const SCENE_SECONDS = 12;
  let scene = -1;
  // Phones get light portrait cuts of each clip (name-m.mp4) and a matching poster
  const small = matchMedia("(max-width: 700px)").matches;
  const clipSrc = (src) => (small ? src.replace(/\.mp4/, "-m.mp4") : src);
  if (small && video.dataset.posterM) video.poster = video.dataset.posterM;

  const shutter = () => {
    flash.classList.remove("go");
    void flash.offsetWidth;
    flash.classList.add("go");
  };
  const lockFocus = () => {
    focus.classList.remove("lock");
    void focus.offsetWidth;
    focus.classList.add("lock");
  };

  const play = (n) => {
    scene = (n + sceneBtns.length) % sceneBtns.length;
    sceneBtns.forEach((b, i) => {
      b.classList.toggle("is-active", i === scene);
      b.classList.toggle("is-done", i < scene);
      $("b", b).style.transform = i < scene ? "scaleX(1)" : "scaleX(0)";
    });
    cam.classList.add("is-focusing");
    shutter();
    lockFocus();
    video.src = clipSrc(sceneBtns[scene].dataset.src);
    video.play().catch(() => {});
  };

  video.addEventListener("playing", () => {
    cam.classList.add("is-playing");
    setTimeout(() => cam.classList.remove("is-focusing"), 250);
  });
  video.addEventListener("timeupdate", () => {
    const len = Math.min(video.duration || SCENE_SECONDS, SCENE_SECONDS);
    $("b", sceneBtns[scene]).style.transform = `scaleX(${Math.min(1, video.currentTime / len)})`;
    if (video.currentTime >= len) play(scene + 1);
  });
  video.addEventListener("ended", () => play(scene + 1));
  // If a clip can't load, keep the poster and move on quietly
  video.addEventListener("error", () => cam.classList.remove("is-focusing"));

  sceneBtns.forEach((b, i) => b.addEventListener("click", (e) => { e.stopPropagation(); play(i); }));

  // Running timecode (HH:MM:SS:FF at 25 fps)
  const start = Date.now();
  const pad = (n) => String(n).padStart(2, "0");
  setInterval(() => {
    const ms = Date.now() - start;
    const s = Math.floor(ms / 1000);
    tc.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}:${pad(Math.floor((ms % 1000) / 40))}`;
  }, 40);

  // Focus box follows the mouse; a click takes a "shot"
  const vf = $(".vf", cam);
  let fx = 0, fy = 0, tx = 0, ty = 0;
  const placeFocus = () => {
    const r = vf.getBoundingClientRect();
    tx = r.width * 0.62; ty = r.height * 0.42;
    fx = tx; fy = ty;
    focus.style.transform = `translate(${fx}px, ${fy}px)`;
  };
  placeFocus();
  addEventListener("resize", placeFocus);
  if (finePointer && !reduceMotion) {
    cam.addEventListener("mousemove", (e) => {
      const r = vf.getBoundingClientRect();
      tx = Math.max(60, Math.min(r.width - 60, e.clientX - r.left));
      ty = Math.max(42, Math.min(r.height - 42, e.clientY - r.top));
    });
    const follow = () => {
      fx += (tx - fx) * 0.12;
      fy += (ty - fy) * 0.12;
      focus.style.transform = `translate(${fx}px, ${fy}px)`;
      requestAnimationFrame(follow);
    };
    follow();
    cam.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      shutter();
      lockFocus();
    });
  }

  // Only play while the hero is on screen (reduced motion: poster until a scene is picked)
  if (reduceMotion) {
    // nothing autoplays
  } else {
    if (cam.getBoundingClientRect().top < innerHeight) play(0);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => {
        if (en.isIntersecting) scene < 0 ? play(0) : video.play().catch(() => {});
        else video.pause();
      }, { threshold: 0.2 }).observe(cam);
    }
  }
}

// Inner page hero background parallax
const heroBg = $(".page-hero-bg img");
if (heroBg && !reduceMotion) scrollFns.push(() => scrollY < innerHeight * 1.2 && (heroBg.style.transform = `translateY(${scrollY * 0.25}px)`));

// Pinned horizontal stories (desktop); swipe natively elsewhere
$$(".hscroll").forEach((sec) => {
  const track = $(".hscroll-track", sec);
  const bar = $(".progress i", sec);
  const pinned = matchMedia("(min-width: 901px)").matches && !reduceMotion;
  if (!pinned) return sec.classList.add("native");
  const size = () => (sec.style.height = `${track.scrollWidth - innerWidth + innerHeight}px`);
  size();
  addEventListener("resize", size);
  scrollFns.push(() => {
    const r = sec.getBoundingClientRect();
    const max = sec.offsetHeight - innerHeight;
    const p = Math.max(0, Math.min(1, -r.top / max));
    track.style.transform = `translateX(${-p * (track.scrollWidth - innerWidth)}px)`;
    if (bar) bar.style.transform = `scaleX(${p})`;
  });
});

// Day timeline line grows with scroll
$$(".timeline").forEach((tl) => {
  const fill = $(".timeline-fill", tl);
  scrollFns.push(() => {
    const r = tl.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, (innerHeight * 0.6 - r.top) / r.height));
    fill.style.height = `${p * 100}%`;
  });
});
onScroll();

// ---------- Hover list: floating image follows the cursor ----------
$$(".hover-list").forEach((list) => {
  const float = $(".hl-float");
  if (!float || !finePointer) return;
  const imgs = $$("img", float);
  let x = 0, y = 0, fx = 0, fy = 0, running = false;
  const loop = () => {
    fx += (x - fx) * 0.14;
    fy += (y - fy) * 0.14;
    float.style.left = `${fx - 140}px`;
    float.style.top = `${fy - 190}px`;
    if (running) requestAnimationFrame(loop);
  };
  $$(".hl-row", list).forEach((row, i) => {
    row.addEventListener("mouseenter", (e) => {
      imgs.forEach((img, j) => img.classList.toggle("is-active", i === j));
      if (!running) { fx = x = e.clientX; fy = y = e.clientY; running = true; loop(); }
      float.classList.add("is-on");
    });
  });
  list.addEventListener("mousemove", (e) => { x = e.clientX; y = e.clientY; });
  list.addEventListener("mouseleave", () => { float.classList.remove("is-on"); running = false; });
});

// ---------- Organization event tabs ----------
$$(".events").forEach((wrap) => {
  const tabs = $$(".event-tab", wrap);
  const panels = $$(".event-panel", wrap);
  tabs.forEach((tab, i) =>
    tab.addEventListener("click", () => {
      tabs.forEach((t, j) => { t.classList.toggle("is-active", i === j); t.setAttribute("aria-selected", String(i === j)); });
      panels.forEach((p, j) => p.classList.toggle("is-active", i === j));
      if (innerWidth <= 900) wrap.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
    })
  );
});

// ---------- Portfolio: filters + lightbox ----------
const items = $$(".m-item[data-cat]");
if (items.length && $(".lightbox")) {
  const filters = $$(".filter");
  filters.forEach((f) => {
    const cat = f.dataset.filter;
    const sup = document.createElement("sup");
    sup.textContent = cat === "all" ? items.length : items.filter((i) => i.dataset.cat === cat).length;
    f.appendChild(sup);
    f.addEventListener("click", () => {
      filters.forEach((b) => b.classList.toggle("is-active", b === f));
      items.forEach((it) => it.classList.toggle("is-hidden", cat !== "all" && it.dataset.cat !== cat));
    });
  });

  const lb = $(".lightbox");
  const lbImg = $(".lb-stage img", lb);
  const lbCap = $(".lb-caption", lb);
  const lbCount = $(".lb-count", lb);
  let idx = 0;
  const visible = () => items.filter((i) => !i.classList.contains("is-hidden"));
  const show = (n) => {
    const list = visible();
    idx = (n + list.length) % list.length;
    const img = $("img", list[idx]);
    // Our own photos have a -1600 version; stock ones scale via the w= param
    lbImg.src = img.src.replace(/-800\.jpg$/, "-1600.jpg").replace(/w=\d+/, "w=1800");
    lbImg.alt = img.alt;
    lbCap.textContent = img.alt;
    lbCount.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
  };
  const open = (item) => { show(visible().indexOf(item)); lb.hidden = false; document.body.classList.add("is-locked"); $(".lb-close", lb).focus(); };
  const close = () => { lb.hidden = true; document.body.classList.remove("is-locked"); };
  items.forEach((it) => {
    it.tabIndex = 0;
    it.addEventListener("click", () => open(it));
    it.addEventListener("keydown", (e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), open(it)));
  });
  $(".lb-close", lb).addEventListener("click", close);
  $(".lb-prev", lb).addEventListener("click", () => show(idx - 1));
  $(".lb-next", lb).addEventListener("click", () => show(idx + 1));
  lb.addEventListener("click", (e) => e.target.classList.contains("lb-stage") && close());
  addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(idx - 1);
    if (e.key === "ArrowRight") show(idx + 1);
  });
  let tx = null;
  lb.addEventListener("touchstart", (e) => (tx = e.touches[0].clientX), { passive: true });
  lb.addEventListener("touchend", (e) => {
    if (tx === null) return;
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
    tx = null;
  });
}

// ---------- Quote wizard -> WhatsApp ----------
const wizard = $(".wizard");
if (wizard) {
  const steps = $$(".w-step", wizard);
  const dots = $$(".wizard-steps i", wizard);
  const count = $(".wizard-count", wizard);
  const back = $(".w-back", wizard);
  const next = $(".w-next", wizard);
  const err = $(".w-error", wizard);
  const form = $("form", wizard);
  let step = 0;

  // Preselect event type from ?etkinlik=...
  const pre = new URLSearchParams(location.search).get("etkinlik");
  if (pre) {
    const radio = $$('input[name="event"]', wizard).find((r) => r.value === pre);
    if (radio) radio.checked = true;
  }

  const dateInput = form.elements.date;
  dateInput.min = new Date().toISOString().slice(0, 10);
  const countdown = $(".countdown", wizard);
  dateInput.addEventListener("change", () => {
    if (!dateInput.value) return countdown.classList.remove("is-on");
    const days = Math.ceil((new Date(dateInput.value) - new Date().setHours(0, 0, 0, 0)) / 86400000);
    $("b", countdown).textContent = days;
    $("span", countdown).textContent = days > 0 ? "gün kaldı. Hazırlıklara başlamak için harika bir zaman!" : "Bugün! Hemen arayın.";
    countdown.classList.add("is-on");
  });

  const val = () => Object.fromEntries(new FormData(form));
  const services = () => $$('input[name="services"]:checked', wizard).map((c) => c.value);
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : "Henüz belli değil");

  const validate = () => {
    const d = val();
    if (step === 0 && !d.event) return "Lütfen bir etkinlik türü seçin.";
    if (step === 2 && !services().length) return "En az bir hizmet seçin.";
    if (step === 3) {
      let msg = "";
      ["name", "phone"].forEach((k) => {
        const field = form.elements[k].closest(".w-field");
        const empty = !String(d[k] || "").trim();
        field.classList.toggle("has-error", empty);
        if (empty) msg = "Adınızı ve telefonunuzu yazın.";
      });
      return msg;
    }
    return "";
  };

  const render = () => {
    steps.forEach((s, i) => s.classList.toggle("is-active", i === step));
    dots.forEach((d, i) => d.classList.toggle("on", i <= step));
    count.textContent = `${step + 1} / ${steps.length}`;
    back.hidden = step === 0;
    next.querySelector(".label").textContent = step === steps.length - 1 ? "WhatsApp ile Gönder" : "Devam";
    err.textContent = "";
    if (step === steps.length - 1) {
      const d = val();
      const rows = [
        ["Etkinlik", d.event],
        ["Tarih", fmtDate(d.date)],
        ["Şehir / Mekân", d.venue || "Belirtilmedi"],
        ["Hizmetler", services().join(", ")],
        ["Ad Soyad", d.name],
        ["Telefon", d.phone],
      ];
      const list = $(".w-summary", wizard);
      list.replaceChildren(...rows.map(([k, v]) => {
        const li = document.createElement("li");
        li.append(Object.assign(document.createElement("span"), { textContent: k }), Object.assign(document.createElement("strong"), { textContent: v }));
        return li;
      }));
    }
  };

  next.addEventListener("click", () => {
    const problem = validate();
    if (problem) return (err.textContent = problem);
    if (step < steps.length - 1) { step++; return render(); }
    const d = val();
    const text = [
      "Merhaba Başer Studio, teklif almak istiyorum.",
      "",
      `Etkinlik: ${d.event}`,
      `Tarih: ${fmtDate(d.date)}`,
      `Şehir / Mekân: ${d.venue || "Belirtilmedi"}`,
      `Hizmetler: ${services().join(", ")}`,
      `Ad Soyad: ${d.name}`,
      `Telefon: ${d.phone}`,
    ];
    if (d.note.trim()) text.push("", `Not: ${d.note.trim()}`);
    window.open(waLink(text.join("\n")), "_blank", "noopener");
    err.textContent = "";
    $(".w-done", wizard).hidden = false;
  });
  back.addEventListener("click", () => { if (step > 0) { step--; render(); } });
  form.addEventListener("submit", (e) => e.preventDefault());
  render();
}
