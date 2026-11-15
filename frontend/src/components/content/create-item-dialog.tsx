import { useForm } from '@tanstack/react-form'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCreateContent } from '@/api/generated/content/content'
import type { ContentType, CreateContentStatus } from '@/api/generated/model'
import { useGetMe } from '@/api/generated/auth/auth'
import { AuthorsPicker } from '@/components/content/authors-picker'
import { DeadlinePicker } from '@/components/content/deadline-picker'
import { OptionPicker } from '@/components/content/option-picker'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOpenItem } from '@/hooks/use-open-item'
import { WORK_STATUSES } from '@/lib/content'
import { statusOption, TYPE_OPTIONS } from '@/lib/content-options'

/** "New item" button and the modal form behind it. */
export function CreateItemDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="brand" />}>
        <Plus />
        New item
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New content item</DialogTitle>
          <DialogDescription>
            You become its creator. Add a brief once it exists.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form starts fresh every time. */}
        {open && <CreateItemForm onCreated={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  )
}

function CreateItemForm({ onCreated }: { onCreated: () => void }) {
  const me = useGetMe()
  const createContent = useCreateContent()
  const openItem = useOpenItem()

  const form = useForm({
    defaultValues: {
      title: 'Untitled',
      type: 'article' as ContentType,
      status: 'idea' as CreateContentStatus,
      deadline: '',
      draftUrl: '',
      // The creator usually writes the piece; they can remove themselves.
      authorIds: me.data ? [me.data.id] : [],
    },
    onSubmit: async ({ value }) => {
      // A failed request shows a toast (see query-client.ts); the form stays open.
      const created = await createContent
        .mutateAsync({
          data: {
            title: value.title.trim(),
            type: value.type,
            status: value.status,
            deadline: value.deadline || null,
            draftUrl: value.draftUrl.trim() || null,
            authorIds: value.authorIds,
          },
        })
        .catch(() => null)
      if (!created) return

      toast.success('Item created')
      onCreated()
      openItem(created.id)
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        form.handleSubmit()
      }}
    >
      <form.Field
        name="title"
        validators={{
          onChange: ({ value }) =>
            value.trim() ? undefined : 'Give the item a title',
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Title</Label>
            <Input
              id={field.name}
              autoFocus
              value={field.state.value}
              onFocus={(event) => event.target.select()}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {field.state.meta.errors.map((error) => (
              <p key={String(error)} className="text-xs text-destructive">
                {String(error)}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="type">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label>Type</Label>
              <OptionPicker
                label="Type"
                options={TYPE_OPTIONS}
                value={field.state.value}
                onChange={(type) => field.handleChange(type as ContentType)}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="status">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <OptionPicker
                label="Status"
                options={WORK_STATUSES.map(statusOption)}
                value={field.state.value}
                onChange={(status) =>
                  field.handleChange(status as CreateContentStatus)
                }
              />
            </div>
          )}
        </form.Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <form.Field name="deadline">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label>Deadline</Label>
              <DeadlinePicker
                value={field.state.value}
                onChange={field.handleChange}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="authorIds">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <Label>Authors</Label>
              <AuthorsPicker
                authorIds={field.state.value}
                onChange={field.handleChange}
              />
            </div>
          )}
        </form.Field>
      </div>

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
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={field.name}>Link to the draft</Label>
            <Input
              id={field.name}
              type="url"
              placeholder="https://docs.example.com/…"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
              aria-invalid={field.state.meta.errors.length > 0}
            />
            {field.state.meta.errors.map((error) => (
              <p key={String(error)} className="text-xs text-destructive">
                {String(error)}
              </p>
            ))}
          </div>
        )}
      </form.Field>

      <DialogFooter>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting] as const}
        >
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="brand"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? 'Creating…' : 'Create item'}
            </Button>
          )}
        </form.Subscribe>
      </DialogFooter>
    </form>
  )
}
