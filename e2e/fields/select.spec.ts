import { test, expect } from "@playwright/test"
import { Harness } from "../helpers/harness"
import { oneField, select } from "../helpers/fields"

const COLORS: [string, string][] = [
  ["Red", "red"],
  ["Green", "green"],
  ["Blue", "blue"],
]

/**
 * Select field — single choice from a list. Applicable settings: label,
 * placeholder (trigger), description + position, default value, and required.
 * (No min/max length.)
 */
test.describe("select field", () => {
  test.describe("label", () => {
    test("renders the configured label, tied to the trigger", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(select("color", "Favorite color", COLORS)))

      await h.expectLabel("Favorite color")
      await expect(page.locator('label[for="color"]')).toBeVisible()
    })
  })

  test.describe("placeholder", () => {
    test("shows the custom placeholder in the trigger when nothing is chosen", async ({
      page,
    }) => {
      const h = new Harness(page)
      await h.render(oneField(select("color", "Color", COLORS, { placeholder: "Pick a color" })))
      expect(await h.selectTriggerText("color")).toContain("Pick a color")
    })

    test("falls back to 'Select an option' when no placeholder is set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(select("color", "Color", COLORS)))
      expect(await h.selectTriggerText("color")).toContain("Select an option")
    })
  })

  test.describe("description", () => {
    test("renders the description text", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(select("color", "Color", COLORS, { description: "Your pick" })))
      await h.expectDescription("Your pick")
    })

    test("renders ABOVE the control when position is above-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          select("color", "Color", COLORS, {
            description: "Above",
            descriptionPosition: "above-control",
          })
        )
      )
      expect(await h.descriptionIsAbove("#color")).toBe(true)
    })

    test("renders BELOW the control when position is below-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          select("color", "Color", COLORS, {
            description: "Below",
            descriptionPosition: "below-control",
          })
        )
      )
      expect(await h.descriptionIsAbove("#color")).toBe(false)
    })
  })

  test.describe("default value", () => {
    test("preselects the default option and submits it", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(select("color", "Color", COLORS, { defaultValue: "green" })))

      expect(await h.selectTriggerText("color")).toContain("Green")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ color: "green" })
    })
  })

  test.describe("required", () => {
    test("shows an asterisk when required", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(select("color", "Color", COLORS, { required: true })))
      await h.expectRequiredMark(true)
    })

    test("shows NO asterisk when optional", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(select("color", "Color", COLORS, { required: false })))
      await h.expectRequiredMark(false)
    })

    test("blocks submit with an error when required and nothing chosen", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(select("color", "Color", COLORS, { required: true })))

      await h.submit()
      await h.expectError("Please select an option")
      await h.expectNoSubmit()
    })

    test("submits when required and an option is chosen", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(select("color", "Color", COLORS, { required: true })))

      await h.selectOption("color", "Blue")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ color: "blue" })
    })
  })
})
