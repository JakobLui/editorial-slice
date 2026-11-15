import type { ContentItemSummary } from '@/api/generated/model'
import { Deadline } from '@/components/content/deadline'
import { AuthorAvatars } from '@/components/content/people'
import { TypeBadge } from '@/components/content/type-badge'
import { Card, CardContent } from '@/components/ui/card'
import { useOpenItem } from '@/hooks/use-open-item'

/**
 * One item on the In progress overview. The title comes first and gets the
 * full width; type, deadline and authors share one quiet row below it. No
 * status (the column shows it) and no creator (it's in the details). Opens
 * the item read-only, brief included.
 */
export function ItemCard({ item }: { item: ContentItemSummary }) {
  const openItem = useOpenItem()
  const open = () => openItem(item.id, { readOnly: true })

  return (
    <Card
      size="sm"
      // The whole card is the click target; it lifts on hover and shows the
      // focus ring of the title button inside it.
      className="relative transition-shadow hover:shadow-md has-focus-visible:ring-3 has-focus-visible:ring-ring/50"
    >
      <CardContent className="flex flex-col gap-2.5">
        {/*
          One button per card, named by the title. Its ::after stretches over
          the card, so a click anywhere opens the item without nesting the
          rest of the card inside the button.
        */}
        <button
          type="button"
          // Two lines at most, so cards stay even; the full title is on hover and in the details.
          title={item.title}
          className="line-clamp-2 cursor-pointer text-left leading-snug font-medium outline-none after:absolute after:inset-0 after:rounded-[inherit]"
          onClick={open}
        >
          {item.title}
        </button>

        <div className="flex items-center gap-2">
          <TypeBadge type={item.type} />
          {item.deadline && (
            <Deadline deadline={item.deadline} status={item.status} />
          )}
          {/*
            Above the stretched button, so the names still show on hover.
            A click opens the item too, so the card has no dead spot; the
            keyboard uses the title button.
          */}
          <div className="relative ml-auto cursor-pointer" onClick={open}>
            <AuthorAvatars authors={item.authors} showEmpty={false} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
