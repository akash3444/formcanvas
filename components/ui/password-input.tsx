"use client"

import * as React from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"

import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"

type PasswordInputProps = React.ComponentProps<"input"> & {
  /** Render a show/hide visibility toggle inside the input. Defaults to true. */
  showToggle?: boolean
}

function PasswordInput({ showToggle = true, ...props }: PasswordInputProps) {
  const [show, setShow] = React.useState(false)

  if (!showToggle) {
    return <Input type="password" {...props} />
  }

  return (
    <InputGroup>
      <InputGroupInput type={show ? "text" : "password"} {...props} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-xs"
          aria-label={show ? "Hide password" : "Show password"}
          onClick={() => setShow((prev) => !prev)}
        >
          {show ? <EyeOffIcon /> : <EyeIcon />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}

export { PasswordInput }
