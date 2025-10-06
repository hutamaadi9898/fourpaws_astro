import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

import type { Pet } from '@/server/db/schema';

interface PetManagerProps {
  initialPets: Pet[];
}

interface PetDetails extends Pet {
  summary?: string | null;
}

export function PetManager({ initialPets }: PetManagerProps) {
  const [pets, setPets] = useState<PetDetails[]>(initialPets);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    species: '',
    breed: '',
    birthDate: '',
    passingDate: ''
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function readError(response: Response) {
    try {
      const data = (await response.json()) as { error?: string };
      return data.error;
    } catch {
      return undefined;
    }
  }

  async function createPet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        name: form.name,
        species: form.species,
        breed: form.breed || undefined,
        birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : undefined,
        passingDate: form.passingDate ? new Date(form.passingDate).toISOString() : undefined
      };

      const response = await fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const message = (await readError(response)) ?? 'Unable to create pet';
        throw new globalThis.Error(message);
      }

      const { pet } = (await response.json()) as { pet: Pet };
      setPets((current) => [pet, ...current]);
      setForm({ name: '', species: '', breed: '', birthDate: '', passingDate: '' });
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to create pet');
    } finally {
      setSubmitting(false);
    }
  }

  async function deletePet(id: string) {
    const response = await fetch(`/api/pets/${id}`, { method: 'DELETE' });
    if (!response.ok && response.status !== 204) {
      const message = (await readError(response)) ?? 'Unable to delete pet';
      setErrorMessage(message);
      return;
    }
    setPets((current) => current.filter((pet) => pet.id !== id));
  }

  async function toggleMemorialized(pet: Pet) {
    const response = await fetch(`/api/pets/${pet.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memorialized: !pet.memorialized })
    });

    if (!response.ok) {
      const message = (await readError(response)) ?? 'Unable to update pet';
      setErrorMessage(message);
      return;
    }

    const { pet: updated } = (await response.json()) as { pet: Pet };
    setPets((current) => current.map((item) => (item.id === pet.id ? updated : item)));
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle>Add a companion</CardTitle>
          <CardDescription>Capture core details to start a memorial.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={createPet}>
            <Field id="name" label="Name">
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((state) => ({ ...state, name: event.target.value }))}
                required
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="species" label="Species">
                <Input
                  id="species"
                  value={form.species}
                  onChange={(event) => setForm((state) => ({ ...state, species: event.target.value }))}
                  required
                />
              </Field>
              <Field id="breed" label="Breed (optional)">
                <Input
                  id="breed"
                  value={form.breed}
                  onChange={(event) => setForm((state) => ({ ...state, breed: event.target.value }))}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="birthDate" label="Birth date">
                <Input
                  id="birthDate"
                  type="date"
                  value={form.birthDate}
                  onChange={(event) => setForm((state) => ({ ...state, birthDate: event.target.value }))}
                />
              </Field>
              <Field id="passingDate" label="Passing date">
                <Input
                  id="passingDate"
                  type="date"
                  value={form.passingDate}
                  onChange={(event) => setForm((state) => ({ ...state, passingDate: event.target.value }))}
                />
              </Field>
            </div>
            <AnimatePresence>{errorMessage && <ErrorBanner message={errorMessage} />}</AnimatePresence>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creating…' : 'Add pet'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Existing companions</h2>
          <p className="text-sm text-muted-foreground">
            Track who has a memorial in progress and who is already honored.
          </p>
        </div>
        <div className="space-y-3">
          {pets.map((pet) => (
            <motion.div key={pet.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} layout>
              <Card className="border-border/60 bg-card/80">
                <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-base font-semibold text-foreground">{pet.name}</h3>
                      {pet.memorialized && <Badge variant="secondary">Memorialized</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {pet.species}
                      {pet.breed ? ` • ${pet.breed}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added {new Date(pet.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleMemorialized(pet)}>
                      {pet.memorialized ? 'Mark as pending' : 'Mark memorialized'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => deletePet(pet.id)}>
                      Delete
                    </Button>
                    <Button size="sm" asChild>
                      <a href={`/admin/memorials?petId=${pet.id}`}>Create memorial</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {pets.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-sm text-muted-foreground">
                No pets yet—add your first companion to begin their tribute.
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

function ErrorBanner({ message }: { message: string }) {
  return (
    <motion.div
      key="error"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
    >
      {message}
    </motion.div>
  );
}
