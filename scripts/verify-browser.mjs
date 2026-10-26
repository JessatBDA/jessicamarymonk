// Browser smoke checks against a running local server; no extra dependency.
import { spawn } from "node:child_process";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
const browserPath =
  process.env.BROWSER_PATH ||
  "C:/Program Files/Google/Chrome/Application/chrome.exe";
const baseUrl = process.env.TEST_BASE_URL || "http://localhost:3000";
const profile = await mkdtemp(join(tmpdir(), "jmm-browser-"));
const browser = spawn(
  browserPath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--remote-debugging-port=9223",
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { windowsHide: true, stdio: "ignore" },
);
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;
try {
  let targets;
  for (let i = 0; i < 40; i++) {
    try {
      targets = await (await fetch("http://localhost:9223/json")).json();
      break;
    } catch {
      await pause(250);
    }
  }
  if (!targets) throw new Error("Browser debugging endpoint did not start");
  socket = new WebSocket(
    targets.find((target) => target.type === "page").webSocketDebuggerUrl,
  );
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id) {
      const callback = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) callback.reject(new Error(JSON.stringify(data.error)));
      else callback.resolve(data.result);
    }
  };
  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const key = ++id;
      pending.set(key, { resolve, reject });
      socket.send(JSON.stringify({ id: key, method, params }));
    });
  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    if (result.exceptionDetails)
      throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const assert = (value, message) => {
    if (!value) throw new Error(message);
  };
  const paths = [
    "/",
    "/public-art",
    "/public-art/the-hands-of-worcester",
    "/paintings-illustrations",
    "/about",
    "/contact",
    "/engagement/the-hands-of-worcester",
    "/shop",
    "/admin",
    "/privacy",
  ];
  const checks = [];
  await mkdir("docs/previews", { recursive: true });
  for (const width of [390, 768, 1440]) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height: 950,
      deviceScaleFactor: 1,
      mobile: width < 500,
    });
    for (const path of paths) {
      await send("Page.navigate", { url: baseUrl + path });
      await pause(500);
      const result = await evaluate(
        `({h1: document.querySelectorAll('h1').length, overflow: document.documentElement.scrollWidth > innerWidth, main: !!document.querySelector('main'), title: document.title})`,
      );
      assert(
        result.h1 === 1 && result.main,
        `${path}: missing semantic page structure`,
      );
      assert(!result.overflow, `${path}: horizontal overflow at ${width}px`);
      checks.push({ path, width, ...result });
      if (path === "/" && width !== 768) {
        const shot = await send("Page.captureScreenshot", {
          format: "png",
          captureBeyondViewport: true,
        });
        await writeFile(
          `docs/previews/home-${width}.png`,
          Buffer.from(shot.data, "base64"),
        );
      }
      if (path === "/" && width === 390) {
        await evaluate(`document.querySelector('.menu-toggle').click()`);
        assert(
          await evaluate(
            `document.querySelector('.menu-toggle').getAttribute('aria-expanded') === 'true' && getComputedStyle(document.querySelector('#main-nav')).display !== 'none'`,
          ),
          "Mobile menu did not open",
        );
      }
      if (path === "/paintings-illustrations") {
        await evaluate(
          `Array.from(document.querySelectorAll('.filters button')).find(b => b.textContent === 'Portraits').click()`,
        );
        assert(
          await evaluate(
            `document.querySelectorAll('.portfolio-grid figure').length === 1 && document.querySelector('.portfolio-grid').textContent.includes('Portraits')`,
          ),
          "Portfolio filter failed",
        );
      }
      if (path === "/contact" || path.startsWith("/engagement"))
        assert(
          await evaluate(
            `document.querySelector('button[type=submit]').matches(':disabled')`,
          ),
          "Preview form submission was not disabled",
        );
    }
  }
  await send("Page.navigate", { url: baseUrl + "/missing-page-check" });
  await pause(500);
  assert(
    await evaluate(
      `document.querySelector('h1')?.textContent === 'Page not found.'`,
    ),
    "404 page failed",
  );
  await writeFile(
    "docs/previews/browser-checks.json",
    JSON.stringify(checks, null, 2),
  );
  console.log(
    `Passed ${checks.length} page/viewport checks, mobile navigation, category filtering, disabled submissions and 404.`,
  );
} finally {
  socket?.close();
  browser.kill();
  await pause(500);
  await rm(profile, {
    recursive: true,
    force: true,
    maxRetries: 5,
    retryDelay: 300,
  }).catch(() => {});
}
