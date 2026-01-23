import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Building2, MapPin, Database } from "lucide-react";
import type { EntityResult } from "@/types";

interface EntitiesCardProps {
    entities: EntityResult;
}

export default function EntitiesCard({ entities }: EntitiesCardProps) {
    if (!entities) return null;

    const renderSection = (title: string, items: string[] = [], icon: React.ReactNode, colorClass: string) => {
        if (!items.length) return null;
        return (
            <div className="space-y-2">
                <h4 className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${colorClass}`}>
                    {icon} {title}
                </h4>
                <div className="flex flex-wrap gap-2">
                    {items.slice(0, 15).map((item, i) => ( // Limit to 15
                        <span key={i} className="px-2 py-1 bg-background border rounded text-xs font-medium hover:bg-muted transition-colors cursor-default">
                            {item}
                        </span>
                    ))}
                    {items.length > 15 && <span className="text-xs text-muted-foreground">+{items.length - 15} more</span>}
                </div>
            </div>
        );
    };

    return (
        <Card className="bg-card/50 shadow-sm transition-all hover:shadow-md h-full">
            <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary">
                    <Database className="w-4 h-4" /> Extracted Entities (NER)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {renderSection("People", entities.PER, <Users className="w-3 h-3" />, "text-pink-500")}
                {renderSection("Organizations", entities.ORG, <Building2 className="w-3 h-3" />, "text-blue-500")}
                {renderSection("Locations", entities.LOC, <MapPin className="w-3 h-3" />, "text-green-500")}
                {/* Fallback if empty */}
                {!entities.PER?.length && !entities.ORG?.length && !entities.LOC?.length && (
                    <div className="text-sm text-muted-foreground italic">No entities detected in the text sample.</div>
                )}
            </CardContent>
        </Card>
    );
}
