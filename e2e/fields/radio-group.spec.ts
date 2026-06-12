import { test, expect } from "@playwright/test"
import { Harness } from "../helpers/harness"
import { oneField, radioGroup } from "../helpers/fields"

const SIZES: [string, string][] = [
  ["Small", "s"],
  ["Medium", "m"],
  ["Large", "l"],
]

/**
 * Radio group — single choice rendered inline. Applicable settings: label
 * (legend), description + position, default value, required, and orientation.
 * (No placeholder, no min/max length.)
 */
test.describe("radio-group field", () => {
  test.describe("label", () => {
    test("renders the configured legend label", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(radioGroup("size", "Shirt size", SIZES)))
      await h.expectLabel("Shirt size")
    })
  })

  test.describe("description", () => {
    test("renders the description text", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(radioGroup("size", "Size", SIZES, { description: "Pick one" })))
      await h.expectDescription("Pick one")
    })

    test("renders ABOVE the control when position is above-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          radioGroup("size", "Size", SIZES, {
            description: "Above",
            descriptionPosition: "above-control",
          })
        )
      )
      expect(await h.descriptionIsAbove('label[for="size-s"]')).toBe(true)
    })

    test("renders BELOW the control when position is below-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          radioGroup("size", "Size", SIZES, {
            description: "Below",
            descriptionPosition: "below-control",
          })
        )
      )
      expect(await h.descriptionIsAbove('label[for="size-s"]')).toBe(false)
    })
  })

  test.describe("default value", () => {
    test("preselects the default option and submits it", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(radioGroup("size", "Size", SIZES, { defaultValue: "m" })))

      expect(await h.isChecked("size-m")).toBe(true)
      await h.submit()
      expect(await h.submittedValues()).toEqual({ size: "m" })
    })
  })

  test.describe("orientation", () => {
    test("lays options out vertically by default", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(radioGroup("size", "Size", SIZES, { orientation: "vertical" })))
      expect(await h.optionsLayout("size", "s", "m")).toBe("vertical")
    })

    test("lays options out horizontally when set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(radioGroup("size", "Size", SIZES, { orientation: "horizontal" })))
      expect(await h.optionsLayout("size", "s", "m")).toBe("horizontal")
    })
  })

  test.describe("required", () => {
    test("shows an asterisk when required", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(radioGroup("size", "Size", SIZES, { required: true })))
      await h.expectRequiredMark(true)
    })

    test("shows NO asterisk when optional", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(radioGroup("size", "Size", SIZES, { required: false })))
      await h.expectRequiredMark(false)
    })

    test("blocks submit with an error when required and nothing chosen", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(radioGroup("size", "Size", SIZES, { required: true })))

      await h.submit()
      await h.expectError("Please select an option")
      await h.expectNoSubmit()
    })

    test("submits when required and an option is chosen", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(radioGroup("size", "Size", SIZES, { required: true })))

      await h.radio("size", "l")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ size: "l" })
    })
  })
})
