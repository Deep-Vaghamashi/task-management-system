import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
    {
        user: "Alice Smith",
        avatar: "/avatars/alice.png", // specific avatar path or fallback
        action: "commented on",
        target: "Marketing Campaign",
        time: "2 mins ago",
        initials: "AS"
    },
    {
        user: "Bob Jones",
        action: "uploaded 3 files to",
        target: "Website Redesign",
        time: "15 mins ago",
        initials: "BJ"
    },
    {
        user: "Charlie Day",
        action: "completed task",
        target: "Update dependencies",
        time: "1 hour ago",
        initials: "CD"
    },
    {
        user: "Dana White",
        action: "created project",
        target: "Q4 Roadmap",
        time: "3 hours ago",
        initials: "DW"
    },
    {
        user: "Evan Wright",
        action: "changed status of",
        target: "Homepage Hero",
        time: "5 hours ago",
        initials: "EW"
    }
]

export function RecentActivity() {
    return (
        <div className="relative space-y-8 pl-10 before:absolute before:left-4 before:top-2 before:h-full before:w-[1px] before:bg-border">
            {activities.map((activity, index) => (
                <div key={index} className="relative pl-6">
                    <Avatar className="absolute -left-0 top-0 h-9 w-9 border border-background">
                        <AvatarFallback>{activity.initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col space-y-1 ml-4">
                        <p className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">{activity.user}</span>{" "}
                            {activity.action}{" "}
                            <span className="font-medium text-foreground">{activity.target}</span>
                        </p>
                        <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                </div>
            ))}
        </div>
    )
}
