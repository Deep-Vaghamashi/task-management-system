import { KanbanBoard } from "@/components/tasks/kanban/kanban-board"
import { Task } from "@/components/tasks/columns"

// Mock data re-used for consistency
const tasks: Task[] = [
    {
        id: "1",
        code: "TASK-8782",
        title: "You can't compress the program without quantifying the open-source SSD pixel!",
        status: "In Progress",
        label: "Documentation",
        priority: "Medium",
    },
    {
        id: "2",
        code: "TASK-7878",
        title: "Try to calculate the EXE feed, maybe it will index the multi-byte pixel!",
        status: "Pending",
        label: "Documentation",
        priority: "Medium",
    },
    {
        id: "3",
        code: "TASK-7839",
        title: "We need to bypass the neural TCP card!",
        status: "Done",
        label: "Bug",
        priority: "High",
    },
    {
        id: "4",
        code: "TASK-5562",
        title: "The SAS interface is down, bypass the open-source pixel so we can back up the PNG bandwidth!",
        status: "Pending",
        label: "Feature",
        priority: "Medium",
    },
    {
        id: "5",
        code: "TASK-8686",
        title: "I'll parse the wireless SSL protocol, that should driver the API panel!",
        status: "In Progress",
        label: "Feature",
        priority: "Medium",
    },
    {
        id: "6",
        code: "TASK-1280",
        title: "Use the digital TLS panel, then you can transmit the haptic system!",
        status: "Done",
        label: "Bug",
        priority: "High",
    },
    {
        id: "7",
        code: "TASK-7262",
        title: "The UTF8 application is down, parse the neural bandwidth so we can back up the PNG firewall!",
        status: "Done",
        label: "Feature",
        priority: "High",
    },
    {
        id: "8",
        code: "TASK-1138",
        title: "Generating the driver won't do anything, we need to quantify the 1080p SMTP bandwidth!",
        status: "In Progress",
        label: "Feature",
        priority: "Medium",
    },
    {
        id: "9",
        code: "TASK-7184",
        title: "We need to program the back-end THX pixel!",
        status: "Pending",
        label: "Feature",
        priority: "Low",
    },
    {
        id: "10",
        code: "TASK-5160",
        title: "Calculating the bus won't do anything, we need to navigate the back-end JSON protocol!",
        status: "In Progress",
        label: "Documentation",
        priority: "High",
    },
]

export default function KanbanPage() {
    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4 p-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Weekly Scheduler</h2>
                    <p className="text-muted-foreground">
                        Drag tasks to schedule them for the week.
                    </p>
                </div>
            </div>
            <KanbanBoard initialTasks={tasks} />
        </div>
    )
}
