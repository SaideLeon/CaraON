import type { Organization } from '@/lib/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Briefcase, Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Briefcase className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="font-headline text-xl truncate" title={organization.name}>{organization.name}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground truncate">ID: {organization.id}</CardDescription>
          </div>
        </div>
      </CardHeader>
       <CardContent className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground truncate">ID da Instância: {organization.instanceId}</p>
        <Button asChild variant="outline" size="sm">
            <Link href="#">
                Gerir
                <LinkIcon className="ml-2 h-4 w-4"/>
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
