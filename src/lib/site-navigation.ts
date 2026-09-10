const navigation = document.querySelector<HTMLElement>("[data-site-navigation]");
const menu = document.querySelector<HTMLDialogElement>("#site-menu");
if (navigation && menu) {
  const toggle = navigation.querySelector<HTMLButtonElement>(".site-menu-toggle")!;
  const links = navigation.querySelector<HTMLElement>(".site-nav-links")!;
  const identity = navigation.querySelector<HTMLElement>(".site-identity")!;
  const closeButton = menu.querySelector<HTMLButtonElement>(".site-menu-close")!;
  const panel = menu.querySelector<HTMLElement>(".site-menu-panel")!;
  const home = navigation.classList.contains("is-home");
  const mobile = matchMedia("(max-width: 600px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const footer = document.querySelector<HTMLElement>(".home-footer, .about-contact, .site-footer");
  let previousOverflow = "";
  let previousGutter = "";
  let scheduled = false;
  let closing = false;
  let openingFrame = 0;
  let destination: HTMLElement | null = null;
  const render = () => {
    scheduled = false;
    const condensed = scrollY > 180;
    navigation.classList.toggle("is-condensed", condensed);
    navigation.classList.toggle("is-dark", !!footer && footer.getBoundingClientRect().top < 65);
    links.inert = condensed || mobile.matches;
    toggle.inert = !condensed && !mobile.matches;
    identity.inert = condensed && !home;
  };
  const schedule = () => { if (!scheduled) { scheduled = true; requestAnimationFrame(render); } };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", schedule);
  addEventListener("pageshow", schedule);
  render();

  toggle.addEventListener("click", () => {
    if (menu.open) return;
    previousOverflow = document.body.style.overflow;
    previousGutter = document.documentElement.style.scrollbarGutter;
    // Retain the scrollbar's space while the modal locks background scrolling.
    document.documentElement.style.scrollbarGutter = "stable";
    document.body.style.overflow = "hidden";
    // Autofocus must target a stationary onscreen control, not the translated panel.
    closeButton.autofocus = true;
    menu.showModal();
    toggle.setAttribute("aria-expanded", "true");
    closeButton.focus({ preventScroll: true });
    // Resolve the closed geometry before transitioning to the visible state.
    panel.getBoundingClientRect();
    openingFrame = requestAnimationFrame(() => menu.classList.add("is-visible"));
  });

  const closeMenu = async (afterClose?: () => void) => {
    if (!menu.open || closing) return;
    closing = true;
    cancelAnimationFrame(openingFrame);
    menu.classList.remove("is-visible");
    panel.getBoundingClientRect();
    // Keep the modal (and its focus trap) mounted until ALL exit layers finish.
    // CSS transitions reverse naturally if closed during the entry animation.
    if (!reduced.matches && !document.documentElement.hasAttribute("data-reduced")) {
      await Promise.allSettled(menu.getAnimations({ subtree: true }).map(animation => animation.finished));
    }
    menu.close();
    closing = false;
    afterClose?.();
  };
  closeButton.addEventListener("click", () => { void closeMenu(); });
  menu.addEventListener("cancel", event => {
    event.preventDefault();
    void closeMenu();
  });
  menu.addEventListener("click", event => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest<HTMLAnchorElement>("a");
    if (link) {
      const href = link.getAttribute("href") ?? "";
      const normalNavigation = !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && link.target !== "_blank";
      if (normalNavigation) {
        event.preventDefault();
        destination = href.startsWith("#") ? document.getElementById(href.slice(1)) : null;
        void closeMenu(() => location.assign(href));
      }
    } else if (target?.hasAttribute("data-menu-dismiss")) {
      void closeMenu();
    }
  });
  menu.addEventListener("close", () => {
    cancelAnimationFrame(openingFrame);
    menu.classList.remove("is-visible");
    document.body.style.overflow = previousOverflow;
    document.documentElement.style.scrollbarGutter = previousGutter;
    toggle.setAttribute("aria-expanded", "false");
    if (destination) {
      destination.setAttribute("tabindex", "-1");
      destination.focus({ preventScroll: true });
      destination = null;
    } else toggle.focus({ preventScroll: true });
  });
}
