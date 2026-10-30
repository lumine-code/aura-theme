describe("Aura compact dock tab theme hooks", () => {
  afterEach(async () => {
    for (const mode of ["day", "night"]) {
      await lumine.packages.deactivatePackage(`aura-${mode}-ui`);
    }
    await lumine.packages.deactivatePackage("aura-theme");
  });

  function resolveColor(container, value) {
    const probe = document.createElement("span");
    probe.style.backgroundColor = value;
    container.appendChild(probe);
    const color = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return color;
  }

  for (const mode of ["day", "night"]) {
    it(`offers inset surfaces and theme icon colors without changing title tabs in ${mode}`, async () => {
      await lumine.packages.activatePackage("aura-theme");
      await lumine.packages.activatePackage(`aura-${mode}-ui`);
      const fixture = document.createElement("div");
      const bar = document.createElement("ul");
      bar.className = "tab-bar icons-only";
      bar.setAttribute("location", "left");
      const inactiveTab = document.createElement("li");
      inactiveTab.className = "tab";
      inactiveTab.innerHTML = '<span class="title icon icon-tools"></span>';
      const activeTab = document.createElement("li");
      activeTab.className = "tab active";
      activeTab.innerHTML = '<span class="title icon icon-tools"></span>';
      bar.append(inactiveTab, activeTab);
      fixture.appendChild(bar);
      jasmine.attachToDOM(fixture);

      try {
        const style = getComputedStyle(bar);
        expect(style.getPropertyValue("--dock-tab-inset").trim()).toBe("3px");
        expect(style.getPropertyValue("--dock-tab-border-radius").trim()).toBe("6px");
        expect(getComputedStyle(activeTab.firstElementChild).color).toBe(
          resolveColor(bar, "var(--tab-text-color-active)"),
        );
        expect(getComputedStyle(inactiveTab.firstElementChild).color).toBe(
          resolveColor(bar, "var(--tab-text-color)"),
        );
        expect(getComputedStyle(activeTab.firstElementChild).color).not.toBe(
          getComputedStyle(inactiveTab.firstElementChild).color,
        );

        bar.classList.remove("icons-only");
        expect(getComputedStyle(bar).getPropertyValue("--dock-tab-inset").trim()).toBe("");
      } finally {
        fixture.remove();
      }
    });
  }
});
