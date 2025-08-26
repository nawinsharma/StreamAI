import { v2 as cloudinary } from 'cloudinary';

// Check if Cloudinary is configured
const isCloudinaryConfigured = () => {
  return process.env.CLOUDINARY_CLOUD_NAME && 
         process.env.CLOUDINARY_API_KEY && 
         process.env.CLOUDINARY_API_SECRET;
};

// Configure Cloudinary
if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  width: number;
  height: number;
}

export async function uploadImageToCloudinary(
  imageData: string,
  folder: string = 'ai-generated-images'
): Promise<CloudinaryUploadResult> {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured()) {
      throw new Error("Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.");
    }

    let uploadData: string;
    
    // Handle different data URL formats
    if (imageData.startsWith('data:image/svg+xml;base64,')) {
      // For SVG data, we need to convert it to a format Cloudinary can handle
      const svgBase64 = imageData.replace('data:image/svg+xml;base64,', '');
      const svgContent = Buffer.from(svgBase64, 'base64').toString('utf-8');
      
      // Convert SVG to a data URL that Cloudinary can process
      uploadData = `data:image/svg+xml;base64,${Buffer.from(svgContent).toString('base64')}`;
    } else if (imageData.startsWith('data:image/')) {
      // For other image formats, use as is
      uploadData = imageData;
    } else {
      // If it's already base64 without data URL prefix, add it
      uploadData = `data:image/png;base64,${imageData}`;
    }
    
    const result = await cloudinary.uploader.upload(
      uploadData,
      {
        folder: folder,
        resource_type: 'image',
        format: 'png',
        transformation: [
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      }
    );

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    if (!isCloudinaryConfigured()) {
      console.warn("Cloudinary not configured, skipping image deletion");
      return;
    }
    
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    // Don't throw error for deletion failures as they're not critical
  }
} 

export async function uploadAnyToCloudinary(params: {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  folder?: string;
}): Promise<CloudinaryUploadResult & { resource_type: string } & { original_filename?: string }> {
  try {
    if (!isCloudinaryConfigured()) {
      throw new Error("Cloudinary is not configured. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to your environment variables.");
    }

    const { buffer, filename, mimeType, folder = 'user-uploads' } = params;

    const isImage = mimeType.startsWith('image/');

    const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      resource_type: isImage ? 'image' : 'raw',
      folder,
      public_id: filename.replace(/\.[^/.]+$/, ''),
      use_filename: true,
      unique_filename: true,
      overwrite: false,
    });

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      format: result.format as string,
      width: (result as { width?: number }).width as number,
      height: (result as { height?: number }).height as number,
      resource_type: (result as { resource_type: string }).resource_type,
      original_filename: (result as { original_filename?: string }).original_filename,
    };
  } catch (error) {
    console.error('Error uploading (any) to Cloudinary:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 