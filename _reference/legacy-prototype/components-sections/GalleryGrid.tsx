import Link from 'next/link';

export interface GalleryCategoryItem {
  slug: string;
  name: string;
  summary: string;
  accentColor: string;
  itemCount: number;
}

export default function GalleryGrid({ categories }: { categories: GalleryCategoryItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/gallery/${category.slug}`}
          className="group relative flex h-64 flex-col justify-end overflow-hidden rounded-lg p-6 text-white"
          style={{ backgroundColor: category.accentColor }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity group-hover:opacity-80" />
          <div className="relative">
            <p className="text-xs uppercase tracking-wide text-white/80">{category.itemCount} looks</p>
            <h3 className="mt-1 font-heading text-2xl font-semibold">{category.name}</h3>
            <p className="mt-2 max-w-sm text-sm text-white/85">{category.summary}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}
