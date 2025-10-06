import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

import type { Pet, Theme } from '@/server/db/schema';
import type { listMemorials } from '@/server/services/memorials';

export type Memorial = Awaited<ReturnType<typeof listMemorials>>[number];

interface MemorialManagerProps {
  initialMemorials: Memorial[];
  pets: Pet[];
  themes: Theme[];
}

export function MemorialManager({ initialMemorials, pets, themes }: MemorialManagerProps) {
  const [memorials, setMemorials] = useState(initialMemorials);
  const [selectedId, setSelectedId] = useState(initialMemorials[0]?.id ?? null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ petId: '', title: '', subtitle: '', summary: '', story: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selected = useMemo(
    () => memorials.find((memorial) => memorial.id === selectedId) ?? memorials[0] ?? null,
    [memorials, selectedId]
  );

  async function readError(response: Response) {
    try {
      const data = (await response.json()) as { error?: string };
      return data.error;
    } catch {
      return undefined;
    }
  }

  async function createMemorialHandler(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/memorials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petId: form.petId,
          title: form.title,
          subtitle: form.subtitle || undefined,
          summary: form.summary || undefined,
          story: form.story || undefined,
          status: 'draft'
        })
      });

      if (!response.ok) {
        const message = (await readError(response)) ?? 'Unable to create memorial';
        throw new globalThis.Error(message);
      }

      const { memorial } = (await response.json()) as { memorial: Memorial };
      setMemorials((current) => [memorial, ...current]);
      setSelectedId(memorial.id);
      setForm({ petId: '', title: '', subtitle: '', summary: '', story: '' });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to create memorial');
    } finally {
      setCreating(false);
    }
  }

  async function updateMemorial(id: string, data: Record<string, unknown>) {
    setErrorMessage(null);
    const response = await fetch(`/api/memorials/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) {
      const message = (await readError(response)) ?? 'Unable to update memorial';
      setErrorMessage(message);
      return null;
    }
    const { memorial } = (await response.json()) as { memorial: Memorial };
    setMemorials((current) => current.map((item) => (item.id === id ? memorial : item)));
    return memorial;
  }

  async function togglePublish(memorial: Memorial) {
    setErrorMessage(null);
    const response = await fetch(`/api/memorials/${memorial.id}/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ publish: memorial.status !== 'published' })
    });
    if (!response.ok) {
      const message = (await readError(response)) ?? 'Unable to publish memorial';
      setErrorMessage(message);
      return;
    }
    const { memorial: updated } = (await response.json()) as { memorial: Memorial };
    setMemorials((current) => current.map((item) => (item.id === memorial.id ? updated : item)));
  }

  return (
    <div className="grid items-start gap-8 xl:grid-cols-[340px_1fr]">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Draft a memorial</CardTitle>
          <CardDescription>Create a new tribute starting from a pet profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={createMemorialHandler}>
            <Field label="Pet" id="petId">
              <select
                id="petId"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={form.petId}
                onChange={(event) => setForm((state) => ({ ...state, petId: event.target.value }))}
                required
              >
                <option value="" disabled>
                  Select a companion
                </option>
                {pets.map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.name} • {pet.species}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Title" id="title">
              <Input
                id="title"
                value={form.title}
                onChange={(event) => setForm((state) => ({ ...state, title: event.target.value }))}
                required
              />
            </Field>
            <Field label="Subtitle" id="subtitle">
              <Input
                id="subtitle"
                value={form.subtitle}
                onChange={(event) => setForm((state) => ({ ...state, subtitle: event.target.value }))}
              />
            </Field>
            <Field label="Summary" id="summary">
              <Textarea
                id="summary"
                value={form.summary}
                onChange={(event) => setForm((state) => ({ ...state, summary: event.target.value }))}
                rows={3}
              />
            </Field>
            <Field label="Story" id="story">
              <Textarea
                id="story"
                value={form.story}
                onChange={(event) => setForm((state) => ({ ...state, story: event.target.value }))}
                rows={5}
              />
            </Field>
            <AnimatePresence>{errorMessage && <ErrorBanner message={errorMessage} />}</AnimatePresence>
            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? 'Creating…' : 'Create memorial'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Memorial library</h2>
          <p className="text-sm text-muted-foreground">
            Manage copy, status, and theming for each tribute. Select one to preview.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {memorials.map((memorial) => (
            <motion.div key={memorial.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <Card
                className={`cursor-pointer border border-transparent transition hover:border-primary/40 ${selected?.id === memorial.id ? 'border-primary/60 bg-primary/5' : 'bg-card/90'}`}
                onClick={() => setSelectedId(memorial.id)}
              >
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{memorial.title}</CardTitle>
                    <Badge variant={memorial.status === 'published' ? 'default' : 'secondary'}>
                      {memorial.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Honoring {memorial.pet.name}
                    {memorial.theme ? ` • ${memorial.theme.name}` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {memorial.summary ?? 'Add a short introduction to this tribute.'}
                  </p>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border px-2 py-1">
                      Media assets {memorial.mediaAssets.length}
                    </span>
                    <span className="rounded-full border border-border px-2 py-1">
                      Updated {new Date(memorial.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={memorial.status === 'published' ? 'outline' : 'default'}
                      onClick={(event) => {
                        event.stopPropagation();
                        togglePublish(memorial);
                      }}
                    >
                      {memorial.status === 'published' ? 'Unpublish' : 'Publish'}
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <a href={`/memorials/${memorial.slug}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}>
                        View public page
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        {memorials.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-6 text-sm text-muted-foreground">
              No memorials yet—create one to start building tribute content.
            </CardContent>
          </Card>
        )}
        {selected && (
          <MemorialDetail
            key={selected.id}
            memorial={selected}
            themes={themes}
            onSelectTheme={(themeId) => updateMemorial(selected.id, { themeId })}
            onUpdateContent={(data) => updateMemorial(selected.id, data)}
          />
        )}
      </div>
    </div>
  );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
    >
      {message}
    </motion.div>
  );
}

interface MemorialDetailProps {
  memorial: Memorial;
  themes: Theme[];
  onSelectTheme: (themeId: string | null) => Promise<Memorial | null> | void;
  onUpdateContent: (data: Record<string, unknown>) => Promise<Memorial | null> | void;
}

function MemorialDetail({ memorial, themes, onSelectTheme, onUpdateContent }: MemorialDetailProps) {
  const [updatingTheme, setUpdatingTheme] = useState(false);
  const [updatingCopy, setUpdatingCopy] = useState(false);
  const [summary, setSummary] = useState(memorial.summary ?? '');
  const [story, setStory] = useState(memorial.story ?? '');
  const [themeId, setThemeId] = useState(memorial.themeId ?? '');

  async function handleThemeChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value === '' ? null : event.target.value;
    setThemeId(event.target.value);
    setUpdatingTheme(true);
    try {
      await onSelectTheme(value);
    } finally {
      setUpdatingTheme(false);
    }
  }

  async function handleCopySave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setUpdatingCopy(true);
    try {
      await onUpdateContent({ summary: summary || null, story: story || null });
    } finally {
      setUpdatingCopy(false);
    }
  }

  return (
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card/80 shadow-sm">
      <div className="grid gap-0 lg:grid-cols-[420px_1fr]">
        <div className="space-y-5 border-b border-border p-6 lg:border-b-0 lg:border-r">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Memorial details</h3>
            <p className="text-sm text-muted-foreground">Update tone, narrative, and palette.</p>
          </div>
          <div className="space-y-3">
            <Field id="theme" label="Theme">
              <select
                id="theme"
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={themeId}
                onChange={handleThemeChange}
                disabled={updatingTheme}
              >
                <option value="">Default</option>
                {themes.map((theme) => (
                  <option key={theme.id} value={theme.id}>
                    {theme.name}
                  </option>
                ))}
              </select>
            </Field>
            <form className="space-y-3" onSubmit={handleCopySave}>
              <Field id="summary" label="Summary">
                <Textarea id="summary" value={summary} onChange={(event) => setSummary(event.target.value)} rows={3} />
              </Field>
              <Field id="story" label="Story">
                <Textarea id="story" value={story} onChange={(event) => setStory(event.target.value)} rows={6} />
              </Field>
              <Button type="submit" size="sm" disabled={updatingCopy}>
                {updatingCopy ? 'Saving…' : 'Save narrative'}
              </Button>
            </form>
          </div>
        </div>
        <div className="space-y-5 p-6">
          <div className="space-y-2">
            <h4 className="text-base font-semibold text-foreground">Live preview</h4>
            <p className="text-sm text-muted-foreground">How the tribute appears to guests.</p>
          </div>
          <Separator />
          <Preview memorial={{ ...memorial, summary, story, themeId }} />
        </div>
      </div>
    </motion.section>
  );
}

function Preview({ memorial }: { memorial: Memorial & { summary?: string | null; story?: string | null; themeId?: string | null } }) {
  return (
    <article className="space-y-6 rounded-xl border border-border bg-background p-6 shadow-inner">
      <div className="space-y-3 text-center">
        <h2 className="text-2xl font-semibold text-foreground">{memorial.title}</h2>
        {memorial.subtitle && <p className="text-base text-muted-foreground">{memorial.subtitle}</p>}
      </div>
      <div className="space-y-4 text-sm leading-6 text-muted-foreground">
        <p>{memorial.summary ?? 'Add a summary to introduce the memorial story.'}</p>
        <p className="whitespace-pre-wrap">{memorial.story ?? 'Write stories, memories, and heartfelt moments here.'}</p>
      </div>
      <Separator />
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="rounded-full border border-border px-3 py-1">Pet: {memorial.pet.name}</span>
        <span className="rounded-full border border-border px-3 py-1">Status: {memorial.status}</span>
        <span className="rounded-full border border-border px-3 py-1">Slug: {memorial.slug}</span>
      </div>
    </article>
  );
}
