import { test, expect } from "@playwright/test"
import { Harness } from "../helpers/harness"
import { checkbox, oneField } from "../helpers/fields"

/**
 * Checkbox field — a single boolean. Applicable settings: label, description,
 * default value, and required. (No placeholder, no min/max length.)
 */
test.describe("checkbox field", () => {
  test.describe("label", () => {
    test("renders the configured label, tied to the control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkbox("agree", "I agree to the terms")))

      await h.expectLabel("I agree to the terms")
      await expect(page.locator('label[for="agree"]')).toBeVisible()
    })
  })

  test.describe("description", () => {
    test("renders the description text", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkbox("agree", "Agree", { description: "Read them first" })))
      await h.expectDescription("Read them first")
    })

    test("is hidden when no description is set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkbox("agree", "Agree")))
      await expect(h.form().locator('[data-slot="field-description"]')).toHaveCount(0)
    })
  })

  test.describe("default value", () => {
    test("starts checked and submits true when default is true", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkbox("agree", "Agree", { defaultValue: true })))

      expect(await h.isChecked("agree")).toBe(true)
      await h.submit()
      expect(await h.submittedValues()).toEqual({ agree: true })
    })

    test("starts unchecked and submits false by default", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkbox("agree", "Agree")))

      expect(await h.isChecked("agree")).toBe(false)
      await h.submit()
      expect(await h.submittedValues()).toEqual({ agree: false })
    })
  })

  test.describe("required", () => {
    test("shows an asterisk when required", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkbox("agree", "Agree", { required: true })))
      await h.expectRequiredMark(true)
    })

    test("shows NO asterisk when optional", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkbox("agree", "Agree", { required: false })))
      await h.expectRequiredMark(false)
    })

    test("blocks submit with an error when required and unchecked", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkbox("agree", "Agree", { required: true })))

      await h.submit()
      await h.expectError("This field is required")
      await h.expectNoSubmit()
    })

    test("submits when required and checked", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkbox("agree", "Agree", { required: true })))

      await h.setBoolean("agree", true)
      await h.submit()
      expect(await h.submittedValues()).toEqual({ agree: true })
    })
  })
})
