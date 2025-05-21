import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file received' },
        { status: 400 }
      );
    }

    // Generate a unique filename
    const filename = `${nanoid()}-${file.name}`;
    
    // Upload to Vercel Blob
    const blob = await put(filename, file, {
      access: 'public',
    });

    // Return the URL of the uploaded file
    return NextResponse.json({
      url: blob.url,
      success: true
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Error uploading file' },
      { status: 500 }
    );
  }
} 