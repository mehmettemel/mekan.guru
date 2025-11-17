'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceDialog } from '@/components/admin/place-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export default function AdminPlacesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: places, isLoading } = useQuery({
    queryKey: ['admin-places'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('places')
        .select(`
          *,
          categories:category_id(*),
          locations:location_id(*)
        `)
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (placeId: string) => {
      const { error } = await supabase.from('places').delete().eq('id', placeId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-places'] });
    },
  });

  const handleEdit = (place: any) => {
    setSelectedPlace(place);
    setIsDialogOpen(true);
  };

  const handleDelete = async (placeId: string) => {
    if (confirm('Are you sure you want to delete this place?')) {
      deleteMutation.mutate(placeId);
    }
  };

  const handleCreate = () => {
    setSelectedPlace(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPlace(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Places
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage restaurants, cafes, and other places
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Place
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Places ({places?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-neutral-600 dark:text-neutral-400">
              Loading places...
            </div>
          ) : places && places.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {places.map((place) => {
                  const names = place.names as any;
                  const placeName = names?.en || place.slug;

                  return (
                    <TableRow key={place.id}>
                      <TableCell className="font-medium">{placeName}</TableCell>
                      <TableCell>
                        {place.categories?.slug || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {place.locations?.slug || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            place.status === 'approved'
                              ? 'default'
                              : place.status === 'pending'
                                ? 'secondary'
                                : 'destructive'
                          }
                        >
                          {place.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(place)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(place.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-neutral-600 dark:text-neutral-400">
              No places found. Click &quot;Add Place&quot; to create one.
            </div>
          )}
        </CardContent>
      </Card>

      <PlaceDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        place={selectedPlace}
      />
    </div>
  );
}
