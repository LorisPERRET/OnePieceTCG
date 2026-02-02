"use client"

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/app/components/ui/dialog';
// import { Label } from '@/app/components/ui/label';
import { Card, CardContent } from '@/app/components/ui/card';
import { CardData } from '../../generated/prisma/client';
import { Pagination } from '../shared/Pagination';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useDebouncedCallback } from 'use-debounce';

interface AllCardPageProps {
  cards: CardData[];
  page: number;
  totalItems: number;
}

export function AllCardPage({cards, page, totalItems}: AllCardPageProps) {
  // const [isDialogOpen, setIsDialogOpen] = useState(false);
  // const [newCardCode, setNewCardCode] = useState('');
  // const [newCardName, setNewCardName] = useState('');
  // const [newCardQuantity, setNewCardQuantity] = useState(1);

  const params = useSearchParams()
  const router = useRouter()
  
  const handleQuery = useDebouncedCallback((query: string) => {
    console.log("test")
    console.log(query)
    const newParams = new URLSearchParams(params)
    newParams.set("page", "1");
    if (query) {
      newParams.set('query', query);
    } else {
      newParams.delete('query');
    }
    router.push(`?${newParams.toString()}`);
  }, 300)
  // const handleAddCard = () => {
  //   if (newCardCode.trim()) {
  //     onAddCard({
  //       code: newCardCode.trim(),
  //       name: newCardName.trim() || newCardCode.trim(),
  //       quantity: newCardQuantity
  //     });
  //     setNewCardCode('');
  //     setNewCardName('');
  //     setNewCardQuantity(1);
  //     setIsDialogOpen(false);
  //   }
  // };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
           <Input
            type="text"
            placeholder="Rechercher une carte..."
            onChange={(e) => handleQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="size-4 mr-2" />
              Ajouter une carte
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une carte à votre collection</DialogTitle>
              <DialogDescription>
                Entrez les détails de la carte que vous souhaitez ajouter à votre collection.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="card-code">Code de la carte *</Label>
                <Input
                  id="card-code"
                  placeholder="Ex: OP03-099-L"
                  value={newCardCode}
                  onChange={(e) => setNewCardCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-name">Nom de la carte (optionnel)</Label>
                <Input
                  id="card-name"
                  placeholder="Ex: Charlotte Katakuri"
                  value={newCardName}
                  onChange={(e) => setNewCardName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="card-quantity">Quantité</Label>
                <Input
                  id="card-quantity"
                  type="number"
                  min="1"
                  value={newCardQuantity}
                  onChange={(e) => setNewCardQuantity(parseInt(e.target.value) || 1)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCard()}
                />
              </div>
              <Button onClick={handleAddCard} className="w-full">
                Ajouter
              </Button>
            </div>
          </DialogContent>
        </Dialog> */}
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Aucune carte trouvée.
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-4">
          {cards.map((card) => (
            <Card key={card.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{card.name}</h3>
                    <p className="text-sm text-gray-500">{card.code}</p>
                  </div>
                  {/* <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteCard(card.code)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </Button> */}
                </div>
                <div className="w-full overflow-hidden rounded-m pt-4">
                  {/* <Image 
                    src={card.image}
                    alt={card.name}
                    className="h-full w-full object-cover"
                  /> */}
                  <Image 
                    src={card.image} 
                    alt={card.name} 
                    className="h-full w-full object-cover"
                    width={0}
                    height={0}
                    sizes="100vw"
                  />
                </div>
                <div className="flex items-center gap-2 mt-4">
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(card.code, Math.max(1, card.quantity - 1))}
                    disabled={card.quantity <= 1}
                  >
                    -
                  </Button> */}
                  {/* <div className="flex-1 text-center">
                    <span className="font-medium">{card.quantity}</span>
                    <span className="text-sm text-gray-500 ml-1">
                      {card.quantity > 1 ? 'exemplaires' : 'exemplaire'}
                    </span>
                  </div> */}
                  {/* <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateQuantity(card.code, card.quantity + 1)}
                  >
                    +
                  </Button> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Pagination page={page} totalItems={totalItems}/>
    </div>
  );
}
