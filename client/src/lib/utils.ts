import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Chuyển đổi đường dẫn tương đối thành URL đầy đủ cho ảnh
 * @param relativePath - Đường dẫn tương đối từ server (vd: /uploads/dishes/image.jpg)
 * @returns URL đầy đủ hoặc placeholder nếu không có ảnh
 */
export function getImageUrl(relativePath?: string): string {
  if (!relativePath) {
    return '/placeholder.jpg';
  }
  
  // Lấy API URL và loại bỏ /api để có base URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, ''); // Loại bỏ /api ở cuối
  
  // Đảm bảo không có dấu / thừa khi ghép URL
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanPath = relativePath.startsWith('/') ? relativePath : `/${relativePath}`;
  
  return `${cleanBaseUrl}${cleanPath}`;
}
