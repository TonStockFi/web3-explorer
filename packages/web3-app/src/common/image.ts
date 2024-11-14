import { onAction } from "./electron";

export function downloadImage(image:Blob,name:string){
  const data = URL.createObjectURL(image);

  const link = document.createElement('a');
  link.href = data;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(data);
}

export function resizeImage(
    imgUrl: string,
    width: number,
    height: number,
    quality: number = 0.8 // Default quality set to 80%

  ): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = imgUrl;
  
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
  
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to convert canvas to Blob'));
            }
          }, 'image/jpeg',quality); // Specify the format, e.g., 'image/jpeg' or 'image/png'
      };
  
      img.onerror = (error) => {
        reject(new Error('Failed to load image: ' + error));
      };
    });
  }
  
  export async function copyBlobToClipboard(blob: Blob): Promise<boolean> {
    try {
      // Convert Blob to File
      const file = new File([blob], 'image.jpg', { type: blob.type });
      // Create a new ClipboardItem
      const clipboardItem = new ClipboardItem({ [file.type]: file });
      // Write to the clipboard
      await navigator.clipboard.write([clipboardItem]);
      console.log('Image copied to clipboard successfully!');
      return true;
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
      return false;
    }
  }
  
  async function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
  
  export async function copyImageToClipboard(blob: Blob): Promise<void> {
    try {
      const dataUrl = await blobToDataUrl(blob);
  
      // Create an HTML image element to hold the data URL
      const img = new Image();
      img.src = dataUrl;
  
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }
  
      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
  
        // Copy to clipboard using the Clipboard API
        canvas.toBlob(async (canvasBlob) => {
          if (canvasBlob) {
            const file = new File([canvasBlob], 'image.png', { type: 'image/png' });
            if(0 && window.ClipboardItem){
              const clipboardItem = new ClipboardItem({ [file.type]: file });
              await navigator.clipboard.write([clipboardItem]);
              console.log('Image copied to clipboard successfully!');
            }else if(window.backgroundApi){
              const base64Data = await blobToDataUrl(canvasBlob);
              await onAction("copyImageDataUrlToClipBoard",{base64Data})
            }else{
              throw new Error('clipboard is not valid');

            }
          } else {
            throw new Error('Failed to convert canvas to Blob');
          }
        }, 'image/png'); // Use PNG for better compatibility
      };
  
      img.onerror = (error) => {
        throw new Error('Failed to load image: ' + error);
      };
  
    } catch (error) {
      console.error('Failed to copy image to clipboard:', error);
    }
  }
  