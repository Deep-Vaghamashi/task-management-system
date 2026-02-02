import { Progress } from "@/components/ui/progress"

export function ProjectStatusDistribution() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">On Track</span>
                    <span className="text-muted-foreground">12/15</span>
                </div>
                <Progress value={80} className="h-2" />
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">At Risk</span>
                    <span className="text-muted-foreground">2/15</span>
                </div>
                <Progress value={15} className="h-2 [&>div]:bg-yellow-500" /> {/* Custom color override if needed, but standard variant is safer. Using utility class on parent or indicator */}
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Delayed</span>
                    <span className="text-muted-foreground">1/15</span>
                </div>
                <Progress value={6} className="h-2 [&>div]:bg-red-500" />
            </div>
        </div>
    )
}
