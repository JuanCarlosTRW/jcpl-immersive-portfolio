import test from "node:test";
import assert from "node:assert/strict";
import { getReviewSettings } from "../src/experience/review.ts";

test("first-flight review defaults to the stable wide composition", () => {
  const review = getReviewSettings("?review=first-flight");
  assert.equal(review.enabled, true);
  assert.equal(review.shot, "wide");
  assert.equal(review.rail, 0.16);
  assert.equal(review.scroll, 0.23);
  assert.equal(review.still, true);
  assert.equal(review.bloom, false);
  assert.equal(review.backdrop, true);
  assert.equal(review.record, false);
});

test("review controls clamp scroll and expose deterministic material/contact shots", () => {
  assert.equal(
    getReviewSettings("?review=first-flight&shot=material&scroll=-4").rail,
    0.2,
  );
  assert.equal(
    getReviewSettings("?review=first-flight&shot=contact&scroll=9").rail,
    0.28,
  );
  assert.equal(
    getReviewSettings("?review=first-flight&shot=contact&scroll=9").scroll,
    1,
  );
});

test("motion review keeps the existing rail live and enables direct capture explicitly", () => {
  const review = getReviewSettings(
    "?review=first-flight&shot=motion&record=on&backdrop=off&shadows=on&traveler=off",
  );
  assert.equal(review.rail, null);
  assert.equal(review.still, false);
  assert.equal(review.record, true);
  assert.equal(review.backdrop, false);
  assert.equal(review.shadows, "on");
  assert.equal(review.traveler, "off");
});
