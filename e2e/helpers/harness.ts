import { expect, type Page } from "@playwright/test"
import type { FormField } from "../../lib/form-builder/types"

export interface FormConfig {
  formName: string
  submitLabel: string
  fields: FormField[]
}

/**
 * Page object for the test-only `/__form-harness__` route. It generates form
 * code with the app's real generator, renders it live, and exposes helpers to
 * drive the rendered controls and read the submitted payload.
 */
export class Harness {
  constructor(private readonly page: Page) {}

  /** Generate code for `config` via the real generator and render it. */
  async render(config: FormConfig) {
    const page = this.page
    await page.goto("/form-harness")
    await page.waitForFunction(() => (window as Win).__harnessReady === true)
    await page.evaluate((cfg) => (window as Win).__renderConfig!(cfg), config)
    await this.assertCompiled()
  }

  private async assertCompiled() {
    // Surface compile/render errors with their actual message.
    const err = this.page.getByTestId("harness-error")
    if (await err.count()) {
      const text = await err.textContent()
      throw new Error(`Harness failed to render generated code: ${text}`)
    }
    await expect(this.page.locator('[data-testid="form-container"] form')).toBeVisible()
  }

  // --- control drivers (keyed by field `name`, which is the control's id) ---

  text(name: string, value: string) {
    return this.page.locator(`#${name}`).fill(value)
  }

  // base-ui checkbox/switch render the id on a hidden native input (which
  // mirrors checked state) and the visible control as a sibling element. The
  // associated <label for="name"> is the faithful click target.
  async setBoolean(name: string, checked: boolean) {
    const input = this.page.locator(`#${name}`)
    const isChecked = await input.isChecked()
    if (isChecked !== checked) await this.page.locator(`label[for="${name}"]`).click()
  }

  async selectOption(name: string, optionLabel: string) {
    await this.page.locator(`#${name}`).click()
    await this.page.getByRole("option", { name: optionLabel, exact: true }).click()
  }

  radio(name: string, value: string) {
    return this.page.locator(`label[for="${name}-${value}"]`).click()
  }

  toggleGroupOption(name: string, value: string) {
    return this.page.locator(`label[for="${name}-${value}"]`).click()
  }

  /** The form's submit button. */
  submit() {
    return this.page.locator('[data-testid="form-container"] button[type="submit"]').click()
  }

  // --- assertions / reads ---

  /** Wait for a successful submit and return the captured (typed) payload. */
  async submittedValues<T = Record<string, unknown>>(): Promise<T> {
    await this.page.waitForFunction(
      () => (window as Win).__lastSubmit !== undefined
    )
    return this.page.evaluate(() => (window as Win).__lastSubmit as T)
  }

  /** Assert the form did NOT submit (validation blocked it). */
  async expectNoSubmit() {
    const value = await this.page.evaluate(() => (window as Win).__lastSubmit)
    expect(value, "form should not have submitted").toBeUndefined()
  }

  expectError(message: string | RegExp) {
    // Scope to the rendered form: the hidden generated-code <pre> also contains
    // these zod message strings as source text.
    return expect(
      this.page
        .locator('[data-testid="form-container"]')
        .getByText(message)
        .first(),
      `expected validation error: ${message}`
    ).toBeVisible()
  }

  // --- per-setting assertion helpers (used by the per-field setting specs) ---

  /** The rendered form root (scopes locators away from any sibling panels). */
  form() {
    return this.page.locator('[data-testid="form-container"]')
  }

  /** Assert a `<FieldLabel>`/`<FieldLegend>` with this text is visible. */
  expectLabel(text: string) {
    return expect(
      this.form()
        .locator('[data-slot="field-label"], [data-slot="field-legend"]')
        .filter({ hasText: text })
        .first()
    ).toBeVisible()
  }

  /** Assert the required asterisk is (or is not) present. */
  async expectRequiredMark(present: boolean) {
    const star = this.form().locator("span.text-destructive", { hasText: "*" })
    if (present) await expect(star.first()).toBeVisible()
    else await expect(star).toHaveCount(0)
  }

  /** Assert a control's `placeholder` attribute. */
  expectPlaceholder(name: string, text: string) {
    return expect(this.page.locator(`#${name}`)).toHaveAttribute("placeholder", text)
  }

  /** Assert a `<FieldDescription>` with this text is visible. */
  expectDescription(text: string) {
    return expect(
      this.form().locator('[data-slot="field-description"]', { hasText: text })
    ).toBeVisible()
  }

  /**
   * Resolve whether the field description renders visually ABOVE the given
   * control (true) or below it (false). Uses on-screen geometry, which is what
   * "description position" actually means to a user.
   */
  async descriptionIsAbove(controlSelector: string): Promise<boolean> {
    const desc = await this.form()
      .locator('[data-slot="field-description"]')
      .first()
      .boundingBox()
    const ctrl = await this.page.locator(controlSelector).first().boundingBox()
    if (!desc || !ctrl) throw new Error("description-position: missing bounding box")
    return desc.y < ctrl.y
  }

  /** Read a text/number control's current value. */
  inputValue(name: string) {
    return this.page.locator(`#${name}`).inputValue()
  }

  /** Read a checkbox/switch checked state. */
  isChecked(name: string) {
    return this.page.locator(`#${name}`).isChecked()
  }

  /** The visible text of a select trigger. */
  selectTriggerText(name: string) {
    return this.page.locator(`#${name}`).textContent()
  }

  /**
   * Resolve whether two options of a radio/checkbox group are laid out
   * horizontally (side by side) or vertically (stacked), from on-screen
   * geometry. This is what the `orientation` setting controls.
   */
  async optionsLayout(
    name: string,
    v1: string,
    v2: string
  ): Promise<"horizontal" | "vertical"> {
    const a = await this.page.locator(`label[for="${name}-${v1}"]`).boundingBox()
    const b = await this.page.locator(`label[for="${name}-${v2}"]`).boundingBox()
    if (!a || !b) throw new Error("options-layout: missing bounding box")
    return b.y > a.y + a.height / 2 ? "vertical" : "horizontal"
  }
}

type Win = Window & {
  __harnessReady?: boolean
  __renderConfig?: (config: FormConfig) => Promise<void>
  __lastSubmit?: unknown
}
