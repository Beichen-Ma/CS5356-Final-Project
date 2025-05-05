import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Create a unique file name
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get the file extension
    const originalName = file.name;
    const fileExtension = originalName.split(".").pop();

    // Generate a unique filename
    const fileName = `${uuidv4()}.${fileExtension}`;
    const filePath = `/uploads/${fileName}`;

    // Write the file to the public directory (this will be accessible via the web)
    const publicPath = join(process.cwd(), "public", "uploads");
    await writeFile(join(publicPath, fileName), buffer);

    // Return the path where the file can be accessed
    return NextResponse.json({ success: true, filePath });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
