const test = require("node:test");
const assert = require("node:assert/strict");

const settings = require("../settings.js");

test("DeepSeek defaults use V4 Flash", () => {
  const normalized = settings.normalize({
    provider: "unexpected",
    aiApiKey: `  ${process.env.YTD_TEST_AI_API_KEY || "fixture-alpha"}  `,
    aiBaseUrl: "https://api.example.com/v1",
    aiModel: "example-model",
    supadataApiKey: `  ${process.env.YTD_TEST_SUPADATA_KEY || "fixture-beta"}  `,
  });

  assert.equal(normalized.provider, "deepseek");
  assert.equal(normalized.aiBaseUrl, "https://api.deepseek.com");
  assert.equal(normalized.aiModel, "deepseek-v4-flash");
  assert.equal(normalized.aiApiKey, process.env.YTD_TEST_AI_API_KEY || "fixture-alpha");
  assert.equal(normalized.supadataApiKey, process.env.YTD_TEST_SUPADATA_KEY || "fixture-beta");
  assert.equal(
    settings.chatCompletionsUrl(),
    "https://api.deepseek.com/chat/completions",
  );
});

test("legacy custom migration clears only the AI key and is idempotent", () => {
  const legacy = {
    provider: "custom",
    aiApiKey: process.env.YTD_TEST_AI_API_KEY || "fixture-legacy-ai",
    aiBaseUrl: "https://api.example.com/v1",
    aiModel: "example-model",
    supadataApiKey: ` ${process.env.YTD_TEST_SUPADATA_KEY || "fixture-legacy-supadata"} `,
  };
  const first = settings.migrateLegacyCustom(legacy);
  const legacyAiValue = process.env.YTD_TEST_AI_API_KEY || "fixture-legacy-ai";
  const legacySupadataValue =
    process.env.YTD_TEST_SUPADATA_KEY || "fixture-legacy-supadata";

  assert.equal(first.migrated, true);
  assert.equal(first.settings.provider, "deepseek");
  assert.equal(first.settings.aiBaseUrl, settings.DEFAULTS.aiBaseUrl);
  assert.equal(first.settings.aiModel, settings.DEFAULTS.aiModel);
  assert.equal(first.settings.aiApiKey, "");
  assert.equal(first.settings.supadataApiKey, legacySupadataValue.trim());

  const second = settings.migrateLegacyCustom(first.settings);
  assert.equal(second.migrated, false);
  assert.deepEqual(second.settings, first.settings);

  const configuredDeepSeek = settings.normalize({
    ...first.settings,
    aiApiKey: legacyAiValue ? `rotated-${legacyAiValue}` : "fixture-rotated-ai",
  });
  assert.equal(
    configuredDeepSeek.aiApiKey,
    legacyAiValue ? `rotated-${legacyAiValue}` : "fixture-rotated-ai",
  );
});

test("Supadata receives a canonical YouTube URL", () => {
  assert.equal(
    settings.canonicalYouTubeUrl("ydTeb_I0b94"),
    "https://www.youtube.com/watch?v=ydTeb_I0b94",
  );
  assert.throws(
    () => settings.canonicalYouTubeUrl('"><script>'),
    /Invalid YouTube video ID/,
  );
});
