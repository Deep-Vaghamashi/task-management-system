import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const members = [
    { name: "Sarah Connor", role: "Product Manager", initials: "SC" },
    { name: "Kyle Reese", role: "Lead Engineer", initials: "KR" },
    { name: "John Doe", role: "Designer", initials: "JD" },
    { name: "Jane Smith", role: "QA Engineer", initials: "JS" },
    { name: "Mike Johnson", role: "Developer", initials: "MJ" },
]

export function TeamMembers() {
    return (
        <div className="space-y-4">
            {members.map((member, i) => (
                <div key={i} className="flex items-center space-x-4">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{member.initials}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                </div>
            ))}
        </div>
    )
}
