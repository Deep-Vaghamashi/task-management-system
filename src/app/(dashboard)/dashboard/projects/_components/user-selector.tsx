"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, ChevronsUpDown, X, Search, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface User {
    UserID: number;
    UserName: string;
    Email: string;
    Role: string;
}

interface UserSelectorProps {
    selectedUserIds: number[];
    onSelectionChange: (ids: number[]) => void;
}

const ROLE_COLORS: Record<string, string> = {
    Admin: 'bg-red-500/10 text-red-600 border-red-200',
    Manager: 'bg-blue-500/10 text-blue-600 border-blue-200',
    Employee: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
};

function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function UserSelector({ selectedUserIds, onSelectionChange }: UserSelectorProps) {
    const [open, setOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('/api/users');
                setUsers(response.data);
            } catch (error) {
                console.error("Failed to fetch users", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleSelect = (userId: number) => {
        if (selectedUserIds.includes(userId)) {
            onSelectionChange(selectedUserIds.filter((id) => id !== userId));
        } else {
            onSelectionChange([...selectedUserIds, userId]);
        }
    };

    const handleClearAll = () => {
        onSelectionChange([]);
    };

    const selectedUsers = users.filter((user) => selectedUserIds.includes(user.UserID));

    return (
        <div className="flex flex-col gap-3">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between font-normal h-10"
                    >
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {selectedUserIds.length > 0
                                ? `${selectedUserIds.length} member${selectedUserIds.length !== 1 ? 's' : ''} selected`
                                : "Select team members..."}
                        </div>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[420px] p-0" align="start">
                    <Command>
                        <CommandInput placeholder="Search by name or email..." />
                        <CommandList>
                            <CommandEmpty>
                                {loading ? (
                                    <div className="flex items-center justify-center py-4">
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Loading users...
                                    </div>
                                ) : (
                                    "No users found."
                                )}
                            </CommandEmpty>
                            <CommandGroup heading="Team Members">
                                {users.map((user) => {
                                    const isSelected = selectedUserIds.includes(user.UserID);
                                    const roleColor = ROLE_COLORS[user.Role] || ROLE_COLORS['Employee'];

                                    return (
                                        <CommandItem
                                            key={user.UserID}
                                            value={`${user.UserName} ${user.Email}`}
                                            onSelect={() => handleSelect(user.UserID)}
                                            className="py-2.5"
                                        >
                                            <div className={cn(
                                                "flex items-center justify-center w-5 h-5 rounded border mr-3 transition-colors shrink-0",
                                                isSelected
                                                    ? "bg-primary border-primary text-primary-foreground"
                                                    : "border-muted-foreground/30"
                                            )}>
                                                {isSelected && <Check className="h-3.5 w-3.5" />}
                                            </div>
                                            <Avatar className="h-7 w-7 mr-2.5 shrink-0">
                                                <AvatarFallback className="text-[10px] bg-muted">
                                                    {getInitials(user.UserName)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col flex-1 min-w-0">
                                                <span className="text-sm font-medium truncate">{user.UserName}</span>
                                                <span className="text-[11px] text-muted-foreground truncate">{user.Email}</span>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={cn("text-[10px] h-5 ml-2 shrink-0", roleColor)}
                                            >
                                                {user.Role}
                                            </Badge>
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        </CommandList>

                        {/* Footer with count and actions */}
                        {selectedUserIds.length > 0 && (
                            <>
                                <Separator />
                                <div className="flex items-center justify-between px-3 py-2">
                                    <span className="text-xs text-muted-foreground">
                                        {selectedUserIds.length} selected
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs text-muted-foreground hover:text-destructive"
                                        onClick={handleClearAll}
                                    >
                                        Clear all
                                    </Button>
                                </div>
                            </>
                        )}
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Selected Users Display */}
            {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedUsers.map((user) => (
                        <Badge
                            key={user.UserID}
                            variant="secondary"
                            className="pl-1.5 pr-1 py-1 flex items-center gap-1.5 hover:bg-secondary/80 transition-colors"
                        >
                            <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                                    {getInitials(user.UserName)}
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-xs">{user.UserName}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 ml-0.5 hover:bg-transparent text-muted-foreground hover:text-destructive transition-colors"
                                onClick={() => handleSelect(user.UserID)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    ))}
                </div>
            )}
        </div>
    );
}
