import { useState } from 'react';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

import type { Theme } from '@/server/db/schema';

interface ThemeManagerProps {
  themes: Theme[];
}

export function ThemeManager({ themes }: ThemeManagerProps) {
  const [items, setItems] = useState(themes);
  const [form, setForm] = useState({
    name: '',
    description: '',
    primaryColor: '#1d4ed8',
    secondaryColor: '#f97316',
    accentColor: '#10b981',
    backgroundColor: '#ffffff',
    headingFont: 'Playfair Display',
    bodyFont: 'Inter'
  });
  const [creating, setCreating] = useState(false);

  async function createTheme(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    try {
      const response = await fetch('/api/themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          description: form.description || null
        })
      });
      if (!response.ok) {
        throw new Error('Unable to create theme');
      }
      const { theme } = await response.json();
      setItems((current) => [theme, ...current]);
      setForm({
        name: '',
        description: '',
        primaryColor: '#1d4ed8',
        secondaryColor: '#f97316',
        accentColor: '#10b981',
        backgroundColor: '#ffffff',
        headingFont: 'Playfair Display',
        bodyFont: 'Inter'
      });
    } catch (error) {
      console.error(error);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Create theme</CardTitle>
          <CardDescription>Define palettes to reuse across memorials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={createTheme}>
            <Field label="Name" id="name">
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
                required
              />
            </Field>
            <Field label="Description" id="description">
              <Input
                id="description"
                value={form.description}
                onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
              />
            </Field>
            <Separator />
            <div className="grid gap-4 sm:grid-cols-2">
              <ColorField label="Primary" value={form.primaryColor} onChange={(value) => setForm((state) => ({ ...state, primaryColor: value }))} />
              <ColorField label="Secondary" value={form.secondaryColor} onChange={(value) => setForm((state) => ({ ...state, secondaryColor: value }))} />
              <ColorField label="Accent" value={form.accentColor} onChange={(value) => setForm((state) => ({ ...state, accentColor: value }))} />
              <ColorField label="Background" value={form.backgroundColor} onChange={(value) => setForm((state) => ({ ...state, backgroundColor: value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Heading font" id="headingFont">
                <Input
                  id="headingFont"
                  value={form.headingFont}
                  onChange={(event) => setForm((state) => ({ ...state, headingFont: event.target.value }))}
                  required
                />
              </Field>
              <Field label="Body font" id="bodyFont">
                <Input
                  id="bodyFont"
                  value={form.bodyFont}
                  onChange={(event) => setForm((state) => ({ ...state, bodyFont: event.target.value }))}
                  required
                />
              </Field>
            </div>
            <Button type="submit" className="w-full" disabled={creating}>
              {creating ? 'Saving…' : 'Create theme'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Theme library</h2>
          <p className="text-sm text-muted-foreground">Curated palettes available in memorial editor.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((theme) => (
            <motion.div key={theme.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="border-border/60 bg-card/90">
                <CardHeader>
                  <CardTitle className="text-base">{theme.name}</CardTitle>
                  {theme.description && <CardDescription>{theme.description}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                  <PaletteSwatch theme={theme} />
                  <div className="text-xs text-muted-foreground">
                    <p>Heading: {theme.headingFont}</p>
                    <p>Body: {theme.bodyFont}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {items.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No themes yet—create one to reuse across memorials.
              </CardContent>
            </Card>
          )}
        </div>
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

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-12 rounded-md border border-input"
        />
        <Input value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </div>
  );
}

function PaletteSwatch({ theme }: { theme: Theme }) {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 overflow-hidden rounded-lg border">
        <div style={{ backgroundColor: theme.primaryColor }} className="h-12" />
        <div style={{ backgroundColor: theme.secondaryColor }} className="h-12" />
        <div style={{ backgroundColor: theme.accentColor }} className="h-12" />
        <div style={{ backgroundColor: theme.backgroundColor }} className="h-12 border-l border-border bg-background" />
      </div>
      <p className="text-xs text-muted-foreground">Primary • Secondary • Accent • Background</p>
    </div>
  );
}
