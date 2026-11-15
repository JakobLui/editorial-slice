import type { ContentItemSummary } from '@/api/generated/model'
import { Deadline } from '@/components/content/deadline'
import { AuthorAvatars } from '@/components/content/people'
import { TypeBadge } from '@/components/content/type-badge'
import { Card, CardContent } from '@/components/ui/card'
import { useOpenItem } from '@/hooks/use-open-item'

/**
 * One item on the In progress overview: type, title and authors, then the
 * deadline. No status (the column shows it) and no creator (it's in the
 * details). Opens the item read-only, brief included.
 */
export function ItemCard({ item }: { item: ContentItemSummary }) {
  const openItem = useOpenItem()
  const open = () => openItem(item.id, { readOnly: true })

  return (
    <Card
      size="sm"
      className="cursor-pointer transition-colors hover:bg-muted/40"
      onClick={open}
    >
      <CardContent className="flex flex-col gap-1.5">
        <div className="flex items-start gap-2">
          <TypeBadge type={item.type} className="mt-px" />
          {/* The keyboard target; the card handles mouse clicks. */}
          <button
            type="button"
            // Two lines at most, so cards stay even; the full title is on hover and in the details.
            title={item.title}
            className="line-clamp-2 flex-1 cursor-pointer rounded-sm text-left leading-snug font-medium outline-offset-2"
            onClick={(event) => {
              event.stopPropagation()
              open()
            }}
          >
            {item.title}
          </button>
          <AuthorAvatars authors={item.authors} showEmpty={false} />
        </div>

        <div className="flex justify-end">
          <Deadline deadline={item.deadline} status={item.status} />
        </div>
      </CardContent>
    </Card>
  )
}
