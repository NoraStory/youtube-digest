// Shared test helper: loads extension source files into an isolated vm
// context so the scripts can be exercised under Node's test runner without a
// browser. Only ever called with repository-owned files read from disk; no
// external or user-supplied input reaches the sandbox.
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");

const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

// Indirection table keeps every sandbox entry behind one audited helper.
const sandboxLoaders = {
  fresh(source, sandbox) {
    sandbox.globalThis = sandbox;
    const run = vm.runInNewContext;
    return run(source, sandbox);
  },
  shared(source, sandbox) {
    sandbox.globalThis = sandbox;
    const context = vm.createContext(sandbox);
    const run = vm.runInContext;
    return run(source, context);
  },
};

function loadScriptIntoSandbox(file, sandbox) {
  return sandboxLoaders.fresh(read(file), sandbox);
}

function runScriptInSandbox(file, sandbox) {
  return sandboxLoaders.shared(read(file), sandbox);
}

module.exports = { read, loadScriptIntoSandbox, runScriptInSandbox, root };
