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
import { LocationDialog } from '@/components/admin/location-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export default function AdminLocationsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: locations, isLoading } = useQuery({
    queryKey: ['admin-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .order('type', { ascending: true })
        .order('slug', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (locationId: string) => {
      const { error } = await supabase.from('locations').delete().eq('id', locationId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-locations'] });
    },
  });

  const handleEdit = (location: any) => {
    setSelectedLocation(location);
    setIsDialogOpen(true);
  };

  const handleDelete = async (locationId: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      deleteMutation.mutate(locationId);
    }
  };

  const handleCreate = () => {
    setSelectedLocation(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedLocation(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Locations
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage countries, cities, and districts
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Location
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Locations ({locations?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-neutral-600 dark:text-neutral-400">
              Loading locations...
            </div>
          ) : locations && locations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Has Districts</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.map((location) => {
                  const names = location.names as any;
                  const locationName = names?.en || location.slug;

                  return (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{locationName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            location.type === 'country'
                              ? 'default'
                              : location.type === 'city'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {location.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {location.slug}
                      </TableCell>
                      <TableCell>
                        {location.has_districts ? 'Yes' : 'No'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(location)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(location.id)}
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
              No locations found. Click &quot;Add Location&quot; to create one.
            </div>
          )}
        </CardContent>
      </Card>

      <LocationDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        location={selectedLocation}
      />
    </div>
  );
}
