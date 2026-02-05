import { AnalyticsView } from "@/components/analytics/analytics-view"

async function getAnalyticsData() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))

    // Mock Data
    return {
        kpi: [
            {
                label: "Total Tasks Completed",
                value: 1284,
                change: "+12%",
                trend: "up" as const,
                icon: "CheckCircle"
            },
            {
                label: "On-Time Completion Rate",
                value: "94%",
                change: "+2.5%",
                trend: "up" as const,
                icon: "TrendingUp"
            },
            {
                label: "Active Projects",
                value: 12,
                change: "0%",
                trend: "neutral" as const,
                icon: "Activity"
            },
            {
                label: "Team Velocity",
                value: "45 tasks/wk",
                change: "-5%",
                trend: "down" as const,
                icon: "Users"
            }
        ],
        completionTrend: [
            { date: "2026-01-25", tasks: 12 },
            { date: "2026-01-26", tasks: 15 },
            { date: "2026-01-27", tasks: 18 },
            { date: "2026-01-28", tasks: 10 },
            { date: "2026-01-29", tasks: 22 },
            { date: "2026-01-30", tasks: 28 },
            { date: "2026-01-31", tasks: 19 },
            { date: "2026-02-01", tasks: 25 },
            { date: "2026-02-02", tasks: 32 },
            { date: "2026-02-03", tasks: 30 }
        ],
        projectStatus: [
            { name: "On Track", value: 8 },
            { name: "At Risk", value: 2 },
            { name: "Delayed", value: 1 },
            { name: "Completed", value: 5 }
        ],
        teamWorkload: [
            { name: "Alex", activeTasks: 8 },
            { name: "Sarah", activeTasks: 12 },
            { name: "Mike", activeTasks: 5 },
            { name: "Emily", activeTasks: 9 },
            { name: "David", activeTasks: 7 }
        ]
    }
}

export default async function AnalyticsPage() {
    const data = await getAnalyticsData()

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <AnalyticsView data={data} />
        </div>
    )
}
