import { test, expect } from "@playwright/test"
import { Harness } from "../helpers/harness"
import { oneField, toggle } from "../helpers/fields"

/**
 * Switch field — a single boolean toggle. Applicable settings: label,
 * description, default value, and required. (No placeholder, no min/max length.)
 */
test.describe("switch field", () => {
  test.describe("label", () => {
    test("renders the configured label, tied to the control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(toggle("notify", "Email notifications")))

      await h.expectLabel("Email notifications")
      await expect(page.locator('label[for="notify"]')).toBeVisible()
    })
  })

  test.describe("description", () => {
    test("renders the description text", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(toggle("notify", "Notify", { description: "We email you updates" })))
      await h.expectDescription("We email you updates")
    })

    test("is hidden when no description is set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(toggle("notify", "Notify")))
      await expect(h.form().locator('[data-slot="field-description"]')).toHaveCount(0)
    })
  })

  test.describe("default value", () => {
    test("starts on and submits true when default is true", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(toggle("notify", "Notify", { defaultValue: true })))

      expect(await h.isChecked("notify")).toBe(true)
      await h.submit()
      expect(await h.submittedValues()).toEqual({ notify: true })
    })

    test("starts off and submits false by default", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(toggle("notify", "Notify")))

      expect(await h.isChecked("notify")).toBe(false)
      await h.submit()
      expect(await h.submittedValues()).toEqual({ notify: false })
    })
  })

  test.describe("required", () => {
    test("shows an asterisk when required", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(toggle("notify", "Notify", { required: true })))
      await h.expectRequiredMark(true)
    })

    test("shows NO asterisk when optional", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(toggle("notify", "Notify", { required: false })))
      await h.expectRequiredMark(false)
    })

    test("blocks submit with an error when required and off", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(toggle("notify", "Notify", { required: true })))

      await h.submit()
      await h.expectError("This field is required")
      await h.expectNoSubmit()
    })

    test("submits when required and on", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(toggle("notify", "Notify", { required: true })))

      await h.setBoolean("notify", true)
      await h.submit()
      expect(await h.submittedValues()).toEqual({ notify: true })
    })
  })
})
