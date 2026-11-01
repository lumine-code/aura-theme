const path = require("path");

jasmine.describeWithDocumentFocus("Aura pane presentation focus markers", () => {
  let presentation, bar;

  beforeEach(async () => {
    jasmine.useRealClock();
    lumine.config.set("core.destroyEmptyPanes", false);
    lumine.config.set("theme.accentSource", "theme");
    jasmine.attachToDOM(lumine.workspace.getElement());
    await lumine.packages.activatePackage(path.resolve(__dirname, ".."));
  });

  afterEach(async () => {
    presentation?.dispose();
    presentation = null;
    bar?.remove();
    for (const mode of ["day", "night"]) await lumine.packages.deactivatePackage(`aura-${mode}-ui`);
    await lumine.packages.deactivatePackage("aura-theme");
  });

  for (const mode of ["day", "night"]) {
    it(`keeps its inset marker on a presented pane in ${mode}`, async () => {
      await lumine.packages.activatePackage(`aura-${mode}-ui`);
      const container = lumine.workspace.getMainWindow().getEditorContainer();
      const pane = container.getActivePane();
      pane.splitRight({ activate: false });
      const input = document.createElement("input");
      input.canCopy = () => false;
      input.getAllowedLocations = () => ["center"];
      pane.activateItem(input, { activatePane: true });
      bar = document.createElement("ul");
      bar.className = "tab-bar";
      bar.setAttribute("location", "center");
      bar.innerHTML = '<li class="tab active"><span class="title">Document</span></li>';
      pane.getElement().insertBefore(bar, pane.getElement().firstChild);
      input.focus();
      const tab = bar.querySelector(".tab.active");
      const before = getComputedStyle(tab, "::before");
      const original = {
        content: before.content,
        background: before.backgroundColor,
        width: before.width,
        left: before.left,
        top: before.top,
        bottom: before.bottom,
        radius: before.borderTopLeftRadius,
      };
      expect(original.content).toBe('""');
      expect(original.width).toBe("4px");

      presentation = container.presentPane(pane);

      const presented = getComputedStyle(tab, "::before");
      expect(presented.content).toBe(original.content);
      expect(presented.backgroundColor).toBe(original.background);
      expect(presented.width).toBe(original.width);
      expect(presented.left).toBe(original.left);
      expect(presented.top).toBe(original.top);
      expect(presented.bottom).toBe(original.bottom);
      expect(presented.borderTopLeftRadius).toBe(original.radius);
      expect(document.activeElement).toBe(input);
      presentation.dispose();
      expect(getComputedStyle(tab, "::before").content).toBe('""');
      expect(getComputedStyle(tab, "::before").width).toBe("4px");
    });
  }
});
