import { ChevronDown } from 'lucide-react'
import { OptionList } from '@/components/content/option-list'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAuthorOptions } from '@/hooks/use-author-options'

/**
 * Pick authors from all users, like the Author filter: searchable, with
 * avatars, and open until the user is done. `onChange` gets the full list.
 */
export function AuthorsPicker({
  authorIds,
  onChange,
}: {
  authorIds: string[]
  onChange: (authorIds: string[]) => void
}) {
  const authorOptions = useAuthorOptions()
  const selectedOptions = authorOptions.filter((option) =>
    authorIds.includes(option.value),
  )

  const toggleAuthor = (userId: string) =>
    onChange(
      authorIds.includes(userId)
        ? authorIds.filter((authorId) => authorId !== userId)
        : [...authorIds, userId],
    )

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            aria-label={`Authors: ${selectedOptions.map((option) => option.label).join(', ') || 'none'}`}
            className="h-auto min-h-8 w-full flex-wrap justify-start py-1 font-normal"
          />
        }
      >
        {selectedOptions.length === 0 ? (
          <span className="text-muted-foreground">No authors</span>
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
        <ChevronDown className="ml-auto opacity-50" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0">
        <OptionList
          options={authorOptions}
          selected={authorIds}
          onToggle={toggleAuthor}
          multiple
          searchPlaceholder="Search people"
        />
      </PopoverContent>
    </Popover>
  )
}
