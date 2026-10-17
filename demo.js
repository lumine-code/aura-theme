// Authentic package usage. Run with lumine/script/demo.js; fixtures stay in demo/.
module.exports = {
  version: 1,
  dependencies: ["language-javascript", "tree-view"],
  viewport: { width: 1200, height: 760 },
  async before() {},
  async prepare(context) {
    const { lumine, state, fixture, open } = context;
    state.editor = await open("themes/signal.js");
    await lumine.project.setPaths([fixture("themes")]);
    lumine.themes.setThemePack(lumine.themes.getThemePacks().find((p) => p.name === "Aura"));
    lumine.commands.dispatch(lumine.views.getView(state.editor), "tree-view:show");
  },
  scenes: [
    {
      id: "scene-1",
      file: "demo.png",
      caption: "Aura in light mode.",
      timeout: 60000,
      async run(context) {
        const { lumine } = context;
        {
          lumine.config.set("theme.mode", "light");
          await lumine.themes.whenThemesSettled();
        }
      },
      ready({ lumine }) {
        return Boolean(
          lumine.themes.getActiveThemeNames().includes("aura-day-ui") &&
          lumine.themes.getActiveThemeNames().includes("aura-day-syntax") &&
          document.querySelector("lumine-workspace")?.getBoundingClientRect().height > 0 &&
          document.body.innerText.trim().length > 0,
        );
      },
    },
    {
      id: "scene-2",
      file: "demo-2.png",
      caption: "Aura in dark mode.",
      timeout: 60000,
      async run(context) {
        const { lumine } = context;
        {
          lumine.config.set("theme.mode", "dark");
          await lumine.themes.whenThemesSettled();
        }
      },
      ready({ lumine }) {
        return Boolean(
          lumine.themes.getActiveThemeNames().includes("aura-night-ui") &&
          lumine.themes.getActiveThemeNames().includes("aura-night-syntax") &&
          document.querySelector("lumine-workspace")?.getBoundingClientRect().height > 0 &&
          document.body.innerText.trim().length > 0,
        );
      },
    },
  ],
  async cleanup(context) {
    const { lumine } = context;
    lumine.themes.setThemePack(lumine.themes.getThemePacks().find((p) => p.name === "One"));
    lumine.config.set("theme.mode", "light");
  },
};
