import { Check, ChevronDown, PlusCircle } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export interface FilterOption {
  value: string
  label: string
  /** Shown before the label: a status dot, a type icon, an avatar. */
  leading?: ReactNode
}

/**
 * One filter as a button that opens a searchable list. Empty, it is a quiet
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
  options: FilterOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  /** False for a single choice (picking another value replaces it). */
  multiple?: boolean
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
        <Command>
          <CommandInput
            placeholder={searchPlaceholder ?? `Search ${label.toLowerCase()}`}
          />
          <CommandList>
            <CommandEmpty>No matches.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => {
                const isSelected = selected.includes(option.value)

                return (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => toggle(option.value)}
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
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
