import { format, parseISO } from 'date-fns'
import { CalendarDays, X } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatDate } from '@/lib/content'

/**
 * An optional deadline: a button that opens a calendar, and an × to clear it.
 * The value is a 'YYYY-MM-DD' string, or '' for no deadline.
 */
export function DeadlinePicker({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedDate = value ? parseISO(value) : undefined

  const pick = (date: Date) => {
    onChange(format(date, 'yyyy-MM-dd'))
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger
          render={
            <Button
              variant="outline"
              aria-label={`Deadline: ${value ? formatDate(value) : 'none'}`}
              className="w-full justify-start pr-8 font-normal"
            />
          }
        >
          <CalendarDays className="text-muted-foreground" />
          {value ? (
            formatDate(value)
          ) : (
            <span className="text-muted-foreground">No deadline</span>
          )}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          {/* `required`: clicking the chosen day again keeps it; × clears. */}
          <Calendar
            mode="single"
            required
            selected={selectedDate}
            defaultMonth={selectedDate}
            onSelect={pick}
            weekStartsOn={1}
          />
        </PopoverContent>
      </Popover>

      {/* Outside the trigger: a button can't sit inside another button. */}
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Clear deadline"
          className="absolute top-1/2 right-1 -translate-y-1/2 text-muted-foreground"
          onClick={() => onChange('')}
        >
          <X />
        </Button>
      )}
    </div>
  )
}
