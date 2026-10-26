import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
export const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function openBrowser(port = 9231) {
  const profile = await mkdtemp(join(tmpdir(), "jmm-cms-browser-"));
  const browser = spawn(
    process.env.BROWSER_PATH ||
      "C:/Program Files/Google/Chrome/Application/chrome.exe",
    [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      "about:blank",
    ],
    { windowsHide: true, stdio: "ignore" },
  );
  let socket;
  try {
    let targets;
    for (let i = 0; i < 40; i++) {
      try {
        targets = await (await fetch(`http://localhost:${port}/json`)).json();
        break;
      } catch {
        await pause(250);
      }
    }
    if (!targets) throw new Error("Browser did not start.");
    socket = new WebSocket(
      targets.find((t) => t.type === "page").webSocketDebuggerUrl,
    );
    await new Promise((resolve, reject) => {
      socket.onopen = resolve;
      socket.onerror = reject;
    });
    let id = 0;
    const pending = new Map();
    const send = (method, params = {}) =>
      new Promise((resolve, reject) => {
        const key = ++id;
        const timeout = setTimeout(() => {
          pending.delete(key);
          reject(new Error(`Browser command timed out: ${method}`));
        }, 20000);
        pending.set(key, { resolve, reject, timeout });
        socket.send(JSON.stringify({ id: key, method, params }));
      });
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.method === "Page.javascriptDialogOpening") {
        void send("Page.handleJavaScriptDialog", { accept: true });
        return;
      }
      if (data.id) {
        const handler = pending.get(data.id);
        if (!handler) return;
        pending.delete(data.id);
        clearTimeout(handler.timeout);
        if (data.error) handler.reject(new Error(JSON.stringify(data.error)));
        else handler.resolve(data.result);
      }
    };
    await send("Page.enable");
    const evaluate = async (expression) => {
      const result = await send("Runtime.evaluate", {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (result.exceptionDetails)
        throw new Error(result.exceptionDetails.text);
      return result.result.value;
    };
    const waitFor = async (expression, label) => {
      for (let i = 0; i < 60; i++) {
        if (await evaluate(expression)) return;
        await pause(200);
      }
      throw new Error(`Timed out waiting for ${label}`);
    };
    return {
      send,
      evaluate,
      waitFor,
      async navigate(url) {
        await send("Page.navigate", { url });
        await waitFor(`document.readyState==='complete'`, "page load");
        await pause(400);
      },
      async close() {
        socket?.close();
        browser.kill();
        await pause(500);
        await rm(profile, {
          recursive: true,
          force: true,
          maxRetries: 5,
          retryDelay: 300,
        }).catch(() => {});
      },
    };
  } catch (error) {
    socket?.close();
    browser.kill();
    throw error;
  }
}
