import { getCategoryBySlug } from '@/lib/api/categories';
import { getCollections } from '@/lib/api/collections';
import { CollectionFeed } from '@/components/collections/collection-feed';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryData = await getCategoryBySlug(slug);

  if (!categoryData) {
    return {
      title: 'Kategori Bulunamadı',
    };
  }

  const category = categoryData as any;

  return {
    title: `${category.names.tr} Koleksiyonları | mekan.guru`,
    description: `${category.names.tr} kategorisindeki en iyi mekan koleksiyonlarını keşfedin.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const categoryData = await getCategoryBySlug(slug);

  if (!categoryData) {
    notFound();
  }

  const category = categoryData as any;

  const collectionsData = await getCollections({
    category_id: category.id,
    status: 'active',
  });

  const collections = collectionsData.map(c => ({
    ...c,
    places_count: c.places_count || 0
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-50">
              {category.names.tr}
            </h1>
            <p className="mt-1 text-neutral-600 dark:text-neutral-400">
              {category.names.tr} kategorisindeki koleksiyonlar
            </p>
          </div>
        </div>
      </div>

      {collections.length > 0 ? (
        <CollectionFeed collections={collections as any} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 py-12 text-center dark:border-neutral-700">
          <p className="text-lg font-medium text-neutral-900 dark:text-neutral-50">
            Bu kategoride henüz koleksiyon bulunmuyor.
          </p>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
            İlk koleksiyonu oluşturarak katkıda bulunabilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}
