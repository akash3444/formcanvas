import { test, expect } from "@playwright/test"
import { Harness } from "../helpers/harness"
import { input, oneField } from "../helpers/fields"

/**
 * Input field — every setting tested in isolation against the REAL generated
 * code. The text input is the baseline; input-type variants (number, email,
 * url) and their type-specific validation get their own groups at the bottom.
 */
test.describe("input field (text)", () => {
  test.describe("label", () => {
    test("renders the configured label, tied to the control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Full Name")))

      await h.expectLabel("Full Name")
      await expect(page.locator('label[for="fullName"]')).toBeVisible()
    })

    test("falls back to 'Field' when the label is empty", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "")))
      await h.expectLabel("Field")
    })
  })

  test.describe("placeholder", () => {
    test("shows the placeholder when set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Name", { placeholder: "Ada Lovelace" })))
      await h.expectPlaceholder("fullName", "Ada Lovelace")
    })

    test("has an empty placeholder when not set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Name")))
      await h.expectPlaceholder("fullName", "")
    })
  })

  test.describe("description", () => {
    test("renders the description text", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Name", { description: "As on your ID" })))
      await h.expectDescription("As on your ID")
    })

    test("is hidden when no description is set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Name")))
      await expect(h.form().locator('[data-slot="field-description"]')).toHaveCount(0)
    })

    test("renders ABOVE the control when position is above-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          input("fullName", "Name", {
            description: "Above",
            descriptionPosition: "above-control",
          })
        )
      )
      expect(await h.descriptionIsAbove("#fullName")).toBe(true)
    })

    test("renders BELOW the control when position is below-control", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          input("fullName", "Name", {
            description: "Below",
            descriptionPosition: "below-control",
          })
        )
      )
      expect(await h.descriptionIsAbove("#fullName")).toBe(false)
    })
  })

  test.describe("default value", () => {
    test("prefills the control and submits the default", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Name", { defaultValue: "Grace Hopper" })))

      expect(await h.inputValue("fullName")).toBe("Grace Hopper")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ fullName: "Grace Hopper" })
    })

    test("starts empty when no default is set", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Name")))
      expect(await h.inputValue("fullName")).toBe("")
    })
  })

  test.describe("required", () => {
    test("shows an asterisk when required", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Name", { required: true })))
      await h.expectRequiredMark(true)
    })

    test("shows NO asterisk when optional", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Name", { required: false })))
      await h.expectRequiredMark(false)
    })

    test("blocks submit with an error when required and empty", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Name", { required: true })))

      await h.submit()
      await h.expectError("This field is required")
      await h.expectNoSubmit()
    })

    test("submits when required and filled", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Name", { required: true })))

      await h.text("fullName", "Ada")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ fullName: "Ada" })
    })

    test("optional field submits when left empty", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("fullName", "Name", { required: false })))

      await h.submit()
      expect(await h.submittedValues()).toEqual({ fullName: "" })
    })
  })

  test.describe("min/max length validation", () => {
    test("no min/max: any length is accepted", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("code", "Code")))

      await h.text("code", "x")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ code: "x" })
    })

    test("only minLength: rejects too short, accepts at the boundary", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(input("code", "Code", { required: true, validation: { minLength: 5 } }))
      )

      await h.text("code", "abc")
      await h.submit()
      await h.expectError("Must be at least 5 characters")
      await h.expectNoSubmit()

      await h.text("code", "abcde")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ code: "abcde" })
    })

    test("only maxLength: rejects too long, accepts at the boundary", async ({ page }) => {
      const h = new Harness(page)
      await h.render(oneField(input("code", "Code", { validation: { maxLength: 5 } })))

      await h.text("code", "abcdef")
      await h.submit()
      await h.expectError("Must be at most 5 characters")
      await h.expectNoSubmit()

      await h.text("code", "abcde")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ code: "abcde" })
    })

    test("both min and max: rejects below min, rejects above max, accepts within", async ({
      page,
    }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          input("code", "Code", { required: true, validation: { minLength: 3, maxLength: 6 } })
        )
      )

      await h.text("code", "ab")
      await h.submit()
      await h.expectError("Must be at least 3 characters")
      await h.expectNoSubmit()

      await h.text("code", "abcdefg")
      await h.submit()
      await h.expectError("Must be at most 6 characters")
      await h.expectNoSubmit()

      await h.text("code", "abcd")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ code: "abcd" })
    })
  })
})

