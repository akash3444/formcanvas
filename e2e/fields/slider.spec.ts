import { test, expect } from "@playwright/test"
import { Harness } from "../helpers/harness"
import { oneField, slider } from "../helpers/fields"

/**
 * Slider field — a bounded number that always has a value. Applicable settings:
 * label, description + position, default value, and the min/max/step bounds.
 * (No placeholder. The slider intentionally renders NO required asterisk, since
 * it can never be empty — that behavior is pinned below.)
 */
test.describe("slider field", () => {
  test.describe("label", () => {
    test("renders the configured label", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(slider("volume", "Volume")))
      await h.expectLabel("Volume")
    })

    test("never shows a required asterisk, even when required", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(slider("volume", "Volume", { required: true })))
      await h.expectRequiredMark(false)
    })
  })

  test.describe("description", () => {
    test("renders the description text", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(slider("volume", "Volume", { description: "0 to 100" })))
      await h.expectDescription("0 to 100")
    })

    test("renders ABOVE the control when position is above-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          slider("volume", "Volume", {
            description: "Above",
            descriptionPosition: "above-control",
          })
        )
      )
      expect(await h.descriptionIsAbove('[data-slot="slider"]')).toBe(true)
    })

    test("renders BELOW the control when position is below-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          slider("volume", "Volume", {
            description: "Below",
            descriptionPosition: "below-control",
          })
        )
      )
      expect(await h.descriptionIsAbove('[data-slot="slider"]')).toBe(false)
    })
  })

  test.describe("default value", () => {
    test("uses the explicit default and submits it", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(slider("volume", "Volume", { defaultValue: 30 })))

      await expect(h.form().locator("span.tabular-nums")).toHaveText("30")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ volume: 30 })
    })

    test("falls back to the midpoint of [min, max] when no default is set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(slider("volume", "Volume", { min: 0, max: 100 })))

      // midpoint of 0..100
      await expect(h.form().locator("span.tabular-nums")).toHaveText("50")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ volume: 50 })
    })
  })

  test.describe("min/max bounds", () => {
    test("respects custom min/max — the default sits at their midpoint and submits in range", async ({
      page,
    }) => {
      const h = new Harness(page)
      await h.render(oneField(slider("rating", "Rating", { min: 1, max: 11, step: 1 })))

      // midpoint of 1..11
      await expect(h.form().locator("span.tabular-nums")).toHaveText("6")
      await h.submit()
      const values = await h.submittedValues<{ rating: number }>()
      expect(values).toEqual({ rating: 6 })
      expect(values.rating).toBeGreaterThanOrEqual(1)
      expect(values.rating).toBeLessThanOrEqual(11)
    })
  })
})
