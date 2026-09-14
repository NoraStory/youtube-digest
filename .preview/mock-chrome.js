// Minimal chrome.* mock so the real extension UI renders outside an
// extension host (used only for on-device preview screenshots).
(() => {
  const storageData = {};
  const listeners = { addListener() {} };
  window.chrome = {
    runtime: {
      onMessage: listeners,
      sendMessage: () => Promise.resolve({}),
      getURL: (p) => p,
      openOptionsPage() {},
      lastError: null,
    },
    storage: {
      local: {
        get: async (key) => {
          if (key === null) return { ...storageData };
          if (Array.isArray(key)) {
            return Object.fromEntries(key.map((k) => [k, storageData[k]]).filter(([, v]) => v !== undefined));
          }
          return storageData[key] !== undefined ? { [key]: storageData[key] } : {};
        },
        set: async (values) => Object.assign(storageData, values),
        remove: async (keys) => {
          for (const k of Array.isArray(keys) ? keys : [keys]) delete storageData[k];
        },
      },
      session: {
        get: async () => ({}),
        set: async () => {},
        setAccessLevel: async () => {},
      },
    },
    tabs: {
      query: async () => [{ id: 1, url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }],
      sendMessage: async () => ({}),
      onUpdated: listeners,
      onActivated: listeners,
      create() {},
    },
    windows: { getCurrent: async () => ({ id: 1 }) },
    action: { onClicked: listeners },
  };
})();
