import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { OptionList } from '@/components/content/option-list'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { PickerOption } from '@/lib/content-options'

/**
 * A required single choice in a form (status, type). The button shows the
 * current value the way the filters show it; the list closes on a pick.
 */
export function OptionPicker({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: PickerOption[]
  value: string
  onChange: (value: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((option) => option.value === value)

  const pick = (pickedValue: string) => {
    onChange(pickedValue)
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            aria-label={`${label}: ${selectedOption?.label ?? 'none'}`}
            className="w-full justify-start font-normal"
          />
        }
      >
        {selectedOption?.leading}
        <span className="truncate">{selectedOption?.label}</span>
        <ChevronDown className="ml-auto opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width) min-w-44 p-0">
        <OptionList
          options={options}
          selected={[value]}
          onToggle={pick}
          multiple={false}
        />
      </PopoverContent>
    </Popover>
  )
}