test.describe("input field (number)", () => {
  test("submits a real number (not a string)", async ({ page }) => {
    const h = new Harness(page)
    await h.render(oneField(input("age", "Age", { inputType: "number" })))

    await h.text("age", "42")
    await h.submit()
    const values = await h.submittedValues<{ age: number }>()
    expect(values).toEqual({ age: 42 })
    expect(typeof values.age).toBe("number")
  })

  test("required number blocks submit when empty", async ({ page }) => {
    const h = new Harness(page)
    await h.render(oneField(input("age", "Age", { inputType: "number", required: true })))

    await h.submit()
    await h.expectError("This field is required")
    await h.expectNoSubmit()
  })

  test.describe("min/max value validation", () => {
    test("only min: rejects below, accepts at boundary", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          input("age", "Age", { inputType: "number", required: true, validation: { min: 18 } })
        )
      )

      await h.text("age", "5")
      await h.submit()
      await h.expectError("Must be at least 18")
      await h.expectNoSubmit()

      await h.text("age", "18")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ age: 18 })
    })

    test("only max: rejects above, accepts at boundary", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          input("age", "Age", { inputType: "number", required: true, validation: { max: 99 } })
        )
      )

      await h.text("age", "120")
      await h.submit()
      await h.expectError("Must be at most 99")
      await h.expectNoSubmit()

      await h.text("age", "99")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ age: 99 })
    })

    test("both min and max: rejects below, rejects above, accepts within", async ({ page }) => {
      const h = new Harness(page)
      await h.render(
        oneField(
          input("age", "Age", {
            inputType: "number",
            required: true,
            validation: { min: 18, max: 99 },
          })
        )
      )

      await h.text("age", "5")
      await h.submit()
      await h.expectError("Must be at least 18")
      await h.expectNoSubmit()

      await h.text("age", "200")
      await h.submit()
      await h.expectError("Must be at most 99")
      await h.expectNoSubmit()

      await h.text("age", "42")
      await h.submit()
      expect(await h.submittedValues()).toEqual({ age: 42 })
    })
  })
})

test.describe("input field (typed variants)", () => {
  test("email sets type=email and submits a valid address", async ({ page }) => {
    const h = new Harness(page)
    await h.render(oneField(input("email", "Email", { inputType: "email", required: true })))

    await expect(page.locator("#email")).toHaveAttribute("type", "email")
    await h.text("email", "ada@example.com")
    await h.submit()
    expect(await h.submittedValues()).toEqual({ email: "ada@example.com" })
  })

  test("url sets type=url and submits a valid URL", async ({ page }) => {
    const h = new Harness(page)
    await h.render(oneField(input("site", "Website", { inputType: "url", required: true })))

    await expect(page.locator("#site")).toHaveAttribute("type", "url")
    await h.text("site", "https://example.com")
    await h.submit()
    expect(await h.submittedValues()).toEqual({ site: "https://example.com" })
  })

  test("password sets type=password", async ({ page }) => {
    const h = new Harness(page)
    await h.render(oneField(input("pw", "Password", { inputType: "password" })))
    await expect(page.locator("#pw")).toHaveAttribute("type", "password")
  })

  test("tel sets type=tel", async ({ page }) => {
    const h = new Harness(page)
    await h.render(oneField(input("phone", "Phone", { inputType: "tel" })))
    await expect(page.locator("#phone")).toHaveAttribute("type", "tel")
  })
})
