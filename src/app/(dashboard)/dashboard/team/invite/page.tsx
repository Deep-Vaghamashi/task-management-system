'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '@/lib/axios';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, Mail, ArrowLeft, ShieldAlert, UserPlus } from 'lucide-react';
import Link from 'next/link';

// Role options with descriptions
const roleOptions = [
  { value: 'Employee', label: 'Employee', description: 'Can view and work on assigned tasks' },
  { value: 'Team Lead', label: 'Team Lead', description: 'Can manage tasks within assigned projects' },
  { value: 'Manager', label: 'Manager', description: 'Full access to create projects and invite members' },
  { value: 'Viewer', label: 'Viewer', description: 'Read-only access to projects and tasks' },
];

export default function InviteMemberPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null); // null = checking
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: 'Employee'
  });

  // Client-side role check on mount
  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data?.Role === 'Manager') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
          toast.error("Only Managers can invite team members.");
          setTimeout(() => router.push('/dashboard'), 1500);
        }
      } catch (error) {
        setIsAuthorized(false);
        router.push('/login');
      }
    };
    checkRole();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter the member's name.");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Please enter an email address.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post('/api/team/invite', formData);

      toast.success("Invitation sent successfully!", {
        description: `An email has been sent to ${formData.email}`,
      });

      // If email failed, show the join URL fallback
      if (res.data?.joinUrl) {
        toast.info("Email delivery failed. Share this link manually:", {
          description: res.data.joinUrl,
          duration: 15000,
        });
      }

      router.push('/dashboard');
      router.refresh();

    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to send invitation");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while checking role
  if (isAuthorized === null) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Unauthorized state
  if (isAuthorized === false) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-8 pb-8 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="text-lg font-semibold">Access Restricted</h3>
            <p className="text-sm text-muted-foreground">
              Only users with the Manager role can invite team members.
            </p>
            <Link href="/dashboard">
              <Button variant="outline" className="mt-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Invite New Team Member</CardTitle>
              <CardDescription>
                They&apos;ll receive an email with a link to set up their account.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Jane Doe"
                required
                disabled={isLoading}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@example.com"
                  className="pl-8"
                  required
                  disabled={isLoading}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex flex-col">
                        <span>{option.label}</span>
                        <span className="text-xs text-muted-foreground">{option.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Invite...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}