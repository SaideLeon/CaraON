'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bot, Briefcase, LayoutGrid, LogOut, MessageCircleCode, User, MoreVertical } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from './ui/button';

export function SidebarNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
           <MessageCircleCode className="h-7 w-7 text-primary" />
           <span className="text-lg font-semibold font-headline">CaraON</span>
        </div>
        <SidebarTrigger />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/dashboard')} tooltip="Instâncias">
              <Link href="/dashboard">
                <LayoutGrid />
                <span>Instâncias</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/agents')} tooltip="Agentes">
              <Link href="/agents">
                <Bot />
                <span>Agentes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive('/organizations')} tooltip="Organizações">
              <Link href="/organizations">
                <Briefcase />
                <span>Organizações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="justify-start w-full h-auto px-2 py-2">
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                    <User className="h-4 w-4" />
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left group-data-[collapsible=icon]:hidden">
                                <span className="text-sm font-medium">{user?.name || 'Utilizador'}</span>
                                <span className="text-xs text-muted-foreground truncate">{user?.email || 'no-email@example.com'}</span>
                            </div>
                        </div>
                        <MoreVertical className="h-4 w-4 ml-2 group-data-[collapsible=icon]:hidden" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="end" className="w-56">
                <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{user?.name || 'Utilizador'}</p>
                        <p className="text-xs leading-none text-muted-foreground">{user?.email || 'no-email@example.com'}</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Configurações</DropdownMenuItem>
                <DropdownMenuItem>Suporte</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                    <LogOut className="mr-2 h-4 w-4"/>
                    <span>Sair</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
