'use client';

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from 'date-fns';

// Define the shape of the data we expect from the database
interface ActivityItem {
    HistoryID: number;
    ChangeType: string;
    ChangeTime: Date;
    User: {
        UserName: string;
    };
    Task: {
        Title: string;
    };
}

interface RecentActivityProps {
    activities: ActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
    if (activities.length === 0) {
        return (
            <div className="text-sm text-muted-foreground pl-2">
                No recent activity found.
            </div>
        );
    }

    return (
        <div className="relative space-y-8 pl-10 before:absolute before:left-4 before:top-2 before:h-full before:w-[1px] before:bg-border">
            {activities.map((activity) => {
                // Generate initials from UserName
                const initials = activity.User.UserName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2);

                return (
                    <div key={activity.HistoryID} className="relative pl-6">
                        <Avatar className="absolute -left-0 top-0 h-9 w-9 border border-background">
                            <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1 ml-4">
                            <p className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">
                                    {activity.User.UserName}
                                </span>{" "}
                                {activity.ChangeType.toLowerCase()}{" "}
                                <span className="font-medium text-foreground">
                                    {activity.Task.Title}
                                </span>
                            </p>
                            <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(activity.ChangeTime), { addSuffix: true })}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}