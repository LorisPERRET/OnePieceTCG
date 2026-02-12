import Image from "next/image";
import { Card, CardContent } from "../ui/card";

interface CardTileProps {
  id: string;
  code: string;
  name: string;
  image: string;
  quantity?: number;
  footerLabel?: string;
  status?: "owned" | "partial" | "missing";
}

export function CardTile({
  id,
  code,
  name,
  image,
  quantity,
  footerLabel,
  status
}: CardTileProps) {
  const imageSrc = image || "/card-placeholder.jpg";

  return (
    <Card key={id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{name}</h3>
            <p className="text-sm text-gray-500">{code}</p>
          </div>
        </div>
        <div className="w-full overflow-hidden rounded-m pt-4">
          <Image 
            src={imageSrc} 
            alt={name} 
            className="h-full w-full object-cover"
            width={0}
            height={0}
            sizes="100vw"
          />
        </div>
      </CardContent>
    </Card>
  );
}
