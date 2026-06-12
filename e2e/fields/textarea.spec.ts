import { test, expect } from "@playwright/test"
import { Harness } from "../helpers/harness"
import { oneField, textarea } from "../helpers/fields"

/**
 * Textarea field — every setting tested in isolation against the REAL generated
 * code. One field per scenario, so the setting under test is the only variable.
 */
test.describe("textarea field", () => {
  test.describe("label", () => {
    test("renders the configured label, tied to the control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Your biography")))

      await h.expectLabel("Your biography")
      // The label points at the control it labels.
      await expect(page.locator('label[for="bio"]')).toBeVisible()
    })

    test("falls back to 'Field' when the label is empty", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "")))
      await h.expectLabel("Field")
    })
  })

  test.describe("placeholder", () => {
    test("shows the placeholder when set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio", { placeholder: "Tell us about yourself" })))
      await h.expectPlaceholder("bio", "Tell us about yourself")
    })

    test("has an empty placeholder when not set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio")))
      await h.expectPlaceholder("bio", "")
    })
  })

  test.describe("description", () => {
    test("renders the description text", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio", { description: "Max 500 chars" })))
      await h.expectDescription("Max 500 chars")
    })

    test("is hidden when no description is set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio")))
      await expect(h.form().locator('[data-slot="field-description"]')).toHaveCount(0)
    })

    test("renders ABOVE the control when position is above-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          textarea("bio", "Bio", {
            description: "Above the box",
            descriptionPosition: "above-control",
          })
        )
      )
      expect(await h.descriptionIsAbove("#bio")).toBe(true)
    })

    test("renders BELOW the control when position is below-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          textarea("bio", "Bio", {
            description: "Below the box",
            descriptionPosition: "below-control",
          })
        )
      )
      expect(await h.descriptionIsAbove("#bio")).toBe(false)
    })
  })

  test.describe("default value", () => {
    test("prefills the control and submits the default", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio", { defaultValue: "prefilled text" })))

      expect(await h.inputValue("bio")).toBe("prefilled text")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ bio: "prefilled text" })
    })

    test("starts empty when no default is set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio")))
      expect(await h.inputValue("bio")).toBe("")
    })
  })

  test.describe("required", () => {
    test("shows an asterisk when required", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio", { required: true })))
      await h.expectRequiredMark(true)
    })

    test("shows NO asterisk when optional", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio", { required: false })))
      await h.expectRequiredMark(false)
    })

    test("blocks submit with an error when required and empty", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio", { required: true })))

      await h.submit()
      await h.expectError("This field is required")
      await h.expectNoSubmit()
    })

    test("submits when required and filled", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio", { required: true })))

      await h.text("bio", "Some content")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ bio: "Some content" })
    })

    test("optional field submits when left empty", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio", { required: false })))

      await h.submit()
      expect(await h.submittedValues()).toEqual({ bio: "" })
    })
  })

  test.describe("min/max length validation", () => {
    test("no min/max: any length is accepted", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio")))

      await h.text("bio", "x")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ bio: "x" })
    })

    test("only minLength: rejects too short, accepts at the boundary", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(textarea("bio", "Bio", { required: true, validation: { minLength: 5 } }))
      )

      await h.text("bio", "abc") // 3 < 5
      await h.submit()
      await h.expectError("Must be at least 5 characters")
      await h.expectNoSubmit()

      await h.text("bio", "abcde") // exactly 5
      await h.submit()
      expect(await h.submittedValues()).toEqual({ bio: "abcde" })
    })

    test("only maxLength: rejects too long, accepts at the boundary", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(textarea("bio", "Bio", { validation: { maxLength: 5 } })))

      await h.text("bio", "abcdef") // 6 > 5
      await h.submit()
      await h.expectError("Must be at most 5 characters")
      await h.expectNoSubmit()

      await h.text("bio", "abcde") // exactly 5
      await h.submit()
      expect(await h.submittedValues()).toEqual({ bio: "abcde" })
    })

    test("both min and max: rejects below min, rejects above max, accepts within", async ({
      page,
    }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          textarea("bio", "Bio", { required: true, validation: { minLength: 3, maxLength: 6 } })
        )
      )

      await h.text("bio", "ab") // below min
      await h.submit()
      await h.expectError("Must be at least 3 characters")
      await h.expectNoSubmit()

      await h.text("bio", "abcdefg") // above max
      await h.submit()
      await h.expectError("Must be at most 6 characters")
      await h.expectNoSubmit()

      await h.text("bio", "abcd") // within [3, 6]
      await h.submit()
      expect(await h.submittedValues()).toEqual({ bio: "abcd" })
    })

    test("optional with minLength: empty is allowed, but a short non-empty value is rejected", async ({
      page,
    }) => {
      // The generator emits a refine so an OPTIONAL min-length field still allows
      // an empty submit while enforcing the floor once the user types something.
      const h = new Harness(page)
      await h.render(
        oneField(textarea("bio", "Bio", { required: false, validation: { minLength: 4 } }))
      )

      await h.submit() // empty -> allowed
      expect(await h.submittedValues()).toEqual({ bio: "" })

      await h.render(
        oneField(textarea("bio", "Bio", { required: false, validation: { minLength: 4 } }))
      )
      await h.text("bio", "ab") // non-empty but short -> rejected
      await h.submit()
      await h.expectError("Must be at least 4 characters")
      await h.expectNoSubmit()
    })
  })
})
