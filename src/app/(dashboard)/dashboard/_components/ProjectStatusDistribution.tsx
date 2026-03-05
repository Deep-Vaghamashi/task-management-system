import { Progress } from "@/components/ui/progress"

interface ProjectStatusDistributionProps {
  active: number;
  onHold: number;
  completed: number;
}

export function ProjectStatusDistribution({ active, onHold, completed }: ProjectStatusDistributionProps) {
    const total = active + onHold + completed;

    // Helper to avoid dividing by zero if there are no projects
    const getPercentage = (value: number) => {
        if (total === 0) return 0;
        return Math.round((value / total) * 100);
    };

    return (
        <div className="space-y-6">
            {/* Active Projects */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Active (Running)</span>
                    <span className="text-muted-foreground">{active}/{total}</span>
                </div>
                <Progress value={getPercentage(active)} className="h-2" />
            </div>

            {/* On Hold Projects */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">On Hold</span>
                    <span className="text-muted-foreground">{onHold}/{total}</span>
                </div>
                {/* Note: We use a utility class or inline style for custom colors if your theme supports it */}
                <Progress value={getPercentage(onHold)} className="h-2 [&>div]:bg-yellow-500" />
            </div>

            {/* Completed Projects */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Completed</span>
                    <span className="text-muted-foreground">{completed}/{total}</span>
                </div>
                <Progress value={getPercentage(completed)} className="h-2 [&>div]:bg-green-500" />
            </div>
        </div>
    )
}