import { useForm, useStore } from '@tanstack/react-form'
import { Archive, ArchiveRestore, ExternalLink, UserMinus } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import {
  useArchiveContent,
  useGetContent,
  useRestoreContent,
  useUpdateContent,
  useUpdateContentStatus,
} from '@/api/generated/content/content'
import type {
  Brief,
  ContentItem,
  ContentStatus,
  ContentType,
  UpdateContent,
} from '@/api/generated/model'
import { useGetMe } from '@/api/generated/users/users'
import { AuthorsPicker } from '@/components/content/authors-picker'
import { BriefEditor } from '@/components/content/brief-editor'
import { Deadline } from '@/components/content/deadline'
import { StatusBadge } from '@/components/content/status-badge'
import { TypeBadge } from '@/components/content/type-badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { UserAvatar } from '@/components/user-avatar'
import {
  CONTENT_TYPES,
  formatDate,
  STATUS_LABELS,
  TYPE_LABELS,
  WORK_STATUSES,
} from '@/lib/content'

/**
 * One content item, in a modal at /items/:id over the page it was opened
 * from. Edits stay in the form until "Save changes"; closing with unsaved
 * changes asks first. What the user may change comes from `allowed`.
 * Publishing happens from the Content list, not here.
 */
export function ItemDialog() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const item = useGetContent(id)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false)

  // Back to the page behind the modal, or to the Dashboard after a direct link.
  const close = () =>
    location.state?.backgroundLocation ? navigate(-1) : navigate('/')

  const requestClose = () =>
    hasUnsavedChanges ? setIsConfirmingDiscard(true) : close()

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && requestClose()}>
        <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-2xl">
          {item.isPending && (
            <div className="flex flex-col gap-3">
              <DialogTitle className="sr-only">Loading item</DialogTitle>
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-40 w-full" />
            </div>
          )}

          {item.isError && (
            <>
              <DialogTitle>Item not available</DialogTitle>
              <DialogDescription>
                It doesn't exist, or you don't have access to it.
              </DialogDescription>
            </>
          )}

          {item.data && (
            <ItemForm
              key={item.data.id}
              item={item.data}
              readOnly={location.state?.readOnly === true}
              onUnsavedChange={setHasUnsavedChanges}
              onCancel={requestClose}
              onDone={close}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={isConfirmingDiscard}
        onOpenChange={setIsConfirmingDiscard}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard your changes?</AlertDialogTitle>
            <AlertDialogDescription>
              The changes to this item haven't been saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={close}>
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function ItemForm({
  item,
  readOnly,
  onUnsavedChange,
  onCancel,
  onDone,
}: {
  item: ContentItem
  /** Opened from an overview: show everything, change nothing. */
  readOnly: boolean
  onUnsavedChange: (hasUnsavedChanges: boolean) => void
  onCancel: () => void
  onDone: () => void
}) {
  const me = useGetMe()
  const updateContent = useUpdateContent()
  const updateStatus = useUpdateContentStatus()
  const archiveContent = useArchiveContent()
  const restoreContent = useRestoreContent()

  // Archived items are read-only until restored (the API answers 409).
  const isArchived = item.archivedAt !== null
  const canEdit = !readOnly && item.allowed.edit && !isArchived
  const canAssignAuthors =
    !readOnly && item.allowed.assignAuthors && !isArchived
  const canRemoveSelf =
    !readOnly &&
    item.allowed.removeSelf &&
    !item.allowed.assignAuthors &&
    !isArchived

  const form = useForm({
    defaultValues: {
      title: item.title,
      status: item.status as ContentStatus,
      type: item.type as ContentType,
      deadline: item.deadline ?? '',
      draftUrl: item.draftUrl ?? '',
      authorIds: item.authors.map((author) => author.id),
      brief: item.brief as Brief | null,
    },
    onSubmit: async ({ value }) => {
      const changes = changedFields(item, value)
      const statusChanged = value.status !== item.status

      if (Object.keys(changes).length === 0 && !statusChanged) {
        onDone()
        return
      }

      // A failed request shows a toast (see query-client.ts); the form stays open.
      try {
        if (Object.keys(changes).length > 0) {
          await updateContent.mutateAsync({ id: item.id, data: changes })
        }
        if (statusChanged) {
          await updateStatus.mutateAsync({
            id: item.id,
            data: { status: value.status },
          })
        }
      } catch {
        return
      }

      toast.success('Changes saved')
      onDone()
    },
  })

  const isDirty = useStore(form.store, (state) => state.isDirty)
  useEffect(() => onUnsavedChange(isDirty), [isDirty, onUnsavedChange])

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
    >
      <DialogDescription className="sr-only">
        {canEdit ? 'Edit the content item' : 'Details of the content item'}
      </DialogDescription>

      {/* Title: a heading when viewing, a large input when editing. */}
      {canEdit ? (
        <form.Field
          name="title"
          validators={{
            onChange: ({ value }) =>
              value.trim() ? undefined : 'Give the item a title',
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1 pr-8">
              <DialogTitle className="sr-only">{item.title}</DialogTitle>
              <input
                aria-label="Title"
                className="-mx-2 rounded-md border border-transparent px-2 py-1 text-xl font-semibold outline-none hover:border-input focus:border-ring focus:ring-3 focus:ring-ring/30"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              <FieldErrors errors={field.state.meta.errors} />
            </div>
          )}
        </form.Field>
      ) : (
        <DialogTitle className="pr-8 text-xl leading-snug">
          {item.title}
        </DialogTitle>
      )}

      {isArchived && (
        <p className="flex items-center gap-2 rounded-md bg-zinc-100 px-3 py-2 text-sm text-zinc-700">
          <Archive className="size-4 shrink-0" />
          Archived {formatDate(item.archivedAt!)}. Restore it to make changes.
        </p>
      )}

      {/* Labels on top. The three short fields share a row at equal width; longer ones get the full width. */}
      <div className="grid grid-cols-3 gap-4">
        <Field label="Status">
          {canEdit && item.status !== 'published' ? (
            <form.Field name="status">
              {(field) => (
                <Select
                  items={STATUS_LABELS}
                  value={field.state.value}
                  onValueChange={(status) =>
                    status && field.handleChange(status)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORK_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </form.Field>
          ) : (
            <StatusBadge status={item.status} />
          )}
        </Field>

        <Field label="Type">
          {canEdit ? (
            <form.Field name="type">
              {(field) => (
                <Select
                  items={TYPE_LABELS}
                  value={field.state.value}
                  onValueChange={(type) => type && field.handleChange(type)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {TYPE_LABELS[type]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </form.Field>
          ) : (
            <TypeBadge type={item.type} />
          )}
        </Field>

        <Field label="Deadline">
          {canEdit ? (
            <form.Field name="deadline">
              {(field) => (
                <Input
                  type="date"
                  aria-label="Deadline"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </form.Field>
          ) : (
            <Deadline deadline={item.deadline} status={item.status} />
          )}
        </Field>
      </div>

      <Field label="Authors">
        <form.Field name="authorIds">
          {(field) => (
            <div className="flex flex-wrap items-center gap-2">
              {canAssignAuthors ? (
                <AuthorsPicker
                  authorIds={field.state.value}
                  onChange={field.handleChange}
                />
              ) : (
                <AuthorList item={item} authorIds={field.state.value} />
              )}
              {canRemoveSelf &&
                me.data &&
                field.state.value.includes(me.data.id) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      field.handleChange(
                        field.state.value.filter(
                          (authorId) => authorId !== me.data?.id,
                        ),
                      )
                    }
                  >
                    <UserMinus />
                    Remove me
                  </Button>
                )}
            </div>
          )}
        </form.Field>
      </Field>

      <Field label="Link to the draft">
        {canEdit ? (
          <form.Field
            name="draftUrl"
            validators={{
              onBlur: ({ value }) =>
                !value.trim() || URL.canParse(value.trim())
                  ? undefined
                  : 'Enter a full link, starting with https://',
            }}
          >
            {(field) => (
              <>
                <Input
                  type="url"
                  placeholder="https://…"
                  aria-label="Link to the draft"
                  aria-invalid={field.state.meta.errors.length > 0}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <FieldErrors errors={field.state.meta.errors} />
              </>
            )}
          </form.Field>
        ) : item.draftUrl ? (
          <a
            href={item.draftUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 truncate text-sm underline underline-offset-4 hover:text-foreground"
          >
            {item.draftUrl}
            <ExternalLink className="size-3.5 shrink-0" />
          </a>
        ) : (
          <EmptyValue>No link</EmptyValue>
        )}
      </Field>

      <Field label="Brief">
        <form.Field name="brief">
          {(field) =>
            canEdit || field.state.value ? (
              <BriefEditor
                brief={field.state.value}
                editable={canEdit}
                onChange={field.handleChange}
              />
            ) : (
              <EmptyValue>No brief yet</EmptyValue>
            )
          }
        </form.Field>
      </Field>

      {/* Who and when: metadata, so it sits quietly below the content. */}
      <p className="text-xs text-muted-foreground">
        Created by {item.createdBy.name} on {formatDate(item.createdAt)}
        {item.publishedAt &&
          ` · ${item.status === 'published' ? 'Published' : 'First published'} ${formatDate(item.publishedAt)}`}
      </p>

      <DialogFooter className="sm:justify-between">
        {/* Archive is a separate, immediate action: kept left, away from Save. */}
        <div>
          {!readOnly &&
            item.allowed.archive &&
            (isArchived ? (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  restoreContent.mutate(
                    { id: item.id },
                    { onSuccess: () => toast.success('Item restored') },
                  )
                }
              >
                <ArchiveRestore />
                Restore
              </Button>
            ) : (
              <Button
                type="button"
                variant="destructive"
                onClick={() =>
                  archiveContent.mutate(
                    { id: item.id },
                    {
                      onSuccess: () => {
                        toast.success('Item archived')
                        onDone()
                      },
                    },
                  )
                }
              >
                <Archive />
                Archive
              </Button>
            ))}
        </div>

        <div className="flex gap-2">
          {canEdit || canRemoveSelf ? (
            <>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <form.Subscribe
                selector={(state) =>
                  [state.canSubmit, state.isSubmitting] as const
                }
              >
                {([canSubmit, isSubmitting]) => (
                  <Button
                    type="submit"
                    variant="brand"
                    disabled={!canSubmit || isSubmitting}
                  >
                    {isSubmitting ? 'Saving…' : 'Save changes'}
                  </Button>
                )}
              </form.Subscribe>
            </>
          ) : (
            <Button type="button" variant="outline" onClick={onDone}>
              Close
            </Button>
          )}
        </div>
      </DialogFooter>
    </form>
  )
}

/** A label above its value or control. */
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col items-start gap-1.5 *:max-w-full [&>*:not(span)]:w-full">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}

function FieldErrors({ errors }: { errors: unknown[] }) {
  return errors.map((error) => (
    <p key={String(error)} className="text-xs text-destructive">
      {String(error)}
    </p>
  ))
}

function EmptyValue({ children }: { children: ReactNode }) {
  return <span className="text-sm text-muted-foreground">{children}</span>
}

/** Authors as avatars with names, for viewing. */
function AuthorList({
  item,
  authorIds,
}: {
  item: ContentItem
  authorIds: string[]
}) {
  const authors = item.authors.filter((author) => authorIds.includes(author.id))

  if (authors.length === 0) return <EmptyValue>No authors</EmptyValue>

  return (
    <div className="flex flex-wrap gap-3">
      {authors.map((author) => (
        <span
          key={author.id}
          className="inline-flex items-center gap-1.5 text-sm"
        >
          <UserAvatar name={author.name} size="sm" />
          {author.name}
        </span>
      ))}
    </div>
  )
}

/** Only what the user changed, in the shape the API takes. */
function changedFields(
  item: ContentItem,
  value: {
    title: string
    type: ContentType
    deadline: string
    draftUrl: string
    authorIds: string[]
    brief: Brief | null
  },
): UpdateContent {
  const changes: UpdateContent = {}
  const title = value.title.trim()
  const draftUrl = value.draftUrl.trim() || null
  const deadline = value.deadline || null
  const currentAuthorIds = item.authors.map((author) => author.id)

  if (title !== item.title) changes.title = title
  if (value.type !== item.type) changes.type = value.type
  if (deadline !== item.deadline) changes.deadline = deadline
  if (draftUrl !== item.draftUrl) changes.draftUrl = draftUrl
  if (JSON.stringify(value.brief) !== JSON.stringify(item.brief)) {
    changes.brief = value.brief
  }
  if (
    value.authorIds.length !== currentAuthorIds.length ||
    value.authorIds.some((authorId) => !currentAuthorIds.includes(authorId))
  ) {
    changes.authorIds = value.authorIds
  }

  return changes
}
