'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import { CreateOrganizationDialog } from '@/components/organizations/CreateOrganizationDialog';
import type { Organization, Instance } from '@/lib/types';
import { OrganizationCard } from '@/components/organizations/OrganizationCard';
import api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [loadingInstances, setLoadingInstances] = useState(true);
  const [loadingOrganizations, setLoadingOrganizations] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchInstances = async () => {
      setLoadingInstances(true);
      try {
        const response = await api.get('/user/instances');
        setInstances(response.data);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not load your instances.',
        });
      } finally {
        setLoadingInstances(false);
      }
    };
    fetchInstances();
  }, [toast]);

  const handleInstanceChange = async (instanceId: string) => {
    setSelectedInstance(instanceId);
    setLoadingOrganizations(true);
    setOrganizations([]);
    try {
      const response = await api.get(`/instances/${instanceId}/organizations`);
      setOrganizations(response.data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not load organizations for this instance.',
      });
    } finally {
      setLoadingOrganizations(false);
    }
  };

  const handleOrganizationCreated = (newOrganization: Organization) => {
    if (newOrganization.instanceId === selectedInstance) {
        setOrganizations(prev => [...prev, newOrganization]);
    } else {
        toast({
            title: 'Organization Created',
            description: `Select instance ${instances.find(i => i.id === newOrganization.instanceId)?.name} to see your new organization.`
        })
    }
  };

  return (
    <div className="space-y-6">
        <Card>
            <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                    <h2 className="text-lg font-medium">Select an Instance</h2>
                    <p className="text-sm text-muted-foreground">Choose an instance to view and manage its organizations.</p>
                </div>
                <Select onValueChange={handleInstanceChange} disabled={loadingInstances}>
                    <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder={loadingInstances ? 'Loading instances...' : 'Select an instance'} />
                    </SelectTrigger>
                    <SelectContent>
                    {instances.map((instance) => (
                        <SelectItem key={instance.id} value={instance.id}>
                        {instance.name}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>

      {loadingOrganizations && (
         <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading organizations...</p>
        </div>
      )}

      {!loadingOrganizations && selectedInstance && organizations.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {organizations.map(org => <OrganizationCard key={org.id} organization={org} />)}
        </div>
      )}

      {!loadingOrganizations && selectedInstance && organizations.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h3 className="text-xl font-semibold">No organizations found for this instance</h3>
          <p className="text-muted-foreground mt-2">
            Get started by creating your first organization.
          </p>
          <CreateOrganizationDialog onOrganizationCreated={handleOrganizationCreated}>
             <Button className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
          </CreateOrganizationDialog>
        </div>
      )}

       {!selectedInstance && !loadingOrganizations && (
         <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h3 className="text-xl font-semibold">Please select an instance</h3>
            <p className="text-muted-foreground mt-2">
                Select an instance from the dropdown above to manage its organizations.
            </p>
         </div>
       )}
    </div>
  );
}
