'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import type { Organization } from '@/lib/types';
import { CreateOrganizationDialog } from '@/components/organizations/CreateOrganizationDialog';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOrganizationCreated = (newOrganization: Organization) => {
    // In a real app, we would re-fetch the list of organizations
    // For now, we'll just log it until a GET endpoint is available
    console.log('New organization created:', newOrganization);
  };
  
  const closeDialog = () => {
    setIsDialogOpen(false);
  }

  return (
    <>
      {organizations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Organization cards would go here */}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No organizations found</h3>
          <p className="text-muted-foreground mt-2">
            Get started by creating your first organization.
          </p>
          <CreateOrganizationDialog
            onOrganizationCreated={handleOrganizationCreated}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          >
            <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Organization
            </Button>
          </CreateOrganizationDialog>
        </div>
      )}
    </>
  );
}
