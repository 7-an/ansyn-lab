/** Project-local animation: animate dimensions, never stretch the image or its type. */
export function initProjectRows() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 834px)");
  const motionOff = () => reduced.matches || document.documentElement.hasAttribute("data-reduced");

  document.querySelectorAll<HTMLElement>("[data-project-rows]").forEach((root) => {
    root.querySelectorAll<HTMLElement>(".prow").forEach((row) => {
      const toggle = row.querySelector<HTMLButtonElement>("[data-preview-toggle]")!;
      const rowControl = row.querySelector<HTMLButtonElement>("[data-row-control]")!;
      const preview = row.querySelector<HTMLElement>(".pcell-preview")!;
      const info = row.querySelector<HTMLElement>(".pcell-info")!;
      const cells = [preview, info, ...row.querySelectorAll<HTMLElement>(".pcell-ph")];
      const contents = [...info.querySelectorAll<HTMLElement>(".pstrip, .pinfo")];
      const images = [...row.querySelectorAll<HTMLImageElement>("[data-preview-image]")];
      const thumbs = [...row.querySelectorAll<HTMLButtonElement>("[data-thumb]")];
      let animations: Animation[] = [];
      let generation = 0;
      let scrambleFrame = 0;
      const title = preview.querySelector<HTMLElement>(".pstrip-main")!;
      const originalTitle = title.textContent ?? "";

      const restoreTitle = () => {
        cancelAnimationFrame(scrambleFrame);
        title.textContent = originalTitle;
      };
      const scramble = () => {
        restoreTitle();
        if (motionOff() || row.classList.contains("is-open")) return;
        const start = performance.now();
        const chars = "01/—+*:";
        const tick = (now: number) => {
          const progress = Math.min((now - start) / 320, 1);
          title.textContent = [...originalTitle].map((char, i) =>
            i / originalTitle.length < progress || char === " " ? char : chars[(i + Math.floor((now - start) / 45)) % chars.length]
          ).join("");
          if (progress < 1) scrambleFrame = requestAnimationFrame(tick);
          else restoreTitle();
        };
        scrambleFrame = requestAnimationFrame(tick);
      };
      preview.addEventListener("pointerenter", (event) => {
        if (event.pointerType === "touch") return;
        const rect = preview.getBoundingClientRect();
        preview.dataset.entry = event.clientY > rect.top + rect.height / 2 ? "bottom" : "top";
        scramble();
      });
      preview.addEventListener("pointerleave", restoreTitle);
      toggle.addEventListener("focus", scramble);
      toggle.addEventListener("blur", restoreTitle);

      const selectImage = (index: number) => {
        images.forEach((image, i) => image.classList.toggle("is-active", i === index));
        thumbs.forEach((thumb, i) => {
          thumb.classList.toggle("is-active", i === index);
          thumb.setAttribute("aria-pressed", String(i === index));
        });
      };
      thumbs.forEach((thumb, index) => thumb.addEventListener("click", () => selectImage(index)));

      const cancel = () => {
        animations.forEach((animation) => animation.cancel());
        animations = [];
        row.classList.remove("is-animating");
      };
      const setOpen = (open: boolean) => {
        const ticket = ++generation;
        // Capture the current painted dimensions BEFORE cancelling an interrupted animation.
        const before = cells.map((cell) => cell.getBoundingClientRect());
        const oldHeight = row.getBoundingClientRect().height;
        const oldOpacity = contents.map((el) => getComputedStyle(el).opacity);
        cancel();
        restoreTitle();
        row.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", String(open));
        rowControl.setAttribute("aria-expanded", String(open));
        info.inert = !open;
        if (motionOff()) return;
        const after = cells.map((cell) => cell.getBoundingClientRect());
        const newHeight = row.getBoundingClientRect().height;
        const duration = desktop.matches ? 850 : 600;
        const delay = open ? 0 : 200;
        const options: KeyframeAnimationOptions = {
          duration, delay, easing: "cubic-bezier(.87,0,.13,1)", fill: "both"
        };
        row.classList.add("is-animating");
        animations.push(
          preview.animate([
            { left: `${before[0].left - after[0].left}px`, width: `${before[0].width}px` },
            { left: "0px", width: `${after[0].width}px` }
          ], options),
          row.animate([{ height: `${oldHeight}px` }, { height: `${newHeight}px` }], options)
        );
        if (desktop.matches) {
          cells.slice(1).forEach((cell, i) => {
            const direction = Number(row.dataset.layout) < 2 ? 1 : -1;
            const isPlaceholder = i > 0;
            const target = isPlaceholder && open ? direction * root.clientWidth : 0;
            animations.push(cell.animate([
              { transform: `translateX(${before[i + 1].left - after[i + 1].left}px)` },
              { transform: `translateX(${target}px)` }
            ], options));
          });
        }
        contents.forEach((el, i) => animations.push(el.animate([
          { opacity: oldOpacity[i], visibility: "visible" },
          { opacity: open ? 1 : 0, visibility: "visible" }
        ], { duration: open ? 350 : 200, delay: open ? duration : 0, fill: "both", easing: "ease" })));
        Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
          if (ticket !== generation) return;
          cancel();
        });
      };
      toggle.addEventListener("click", () => setOpen(!row.classList.contains("is-open")));
      rowControl.addEventListener("click", () => setOpen(!row.classList.contains("is-open")));
      row.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && row.classList.contains("is-open")) {
          event.preventDefault();
          setOpen(false);
          toggle.focus({ preventScroll: true });
        }
      });
      // Resizing/reduced-motion changes must not retain pixel dimensions from an old viewport.
      const finish = () => { ++generation; cancel(); restoreTitle(); };
      window.addEventListener("resize", finish, { passive: true });
      reduced.addEventListener("change", finish);
    });
  });
}
