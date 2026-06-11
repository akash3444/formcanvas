import type {
  InputField,
  TextareaField,
  CheckboxField,
  SwitchField,
  SelectField,
  RadioGroupField,
  CheckboxGroupField,
  SliderField,
} from '../lib/form-builder/types'

const base = {
  id: 'id-1',
  placeholder: '',
  description: '',
  descriptionPosition: 'below-control' as const,
  required: false,
  disabled: false,
}

export const makeInput = (o: Partial<InputField> = {}): InputField => ({
  ...base,
  type: 'input',
  label: 'Name',
  name: 'name',
  inputType: 'text',
  ...o,
})

export const makeTextarea = (o: Partial<TextareaField> = {}): TextareaField => ({
  ...base,
  type: 'textarea',
  label: 'Bio',
  name: 'bio',
  rows: 3,
  ...o,
})

export const makeCheckbox = (o: Partial<CheckboxField> = {}): CheckboxField => ({
  ...base,
  type: 'checkbox',
  label: 'Accept Terms',
  name: 'acceptTerms',
  ...o,
})

export const makeSwitch = (o: Partial<SwitchField> = {}): SwitchField => ({
  ...base,
  type: 'switch',
  label: 'Notifications',
  name: 'notifications',
  ...o,
})

export const makeSelect = (o: Partial<SelectField> = {}): SelectField => ({
  ...base,
  type: 'select',
  label: 'Country',
  name: 'country',
  options: [
    { id: 'opt-1', label: 'USA', value: 'usa' },
    { id: 'opt-2', label: 'UK', value: 'uk' },
  ],
  ...o,
})

export const makeRadioGroup = (o: Partial<RadioGroupField> = {}): RadioGroupField => ({
  ...base,
  type: 'radio-group',
  label: 'Gender',
  name: 'gender',
  orientation: 'vertical' as const,
  options: [
    { id: 'opt-1', label: 'Male', value: 'male' },
    { id: 'opt-2', label: 'Female', value: 'female' },
  ],
  ...o,
})

export const makeCheckboxGroup = (
  o: Partial<CheckboxGroupField> = {}
): CheckboxGroupField => ({
  ...base,
  type: 'checkbox-group',
  label: 'Interests',
  name: 'interests',
  orientation: 'vertical' as const,
  options: [
    { id: 'opt-1', label: 'Sports', value: 'sports' },
    { id: 'opt-2', label: 'Music', value: 'music' },
  ],
  ...o,
})

export const makeSlider = (o: Partial<SliderField> = {}): SliderField => ({
  ...base,
  type: 'slider',
  label: 'Volume',
  name: 'volume',
  min: 0,
  max: 100,
  step: 1,
  defaultValue: 50,
  ...o,
})
