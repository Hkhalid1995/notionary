import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "../../../lib/prisma";

// Get all notes for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');
    const groupId = searchParams.get('groupId');

    const where: any = {
      userId: session.user.id,
    };

    if (workspaceId) {
      where.workspaceId = workspaceId;
    }

    if (groupId) {
      where.groupId = groupId;
    }

    const notes = await prisma.note.findMany({
      where,
      include: {
        workspace: true,
        group: true,
      },
      orderBy: [
        { isPinned: 'desc' },
        { order: 'asc' },
        { updatedAt: 'desc' }
      ],
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Create a new note
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { title, content, color, workspaceId, groupId } = await request.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        title,
        content: content || "",
        color: color || "#4F46E5",
        userId: session.user.id,
        workspaceId: workspaceId || null,
        groupId: groupId || null,
      },
      include: {
        workspace: true,
        group: true,
      },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("Error creating note:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 