'use client';

import { useState } from 'react';
import { Plus, Pencil, Trash2, Star, Eye } from 'lucide-react';
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
import { CollectionDialog } from '@/components/admin/collection-dialog';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

export default function AdminCollectionsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const queryClient = useQueryClient();
  const supabase = createClient();

  const { data: collections, isLoading } = useQuery({
    queryKey: ['admin-collections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collections')
        .select(
          `
          *,
          creator:users!collections_creator_id_fkey(id, username),
          location:locations!collections_location_id_fkey(id, slug, names),
          category:categories!collections_category_id_fkey(id, slug, names),
          subcategory:categories!collections_subcategory_id_fkey(id, slug, names)
        `
        )
        .order('created_at', { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      const { error } = await supabase
        .from('collections')
        .delete()
        .eq('id', collectionId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
    },
  });

  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({
      id,
      isFeatured,
    }: {
      id: string;
      isFeatured: boolean;
    }) => {
      const { error } = await supabase
        .from('collections')
        .update({ is_featured: isFeatured })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-collections'] });
    },
  });

  const handleEdit = (collection: any) => {
    setSelectedCollection(collection);
    setIsDialogOpen(true);
  };

  const handleDelete = async (collectionId: string) => {
    if (confirm('Are you sure you want to delete this collection?')) {
      deleteMutation.mutate(collectionId);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {
    toggleFeaturedMutation.mutate({ id, isFeatured: !currentStatus });
  };

  const handleCreate = () => {
    setSelectedCollection(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedCollection(null);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'archived':
        return 'secondary';
      case 'flagged':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
            Collections
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Manage user-curated collections of places
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Collection
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Collections ({collections?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center text-neutral-600 dark:text-neutral-400">
              Loading collections...
            </div>
          ) : collections && collections.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Creator</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Votes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.map((collection) => {
                  const names = collection.names as { en: string; tr: string };
                  const locationNames = collection.location?.names as {
                    en: string;
                    tr: string;
                  };
                  const categoryNames = collection.category?.names as {
                    en: string;
                    tr: string;
                  };
                  const collectionName = names?.en || collection.slug;

                  return (
                    <TableRow key={collection.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {collection.is_featured && (
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          )}
                          {collectionName}
                        </div>
                      </TableCell>
                      <TableCell>
                        {collection.creator?.username || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {locationNames?.en || collection.location?.slug || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {categoryNames?.en || collection.category?.slug || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-neutral-500" />
                          <span className="text-sm">
                            {collection.vote_count}
                          </span>
                          <span className="text-xs text-neutral-500">
                            ({collection.vote_score})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(collection.status)}>
                          {collection.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleToggleFeatured(
                                collection.id,
                                collection.is_featured
                              )
                            }
                            title={
                              collection.is_featured
                                ? 'Remove from featured'
                                : 'Add to featured'
                            }
                          >
                            <Star
                              className={`h-4 w-4 ${
                                collection.is_featured
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : ''
                              }`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(collection)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(collection.id)}
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
              No collections found. Click &quot;Add Collection&quot; to create
              one.
            </div>
          )}
        </CardContent>
      </Card>

      <CollectionDialog
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        collection={selectedCollection}
      />
    </div>
  );
}
