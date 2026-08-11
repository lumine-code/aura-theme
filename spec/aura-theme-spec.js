const fs = require("fs");
const path = require("path");

describe("aura-theme", () => {
  afterEach(async () => {
    await lumine.packages.deactivatePackage("aura-day-ui");
    await lumine.packages.deactivatePackage("aura-day-syntax");
    await lumine.packages.deactivatePackage("aura-night-ui");
    await lumine.packages.deactivatePackage("aura-night-syntax");
    await lumine.packages.deactivatePackage("aura-theme");
  });

  it("registers its light and dark themes as a pack", async () => {
    await lumine.packages.activatePackage("aura-theme");

    const themePack = lumine.themes.getThemePacks().find(({ name }) => name === "Aura");

    expect(themePack.light).toEqual(["aura-day-ui", "aura-day-syntax"]);
    expect(themePack.dark).toEqual(["aura-night-ui", "aura-night-syntax"]);
  });

  it("loads One first and keeps only Aura overrides locally", async () => {
    await lumine.packages.activatePackage("aura-theme");

    const uiPaths = lumine.packages.getLoadedPackage("aura-day-ui").getStylesheetPaths();
    const syntaxPaths = lumine.packages.getLoadedPackage("aura-day-syntax").getStylesheetPaths();
    // Anchor on the resolved package roots, never on a bare name substring: on
    // CI the checkout lives under a directory named after this repository, so
    // every path — one-theme's included — contains "aura-theme".
    const onePrefix =
      path.join(lumine.packages.resolvePackagePath("one-theme"), "styles") + path.sep;
    const auraPrefix =
      path.join(lumine.packages.getLoadedPackage("aura-theme").path, "styles") + path.sep;
    const oneUiPath = uiPaths.find(
      (stylePath) =>
        stylePath.startsWith(onePrefix) && path.basename(stylePath) === "03-buttons.css",
    );
    const oneUiPalette = uiPaths.find(
      (stylePath) =>
        stylePath.startsWith(onePrefix) &&
        stylePath.includes(`${path.sep}day-ui${path.sep}`) &&
        path.basename(stylePath) === "variables.css",
    );
    const auraUiOverride = uiPaths.find(
      (stylePath) =>
        stylePath.startsWith(auraPrefix) && path.basename(stylePath) === "overrides.css",
    );
    const auraUiPalette = uiPaths.find(
      (stylePath) =>
        stylePath.startsWith(auraPrefix) &&
        stylePath.includes(`${path.sep}day-ui${path.sep}`) &&
        path.basename(stylePath) === "variables.css",
    );

    expect(oneUiPath).toBeDefined();
    expect(oneUiPalette).toBeDefined();
    expect(auraUiOverride).toBeDefined();
    expect(auraUiPalette).toBeDefined();
    expect(uiPaths.indexOf(oneUiPath)).toBeLessThan(uiPaths.indexOf(auraUiOverride));
    expect(uiPaths.indexOf(oneUiPalette)).toBeLessThan(uiPaths.indexOf(auraUiPalette));
    expect(uiPaths.some((stylePath) => path.basename(stylePath) === "config.css")).toBe(false);
    expect(
      syntaxPaths.some(
        (stylePath) =>
          stylePath.startsWith(onePrefix) && path.basename(stylePath) === "04-base.css",
      ),
    ).toBe(true);

    await lumine.packages.activatePackage("aura-day-ui");
    await lumine.packages.activatePackage("aura-day-syntax");
    expect(lumine.themes.stylesheetElementForId(auraUiOverride)).not.toBeNull();
    expect(lumine.themes.stylesheetElementForId(auraUiPalette)).not.toBeNull();

    const rootStyle = getComputedStyle(document.documentElement);
    expect(rootStyle.getPropertyValue("--app-background-color").trim()).toBe("#f2f2f2");
    expect(rootStyle.getPropertyValue("--tool-panel-background-color").trim()).toBe("#f2f2f2");
    expect(rootStyle.getPropertyValue("--base-border-color").trim()).toBe("hsl(228, 12%, 88%)");
    expect(rootStyle.getPropertyValue("--accent-color").trim()).toBe("#5a8ae9");
    expect(rootStyle.getPropertyValue("--overlay-backdrop-color").trim()).toBe("hsl(0, 0%, 48%)");
    expect(rootStyle.getPropertyValue("--syntax-background-color").trim()).toBe("hsl(0, 0%, 100%)");
    expect(rootStyle.getPropertyValue("--syntax-selection-color").trim()).toBe("#ebebeb");
    expect(rootStyle.getPropertyValue("--component-border-radius").trim()).toBe("6px");

    const gitList = document.createElement("div");
    gitList.className = "git-panel-FilePatchListView";
    const gitListItem = document.createElement("div");
    gitListItem.className = "git-panel-FilePatchListView-item is-selected";
    gitList.appendChild(gitListItem);
    document.body.appendChild(gitList);

    expect(getComputedStyle(gitList).paddingTop).toBe("4px");
    expect(getComputedStyle(gitList).paddingBottom).toBe("4px");
    expect(getComputedStyle(gitListItem).borderRadius).toBe("6px");
    gitList.remove();

    const listGroup = document.createElement("ul");
    listGroup.className = "list-group";
    document.body.appendChild(listGroup);

    expect(getComputedStyle(listGroup).paddingTop).toBe("4px");
    expect(getComputedStyle(listGroup).paddingBottom).toBe("4px");
    listGroup.remove();

    const modalListView = document.createElement("div");
    modalListView.className = "select-list";
    const modalList = document.createElement("ol");
    modalList.className = "list-group";
    modalListView.appendChild(modalList);
    const modalPanel = lumine.workspace.addModalPanel({ item: modalListView });
    const modalPanelElement = modalPanel.getElement();
    modalPanelElement.classList.add("modal");
    document.body.appendChild(modalPanelElement);

    try {
      expect(getComputedStyle(modalList).paddingTop).toBe("0px");
      expect(getComputedStyle(modalList).paddingBottom).toBe("0px");

      Array.from({ length: 13 }, (_, index) => {
        const row = document.createElement("li");
        row.textContent = `Result ${index + 1}`;
        modalList.appendChild(row);
        return row;
      });

      expect(modalList.scrollHeight).toBeGreaterThan(modalList.clientHeight);
      expect(getComputedStyle(modalList.firstElementChild).marginTop).toBe("2px");
      expect(getComputedStyle(modalList.firstElementChild).marginBottom).toBe("2px");
    } finally {
      modalPanel.destroy();
    }

    const recentCommits = document.createElement("ul");
    recentCommits.className = "git-panel-RecentCommits-list";
    const recentCommit = document.createElement("li");
    recentCommit.className = "git-panel-RecentCommit most-recent is-selected";
    recentCommits.appendChild(recentCommit);
    document.body.appendChild(recentCommits);

    expect(getComputedStyle(recentCommit).borderRadius).toBe("6px");
    recentCommits.remove();

    const settingsView = document.createElement("div");
    settingsView.className = "settings-view";
    const configMenu = document.createElement("div");
    configMenu.className = "config-menu";
    const configNav = document.createElement("ul");
    configNav.className = "nav nav-pills nav-stacked";
    const configItem = document.createElement("li");
    configItem.className = "active";
    const configLink = document.createElement("a");
    configItem.appendChild(configLink);
    configNav.appendChild(configItem);
    configMenu.appendChild(configNav);
    settingsView.appendChild(configMenu);
    document.body.appendChild(settingsView);

    const configLinkStyle = getComputedStyle(configLink);
    const configItemStyle = getComputedStyle(configItem);
    expect(configItemStyle.marginTop).toBe("2px");
    expect(configItemStyle.marginBottom).toBe("2px");
    expect(configLinkStyle.marginLeft).toBe("4px");
    expect(configLinkStyle.marginRight).toBe("4px");
    expect(configLinkStyle.borderRadius).toBe("6px");
    settingsView.remove();

    const dock = document.createElement("lumine-dock");
    const dockTabBar = document.createElement("ul");
    dockTabBar.className = "tab-bar";
    const dockTab = document.createElement("li");
    dockTab.className = "tab active";
    dockTabBar.appendChild(dockTab);
    dock.appendChild(dockTabBar);
    document.body.appendChild(dock);

    const dockTabStyle = getComputedStyle(dockTab);
    expect(dockTabStyle.flexGrow).toBe("1");
    expect(dockTabStyle.flexShrink).toBe("1");
    expect(dockTabStyle.maxWidth).toBe("none");
    expect(dockTabStyle.borderTopLeftRadius).toBe("6px");
    expect(dockTabStyle.borderTopRightRadius).toBe("0px");
    expect(dockTabStyle.boxShadow).toBe("none");

    const dockLastTab = document.createElement("li");
    dockLastTab.className = "tab";
    dockTabBar.appendChild(dockLastTab);

    const inactiveDockLastTabStyle = getComputedStyle(dockLastTab);
    expect(inactiveDockLastTabStyle.borderTopRightRadius).toBe("6px");
    expect(inactiveDockLastTabStyle.boxShadow).toBe("rgb(221, 222, 228) 0px -1px 0px 0px inset");

    dockTab.classList.remove("active");
    dockLastTab.classList.add("active");
    expect(getComputedStyle(dockLastTab).boxShadow).toBe("none");
    dock.remove();

    const paneTabBar = document.createElement("ul");
    paneTabBar.className = "tab-bar";
    paneTabBar.setAttribute("location", "center");
    const paneTab = document.createElement("li");
    paneTab.className = "tab active";
    paneTabBar.appendChild(paneTab);
    document.body.appendChild(paneTabBar);

    expect(getComputedStyle(paneTab).maxWidth).toBe("210px");
    expect(getComputedStyle(paneTab).borderTopLeftRadius).toBe("0px");
    expect(getComputedStyle(paneTab).borderTopRightRadius).toBe("6px");

    const paneLastTab = document.createElement("li");
    paneLastTab.className = "tab";
    paneTabBar.appendChild(paneLastTab);
    paneTabBar.classList.add("is-fully-occupied");

    expect(getComputedStyle(paneTab).borderTopLeftRadius).toBe("0px");
    expect(getComputedStyle(paneTab).borderTopRightRadius).toBe("6px");
    expect(getComputedStyle(paneLastTab).borderTopRightRadius).toBe("6px");

    paneTab.classList.remove("active");
    paneLastTab.classList.add("active");
    expect(getComputedStyle(paneTab).borderTopLeftRadius).toBe("6px");
    expect(getComputedStyle(paneLastTab).borderTopLeftRadius).toBe("6px");
    expect(getComputedStyle(paneLastTab).borderTopRightRadius).toBe("0px");

    paneLastTab.remove();
    paneTab.classList.add("active");
    expect(getComputedStyle(paneTab).borderTopRightRadius).toBe("0px");

    const activeTabSignalStyle = getComputedStyle(paneTab, "::before");
    expect(activeTabSignalStyle.top).toBe("7px");
    expect(activeTabSignalStyle.bottom).toBe("7px");
    expect(activeTabSignalStyle.left).toBe("3px");
    expect(activeTabSignalStyle.width).toBe("4px");
    expect(activeTabSignalStyle.borderTopLeftRadius).toBe("999px");
    paneTabBar.remove();

    const statusBar = document.createElement("div");
    statusBar.className = "status-bar";
    const statusBarLeft = document.createElement("div");
    statusBarLeft.className = "status-bar-left";
    // The bar stamps `.status-bar-item` on each element it hosts; `.inline-block`
    // is a layout utility a tile may nest inside itself, and is not a tile.
    const statusBarItem = document.createElement("span");
    statusBarItem.className = "status-bar-item";
    const statusBarItemLink = document.createElement("a");
    statusBarItemLink.className = "inline-block";
    statusBarItem.appendChild(statusBarItemLink);
    statusBarLeft.appendChild(statusBarItem);
    statusBar.appendChild(statusBarLeft);
    const statusBarRight = document.createElement("div");
    statusBarRight.className = "status-bar-right";
    const settingsItem = document.createElement("span");
    settingsItem.className = "status-bar-item settings-icon";
    statusBarRight.appendChild(settingsItem);
    // git-panel and github-panel portal their contents into a host element, so
    // the tile is that host rather than the chip rendered inside it.
    const portalHost = document.createElement("div");
    portalHost.className = "react-lumine-status-bar status-bar-item";
    const portalTile = document.createElement("button");
    portalTile.className = "inline-block";
    portalHost.appendChild(portalTile);
    statusBarRight.appendChild(portalHost);
    statusBar.appendChild(statusBarRight);
    document.body.appendChild(statusBar);

    const statusBarItemStyle = getComputedStyle(statusBarItem);
    expect(getComputedStyle(statusBarLeft).paddingLeft).toBe("4px");
    expect(getComputedStyle(statusBarRight).paddingRight).toBe("4px");
    expect(statusBarItemStyle.height).toBe("26px");
    expect(statusBarItemStyle.marginTop).toBe("3px");
    expect(statusBarItemStyle.marginBottom).toBe("3px");
    expect(statusBarItemStyle.borderRadius).toBe("6px");

    // A tile's own nested blocks lay the tile out; only the tile is inset.
    const statusBarItemLinkStyle = getComputedStyle(statusBarItemLink);
    expect(statusBarItemLinkStyle.marginTop).toBe("0px");
    expect(statusBarItemLinkStyle.marginBottom).toBe("0px");

    const portalHostStyle = getComputedStyle(portalHost);
    expect(portalHostStyle.height).toBe("26px");
    expect(portalHostStyle.marginTop).toBe("3px");
    expect(portalHostStyle.marginBottom).toBe("3px");
    expect(portalHostStyle.borderRadius).toBe("6px");

    // The chip inside the host is layout, not a second tile.
    expect(getComputedStyle(portalTile).borderRadius).toBe("0px");
    statusBar.remove();

    const titleBar = document.createElement("div");
    titleBar.className = "title-bar";
    const controlTiles = document.createElement("div");
    controlTiles.className = "control-tiles";
    controlTiles.style.height = "36px";
    const titleBarItem = document.createElement("button");
    titleBarItem.className = "title-bar-item";
    controlTiles.appendChild(titleBarItem);
    titleBar.appendChild(controlTiles);
    document.body.appendChild(titleBar);

    const titleBarItemStyle = getComputedStyle(titleBarItem);
    expect(titleBarItemStyle.height).toBe("30px");
    expect(titleBarItemStyle.marginTop).toBe("3px");
    expect(titleBarItemStyle.marginBottom).toBe("3px");
    expect(titleBarItemStyle.borderRadius).toBe("6px");

    const appMenu = document.createElement("div");
    appMenu.className = "app-menu";
    const menuLabel = document.createElement("div");
    menuLabel.className = "menu-label";
    appMenu.appendChild(menuLabel);
    titleBar.appendChild(appMenu);

    const menuHighlightStyle = getComputedStyle(menuLabel, "::before");
    expect(menuHighlightStyle.top).toBe("3px");
    expect(menuHighlightStyle.bottom).toBe("3px");
    expect(menuHighlightStyle.borderTopLeftRadius).toBe("6px");
    titleBar.remove();
  });

  it("uses theme-consistent generic navigation and keyboard-visible custom controls", async () => {
    await lumine.packages.activatePackage("aura-theme");
    await lumine.packages.activatePackage("aura-day-ui");

    const fixture = document.createElement("div");
    const nav = document.createElement("ul");
    nav.className = "nav nav-pills";
    nav.innerHTML = '<li class="active"><a>Active</a></li>';
    fixture.appendChild(nav);
    document.body.appendChild(fixture);

    try {
      const link = nav.querySelector("a");
      const linkStyle = getComputedStyle(link);
      const colorProbe = document.createElement("span");
      colorProbe.style.color = "var(--text-color-selected)";
      colorProbe.style.backgroundColor = "var(--background-color-selected)";
      fixture.appendChild(colorProbe);

      const colorProbeStyle = getComputedStyle(colorProbe);
      expect(linkStyle.color).toBe(colorProbeStyle.color);
      expect(linkStyle.backgroundColor).toBe(colorProbeStyle.backgroundColor);
      expect(linkStyle.borderRadius).toBe("6px");

      for (const kind of ["primary", "info", "success", "warning", "error"]) {
        const button = document.createElement("button");
        button.className = `btn btn-${kind}`;
        fixture.appendChild(button);

        expect(getComputedStyle(button).backgroundImage).toBe("none");
      }

      for (const [type, className] of [
        ["checkbox", "input-checkbox"],
        ["radio", "input-radio"],
        ["checkbox", "input-toggle"],
        ["range", "input-range"],
      ]) {
        const control = document.createElement("input");
        control.type = type;
        control.className = className;
        fixture.appendChild(control);
        control.focus();

        expect(document.activeElement).toBe(control);
        expect(getComputedStyle(control).boxShadow).not.toBe("none");
      }
    } finally {
      fixture.remove();
    }
  });

  it("does not overwrite One's Git status and diff colors", () => {
    const uiProperties = [
      "--text-color-added",
      "--text-color-modified",
      "--text-color-removed",
      "--text-color-renamed",
      "--text-color-conflicted",
    ];
    const syntaxProperties = [
      "--syntax-color-added",
      "--syntax-color-modified",
      "--syntax-color-removed",
      "--syntax-color-renamed",
    ];

    for (const [relativePath, properties] of [
      ["styles/day-ui/variables.css", uiProperties],
      ["styles/night-ui/variables.css", uiProperties],
      ["styles/day-syntax/variables.css", syntaxProperties],
      ["styles/night-syntax/variables.css", syntaxProperties],
    ]) {
      const source = fs.readFileSync(path.join(__dirname, "..", relativePath), "utf8");
      for (const propertyName of properties) {
        expect(source).not.toMatch(new RegExp(`${propertyName}\\s*:`));
      }
    }
  });

  it("uses the deeper Aura surfaces in its night pair", async () => {
    await lumine.packages.activatePackage("aura-theme");
    await lumine.packages.activatePackage("aura-night-ui");
    await lumine.packages.activatePackage("aura-night-syntax");

    const rootStyle = getComputedStyle(document.documentElement);
    expect(rootStyle.getPropertyValue("--app-background-color").trim()).toBe("hsl(228, 22%, 6%)");
    expect(rootStyle.getPropertyValue("--base-border-color").trim()).toBe("hsl(228, 22%, 4%)");
    expect(rootStyle.getPropertyValue("--syntax-background-color").trim()).toBe(
      "hsl(228, 20%, 10%)",
    );
    expect(rootStyle.getPropertyValue("--accent-color").trim()).toBe("#5a8ae9");
    expect(rootStyle.getPropertyValue("--overlay-backdrop-color").trim()).toBe("hsl(0, 0%, 12%)");
  });
});
