import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import type { PickerOption } from '@/lib/content-options'
import { cn } from '@/lib/utils'

/**
 * The list inside a filter or picker popover. Several choices get checkboxes;
 * a single choice gets a check mark. Search only for long lists (people): the
 * four statuses and types are quicker to scan than to type.
 */
export function OptionList({
  options,
  selected,
  onToggle,
  multiple,
  searchPlaceholder,
  children,
}: {
  options: PickerOption[]
  selected: string[]
  onToggle: (value: string) => void
  multiple: boolean
  /** Shows a search field when set. */
  searchPlaceholder?: string
  /** Extra groups below the options, e.g. "Clear". */
  children?: ReactNode
}) {
  return (
    // Focusable without a search field, so the arrow keys work at once.
    <Command
      // The keyboard highlight starts on the current value, not the first row.
      defaultValue={
        options.find((option) => selected.includes(option.value))?.label
      }
      tabIndex={searchPlaceholder ? undefined : 0}
      className="outline-none"
    >
      {searchPlaceholder && <CommandInput placeholder={searchPlaceholder} />}
      <CommandList>
        {searchPlaceholder && <CommandEmpty>No matches.</CommandEmpty>}
        <CommandGroup>
          {options.map((option) => {
            const isSelected = selected.includes(option.value)

            return (
              <CommandItem
                key={option.value}
                value={option.label}
                onSelect={() => onToggle(option.value)}
              >
                {multiple && (
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center rounded-sm border',
                      isSelected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-input',
                    )}
                  >
                    {isSelected && (
                      <Check className="size-3 text-primary-foreground!" />
                    )}
                  </span>
                )}
                {option.leading}
                <span className="flex-1 truncate">{option.label}</span>
                {!multiple && isSelected && <Check className="size-4" />}
              </CommandItem>
            )
          })}
        </CommandGroup>
        {children}
      </CommandList>
    </Command>
  )
}
