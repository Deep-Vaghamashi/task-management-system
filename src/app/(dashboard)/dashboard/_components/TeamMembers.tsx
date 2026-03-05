import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface TeamMember {
    name: string;
    role: string;
    initials: string;
}

interface TeamMembersProps {
    members: TeamMember[];
}

export function TeamMembers({ members }: TeamMembersProps) {
    if (!members || members.length === 0) {
        return (
            <div className="text-center py-6 text-muted-foreground text-sm">
                No team members yet. Invite someone to get started!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {members.map((member, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gradient-to-br from-violet-500/20 to-blue-500/20 text-primary text-xs font-semibold">
                            {member.initials}
                        </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1 flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
