import { test, expect } from "@playwright/test"
import { Harness } from "../helpers/harness"
import { checkboxGroup, oneField } from "../helpers/fields"

const TOPICS: [string, string][] = [
  ["Tech", "tech"],
  ["Design", "design"],
  ["Business", "business"],
]

/**
 * Checkbox group — multiple choice (an array of values). Applicable settings:
 * label (legend), description + position, default value, required, and
 * orientation. (No placeholder, no min/max length.)
 */
test.describe("checkbox-group field", () => {
  test.describe("label", () => {
    test("renders the configured legend label", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkboxGroup("topics", "Interests", TOPICS)))
      await h.expectLabel("Interests")
    })
  })

  test.describe("description", () => {
    test("renders the description text", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(checkboxGroup("topics", "Topics", TOPICS, { description: "Choose any" }))
      )
      await h.expectDescription("Choose any")
    })

    test("renders ABOVE the control when position is above-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          checkboxGroup("topics", "Topics", TOPICS, {
            description: "Above",
            descriptionPosition: "above-control",
          })
        )
      )
      expect(await h.descriptionIsAbove('label[for="topics-tech"]')).toBe(true)
    })

    test("renders BELOW the control when position is below-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          checkboxGroup("topics", "Topics", TOPICS, {
            description: "Below",
            descriptionPosition: "below-control",
          })
        )
      )
      expect(await h.descriptionIsAbove('label[for="topics-tech"]')).toBe(false)
    })
  })

  test.describe("default value", () => {
    test("prechecks the default options and submits them as an array", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(checkboxGroup("topics", "Topics", TOPICS, { defaultValue: ["tech", "business"] }))
      )

      expect(await h.isChecked("topics-tech")).toBe(true)
      expect(await h.isChecked("topics-business")).toBe(true)
      expect(await h.isChecked("topics-design")).toBe(false)

      await h.submit()
      const values = await h.submittedValues<{ topics: string[] }>()
      expect(values).toEqual({ topics: ["tech", "business"] })
      expect(Array.isArray(values.topics)).toBe(true)
    })

    test("starts empty and submits [] by default", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkboxGroup("topics", "Topics", TOPICS)))

      await h.submit()
      expect(await h.submittedValues()).toEqual({ topics: [] })
    })
  })

  test.describe("orientation", () => {
    test("lays options out vertically by default", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkboxGroup("topics", "Topics", TOPICS, { orientation: "vertical" })))
      expect(await h.optionsLayout("topics", "tech", "design")).toBe("vertical")
    })

    test("lays options out horizontally when set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(checkboxGroup("topics", "Topics", TOPICS, { orientation: "horizontal" }))
      )
      expect(await h.optionsLayout("topics", "tech", "design")).toBe("horizontal")
    })
  })

  test.describe("required", () => {
    test("shows an asterisk when required", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkboxGroup("topics", "Topics", TOPICS, { required: true })))
      await h.expectRequiredMark(true)
    })

    test("shows NO asterisk when optional", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkboxGroup("topics", "Topics", TOPICS, { required: false })))
      await h.expectRequiredMark(false)
    })

    test("blocks submit with an error when required and nothing checked", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkboxGroup("topics", "Topics", TOPICS, { required: true })))

      await h.submit()
      await h.expectError("Select at least one option")
      await h.expectNoSubmit()
    })

    test("submits when required and at least one option is checked", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(checkboxGroup("topics", "Topics", TOPICS, { required: true })))

      await h.toggleGroupOption("topics", "design")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ topics: ["design"] })
    })
  })
})
