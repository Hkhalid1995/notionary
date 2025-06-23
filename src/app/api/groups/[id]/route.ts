import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "../../../../lib/prisma";

// Update a group
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { name, color, workspaceId } = await request.json();

    // Check if group exists and belongs to user
    const existingGroup = await prisma.group.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    const updatedGroup = await prisma.group.update({
      where: { id },
      data: {
        name,
        color,
        workspaceId: workspaceId || null,
      },
      include: {
        workspace: true,
      },
    });

    return NextResponse.json(updatedGroup);
  } catch (error) {
    console.error("Error updating group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Delete a group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if group exists and belongs to user
    const existingGroup = await prisma.group.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingGroup) {
      return NextResponse.json(
        { error: "Group not found" },
        { status: 404 }
      );
    }

    await prisma.group.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Group deleted successfully" });
  } catch (error) {
    console.error("Error deleting group:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 