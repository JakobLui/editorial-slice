import { ChevronDown, PlusCircle } from 'lucide-react'
import { OptionList } from '@/components/content/option-list'
import { Button } from '@/components/ui/button'
import {
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import type { PickerOption } from '@/lib/content-options'
import { cn } from '@/lib/utils'

/**
 * One filter as a button that opens a list. Empty, it is a quiet
 * dashed "+ Status" button; with a selection it shows the chosen values, so
 * the active filters can be read at a glance.
 */
export function FacetedFilter({
  label,
  options,
  selected,
  onChange,
  multiple = true,
  searchPlaceholder,
}: {
  label: string
  options: PickerOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  /** False for a single choice (picking another value replaces it). */
  multiple?: boolean
  /** Shows a search field; only worth it for long lists such as people. */
  searchPlaceholder?: string
}) {
  const selectedOptions = options.filter((option) =>
    selected.includes(option.value),
  )

  const toggle = (value: string) => {
    if (!multiple) {
      onChange(selected.includes(value) ? [] : [value])
      return
    }
    onChange(
      selected.includes(value)
        ? selected.filter((selectedValue) => selectedValue !== value)
        : [...selected, value],
    )
  }

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            className={cn(
              selected.length === 0 && 'border-dashed text-muted-foreground',
            )}
          />
        }
      >
        {selected.length === 0 ? <PlusCircle /> : null}
        {label}
        {selectedOptions.length > 0 && (
          <>
            <Separator orientation="vertical" className="mx-0.5 h-4" />
            {selectedOptions.length > 2 ? (
              <span className="rounded-md bg-secondary px-1.5 text-xs font-medium">
                {selectedOptions.length} selected
              </span>
            ) : (
              selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 rounded-md bg-secondary px-1.5 text-xs font-medium"
                >
                  {option.leading}
                  {option.label}
                </span>
              ))
            )}
          </>
        )}
        <ChevronDown className="opacity-50" />
      </PopoverTrigger>

      <PopoverContent align="start" className="w-60 p-0">
        <OptionList
          options={options}
          selected={selected}
          onToggle={toggle}
          multiple={multiple}
          searchPlaceholder={searchPlaceholder}
        >
          {selected.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => onChange([])}
                  className="justify-center"
                >
                  Clear {label.toLowerCase()}
                </CommandItem>
              </CommandGroup>
            </>
          )}
        </OptionList>
      </PopoverContent>
    </Popover>
  )
}
