import pairs from "../data/translations.json";

export type Language = "en" | "zh-CN";
const english = new Map(pairs.map(([en, zh]) => [zh, en]));
const chinese = new Map(pairs.map(([en, zh]) => [en, zh]));
const storageKey = "ansyn-language";
const excluded = "script,style,code,pre,[data-preserve-language],.language-switch,.hero-words,.world-title,.static-name";
const attributes = ["aria-label", "alt", "title", "placeholder"];
let language: Language = "en";

export function translate(value: string, target: Language = language): string {
  const clean = value.trim().replace(/\s+/g, " ");
  const canonical = english.get(clean) ?? clean;
  let translated = target === "en" ? canonical : chinese.get(canonical) ?? canonical;
  if (translated === canonical) {
    const count = canonical.match(/^(\d+) entr(?:y|ies)$/) ?? canonical.match(/^(\d+) 篇记录$/);
    if (count) translated = `${count[1]}${target === "en" ? (count[1] === "1" ? " entry" : " entries") : " 篇记录"}`;
    const project = canonical.match(/^Toggle details for (.+)$/) ?? canonical.match(/^切换项目信息：(.+)$/);
    if (project) translated = target === "en" ? `Toggle details for ${translate(project[1], "en")}` : `切换项目信息：${translate(project[1], "zh-CN")}`;
    const place = canonical.match(/^Open (.+) notes$/) ?? canonical.match(/^打开(.+)记录$/);
    if (place) translated = target === "en" ? `Open ${translate(place[1], "en")} notes` : `打开${translate(place[1], "zh-CN")}记录`;
    const image = canonical.match(/^(.+) image (\d+)$/) ?? canonical.match(/^(.+) 预览图 (\d+)$/);
    if (image) translated = target === "en" ? `${translate(image[1], "en")} image ${image[2]}` : `${translate(image[1], "zh-CN")} 预览图 ${image[2]}`;
  }
  if (translated === clean) return value;
  return value.replace(/\S[\s\S]*\S|\S/, translated);
}

export function initLanguage() {
  try { language = localStorage.getItem(storageKey) === "zh-CN" ? "zh-CN" : "en"; } catch { /* English remains available without storage. */ }
  const localizeText = (node: Node) => {
    if (node.nodeType !== Node.TEXT_NODE || node.parentElement?.closest(excluded)) return;
    const text = node.nodeValue ?? "";
    if (!text.trim()) return;
    const translated = translate(text);
    if (translated !== text) node.nodeValue = translated;
  };
  const localizeElement = (element: Element) => {
    if (element.closest(excluded)) return;
    for (const attr of attributes) {
      const text = element.getAttribute(attr);
      if (text) { const translated = translate(text); if (translated !== text) element.setAttribute(attr, translated); }
    }
  };
  const localize = (root: Node) => {
    if (root.nodeType === Node.TEXT_NODE) { localizeText(root); return; }
    if (!(root instanceof Element) || root.closest(excluded)) return;
    localizeElement(root);
    root.querySelectorAll("[aria-label],[alt],[title],[placeholder]").forEach(localizeElement);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) localizeText(node);
  };
  const update = () => {
    document.documentElement.lang = language;
    document.querySelectorAll<HTMLElement>("[lang]").forEach(element => {
      if (!element.closest("[data-preserve-language],.hero-words,.world-title")) element.lang = language;
    });
    localize(document.body);
    document.title = translate(document.title);
    for (const selector of ['meta[name="description"]', 'meta[property="og:title"]', 'meta[property="og:description"]', 'meta[name="twitter:title"]', 'meta[name="twitter:description"]']) {
      const meta = document.querySelector<HTMLMetaElement>(selector);
      if (meta) meta.content = translate(meta.content);
    }
    const locale = document.querySelector<HTMLMetaElement>('meta[property="og:locale"]');
    if (locale) locale.content = language === "en" ? "en_US" : "zh_CN";
    document.querySelectorAll<HTMLButtonElement>("[data-language-toggle]").forEach(button => {
      button.hidden = false;
      button.textContent = language === "en" ? "中文" : "EN";
      button.lang = language === "en" ? "zh-CN" : "en";
      button.setAttribute("aria-label", language === "en" ? "Switch to Chinese" : "切换为英文");
    });
    dispatchEvent(new CustomEvent("site:languagechange", { detail: language }));
    // Recompute position-dependent effects after translated copy changes height.
    dispatchEvent(new Event("resize"));
  };
  document.querySelectorAll("[data-language-toggle]").forEach(button => button.addEventListener("click", () => {
    language = language === "en" ? "zh-CN" : "en";
    try { localStorage.setItem(storageKey, language); } catch { /* The current page still switches. */ }
    update();
  }));
  update();
  // Only translate changed text/labels. Animated style and class updates are not observed.
  const observer = new MutationObserver(records => {
    for (const record of records) {
      if (record.type === "characterData") localizeText(record.target);
      else if (record.type === "attributes") localizeElement(record.target as Element);
      else record.addedNodes.forEach(localize);
    }
  });
  observer.observe(document.body, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: attributes });
}
