import { useMemo } from 'react';
import { motion } from 'framer-motion';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import type { Pet } from '@/server/db/schema';
import type { listMemorials } from '@/server/services/memorials';

type Memorial = Awaited<ReturnType<typeof listMemorials>>[number];

interface DashboardProps {
  pets: Pet[];
  memorials: Memorial[];
}

export function Dashboard({ pets, memorials }: DashboardProps) {
  const stats = useMemo(() => {
    const published = memorials.filter((memorial) => memorial.status === 'published').length;
    const draft = memorials.length - published;
    const memorializedPets = new Set(memorials.map((memorial) => memorial.petId)).size;
    return {
      totalPets: pets.length,
      memorialCount: memorials.length,
      published,
      draft,
      memorializedPets
    };
  }, [pets, memorials]);

  const spotlight = memorials.find((memorial) => memorial.status === 'published') ?? memorials[0];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Pets" value={stats.totalPets} helper="Managed companions" />
        <MetricCard label="Memorials" value={stats.memorialCount} helper="Published & drafts" />
        <MetricCard label="Published" value={stats.published} helper="Live tributes" />
        <MetricCard label="Drafts" value={stats.draft} helper="Work in progress" />
      </div>

      {spotlight ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <Badge variant={spotlight.status === 'published' ? 'default' : 'secondary'} className="mb-3">
                  {spotlight.status === 'published' ? 'Published tribute' : 'Draft tribute'}
                </Badge>
                <CardTitle className="text-2xl font-semibold">
                  {spotlight.title}
                </CardTitle>
                <CardDescription className="mt-1 text-base">
                  Honoring {spotlight.pet.name} • {spotlight.pet.species}
                </CardDescription>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" asChild>
                  <a href={`/memorials/${spotlight.slug}`} target="_blank" rel="noreferrer">
                    View memorial
                  </a>
                </Button>
                <Button asChild>
                  <a href={`/admin/memorials?id=${spotlight.id}`}>Edit memorial</a>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>{spotlight.summary ?? 'Add a short summary to introduce this tribute.'}</p>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-muted-foreground">
                <span className="rounded-full border border-border px-3 py-1">Assets: {spotlight.mediaAssets.length}</span>
                <span className="rounded-full border border-border px-3 py-1">
                  Theme {spotlight.theme?.name ?? 'Default'}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{helper}</p>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>Start your first memorial</CardTitle>
        <CardDescription>
          Create a pet and craft their tribute to spotlight it here.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <Button asChild>
          <a href="/admin/pets">Add a pet</a>
        </Button>
        <Button variant="outline" asChild>
          <a href="/admin/memorials">Draft a memorial</a>
        </Button>
      </CardContent>
    </Card>
  );
}
