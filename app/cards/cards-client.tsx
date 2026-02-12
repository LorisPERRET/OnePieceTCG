"use client"

import { Search } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';
import { CardTile } from '@/components/shared/card-tile';
import { Card } from '../generated/prisma/client';
import { Pagination } from '@/components/shared/pagination';
import { Input } from '@/components/ui/input';

interface CardsPageProps {
  cards: Card[];
  page: number;
  totalItems: number;
}

export function CardsClient(props: CardsPageProps) {

  const params = useSearchParams()
  const router = useRouter()
  
  const handleQuery = useDebouncedCallback((query: string) => {
    const newParams = new URLSearchParams(params)
    newParams.set("page", "1");
    if (query) {
      newParams.set('query', query);
    } else {
      newParams.delete('query');
    }
    router.push(`?${newParams.toString()}`);
  }, 300)

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                    type="text"
                    placeholder="Rechercher une carte..."
                    defaultValue={params.get('query') ?? ""}
                    onChange={(e) => handleQuery(e.target.value)}
                    className="pl-10"
                />
            </div>
        </div>
    
          {props.totalItems === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Aucune carte trouvée.
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              {props.cards.map((card) => (
                    <CardTile
                      key={card.id}
                      code={card.code}
                      name={card.name}
                      image={card.image}
                      id={card.id}                
                    />
                  ))}
            </div>
          )}
    
          <Pagination
            page={props.page}
            totalItems={props.totalItems}
            pageSize={25}
          />
        </div>
  );
}
