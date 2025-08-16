import { useEffect, useState } from 'react';
import { TaxonomyItem } from '@/types/taxonomy.types';

export function useTaxonomyData(initialData: TaxonomyItem[]) {
  const [taxonomy, setTaxonomy] = useState<TaxonomyItem[]>(initialData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/taxonomy')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setTaxonomy(data);
      })
      .catch(() => {
        if (isMounted) setTaxonomy([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { taxonomy, loading };
} 