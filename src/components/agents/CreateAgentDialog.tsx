'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { Agent, Instance, Organization } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import api from '@/services/api';

const agentSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters.'),
  flowId: z.string().min(1, 'Flow ID is required.'),
  persona: z.string().min(10, 'Persona must be at least 10 characters.'),
  instanceId: z.string({ required_error: 'Please select an instance.' }),
  organizationId: z.string({ required_error: 'Please select an organization.' }).optional(),
});

type AgentFormValues = z.infer<typeof agentSchema>;

interface CreateAgentDialogProps {
  children: ReactNode;
  onAgentCreated: (agent: Agent) => void;
}

export function CreateAgentDialog({ children, onAgentCreated }: CreateAgentDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingInstances, setLoadingInstances] = useState(false);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentSchema),
    defaultValues: {
      name: '',
      flowId: 'GREETFLOW', // Default value as per docs
      persona: '',
    },
  });

  const selectedInstanceId = form.watch('instanceId');

  useEffect(() => {
    const fetchInstances = async () => {
      if (open) {
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
      }
    };
    fetchInstances();
  }, [open, toast]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (selectedInstanceId) {
        setLoadingOrgs(true);
        form.setValue('organizationId', undefined); // Reset org selection
        setOrganizations([]);
        try {
          const response = await api.get(`/instances/${selectedInstanceId}/organizations`);
          setOrganizations(response.data);
        } catch (error) {
           toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not load organizations for this instance.',
          });
        } finally {
          setLoadingOrgs(false);
        }
      }
    }
    fetchOrganizations();
  }, [selectedInstanceId, form, toast]);

  const onSubmit = async (data: AgentFormValues) => {
    setLoading(true);
    try {
      const payload: any = { ...data };
      if (!payload.organizationId) {
        delete payload.organizationId;
      }
      
      const response = await api.post('/agents', payload);
      const newAgent: Agent = response.data;
      
      toast({
        title: 'Agent Created',
        description: `Agent "${newAgent.name}" has been successfully created.`,
      });
      onAgentCreated(newAgent);
      setOpen(false);
      form.reset();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create agent.';
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline">Create New AI Agent</DialogTitle>
          <DialogDescription>
            Fill in the details below to configure your new agent.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Agent Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Sales Assistant" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="persona"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Persona</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe the agent's personality and role. e.g., A friendly and helpful assistant..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
               <FormField
                  control={form.control}
                  name="instanceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instance</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={loadingInstances}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingInstances ? 'Loading...' : 'Select an instance'} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {instances.map((instance) => (
                            <SelectItem key={instance.id} value={instance.id}>
                              {instance.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value} disabled={!selectedInstanceId || loadingOrgs}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={
                                !selectedInstanceId ? "Select instance first" :
                                loadingOrgs ? "Loading..." : "Select an organization"
                            } />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {organizations.map((org) => (
                            <SelectItem key={org.id} value={org.id}>
                              {org.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
             <FormField
                control={form.control}
                name="flowId"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Flow ID</FormLabel>
                    <FormControl>
                        <Input {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
             />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Agent
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
