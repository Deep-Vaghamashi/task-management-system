import React from 'react';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { promises } from 'node:dns';

const prisma = new PrismaClient();

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = cookies();
  const token = (await cookieStore).get('token');
  const projectId = Number((await params).id);

  if (!token) return <div className="p-10">Please log in.</div>;

  let project = null;

  try {
    const decoded = verify(token.value, process.env.JWT_SECRET!) as any;
    
    // Fetching EVERYTHING: Project -> Lists -> Tasks
    project = await prisma.project.findUnique({
      where: { 
        ProjectID: projectId 
      },
      include: {
        TaskLists: {
          include: {
            Tasks: true // grabs the tasks inside each list
          }
        }
      }
    });

    // Security: Check if project exists and belongs to user
    if (!project || project.CreatedBy !== decoded.userId) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-red-500">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p>You do not have permission to view this project.</p>
          <Link href="/dashboard" className="mt-4 text-blue-600 hover:underline">Return to Dashboard</Link>
        </div>
      );
    }

  } catch (error) {
    console.error("Error loading project:", error);
    return <div>Error loading project.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:underline mb-2 inline-block">← Back to Dashboard</Link>
          <h1 className="text-3xl font-bold text-gray-800">{project.ProjectName}</h1>
          <p className="text-gray-600">{project.Description}</p>
        </div>
      </div>

      {/* THE BOARD (Horizontal Scroll for Lists) */}
      <div className="flex gap-6 overflow-x-auto pb-8">
        
        {/* Render Each List */}
        {project.TaskLists.map((list) => (
          <div key={list.ListID} className="min-w-[300px] bg-gray-200 rounded-lg p-4 flex flex-col max-h-[80vh]">
            <h3 className="font-bold text-gray-700 mb-3 flex justify-between">
              {list.ListName}
              <span className="text-xs bg-gray-300 px-2 py-1 rounded-full text-gray-600">{list.Tasks.length}</span>
            </h3>

            {/* Render Tasks inside the List */}
            <div className="space-y-3 overflow-y-auto flex-1 pr-2">
              {list.Tasks.map((task) => (
                <div key={task.TaskID} className="bg-white p-3 rounded shadow-sm hover:shadow-md cursor-pointer transition">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-800 text-sm">{task.Title}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                      ${task.Priority === 'High' ? 'bg-red-100 text-red-600' : 
                        task.Priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-green-100 text-green-700'}`}>
                      {task.Priority}
                    </span>
                  </div>
                  {task.DueDate && (
                    <div className="text-xs text-gray-400 mt-2">
                      Date: {new Date(task.DueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
              
              {list.Tasks.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-4 italic">No tasks yet</div>
              )}
            </div>
          </div>
        ))}

        {/* Placeholder for "Add List" button (Visual only for now) */}
        <div className="min-w-[300px] h-[50px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 cursor-not-allowed">
          + Add another list
        </div>

      </div>
    </div>
  );
}