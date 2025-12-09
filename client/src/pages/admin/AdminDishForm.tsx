import { AdminLayout } from '@/components/admin/AdminLayout';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Clock, Trash2, Plus, Loader2, Save, X } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { NavLink } from 'react-router-dom';
import { IDish, Ingredient, MultilingualText } from '../../../../shared/types';
import { createDishClientSchema, updateDishClientSchema } from '@/validators/dish.client';
import { createDish, getDishByIdAdmin, updateDish, uploadDishImages } from '@/services/dishService';

type CreateDishPayload = z.infer<typeof createDishClientSchema>;
type UpdateDishPayload = z.infer<typeof updateDishClientSchema>;

interface DishFormState {
  name: MultilingualText;
  description: MultilingualText;
  images: string[];
  ingredients: Ingredient[];
  category: string;
  region: string;
  cookingTime: number;
}

const CATEGORIES = ['Phở', 'Bánh', 'Cơm', 'Bún', 'Gỏi', 'Lẩu', 'Chè', 'Khác'];
const REGIONS = ['Miền Bắc', 'Miền Trung', 'Miền Nam'];

export const AdminDishForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = useMemo(() => !!id, [id]);

  const [formData, setFormData] = useState<DishFormState>({
    name: { ja: '', vi: '' },
    description: { ja: '', vi: '' },
    images: [],
    ingredients: [{ name: '', quantity: '' }],
    category: CATEGORIES[0],
    region: REGIONS[0],
    cookingTime: 30,
  });
  const [formError, setFormError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // --- Fetch Existing Data for Edit ---
  const { data: dishData, isLoading: isDishLoading } = useQuery({
    queryKey: ['adminDish', id],
    queryFn: () => getDishByIdAdmin(id!),
    enabled: isEdit,
    select: (data) => data.dish as IDish,
  });

  useEffect(() => {
    if (isEdit && dishData) {
      setFormData({
        name: dishData.name,
        description: dishData.description,
        images: dishData.images,
        ingredients:
          dishData.ingredients.length > 0 ? dishData.ingredients : [{ name: '', quantity: '' }],
        category: dishData.category,
        region: dishData.region,
        cookingTime: dishData.cookingTime,
      });
    }
  }, [isEdit, dishData]);

  // --- Mutations ---
  const uploadMutation = useMutation({
    mutationFn: (data: FormData) => uploadDishImages(data),
  });

  const dishMutation = useMutation({
    mutationFn: (data: CreateDishPayload | UpdateDishPayload) => {
      if (isEdit) {
        return updateDish(id!, data);
      }
      return createDish(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminDishes'] });
      alert(`Món ăn "${data.name.vi}" đã được ${isEdit ? 'cập nhật' : 'tạo mới'} thành công.`);
      navigate('/admin/dishes');
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error?.details
          ?.map((d: any) => `${d.field}: ${d.message}`)
          .join('; ') || 'Lỗi xử lý dữ liệu.';
      setFormError(`Lỗi hệ thống/Validation: ${msg}`);
    },
  });

  const isSubmitting = dishMutation.isPending || uploadMutation.isPending;

  // --- Handlers ---
  const handleInputChange = (
    field: keyof DishFormState,
    value: any,
    lang?: 'ja' | 'vi',
    index?: number,
    subfield?: keyof Ingredient
  ) => {
    setFormData((prev) => {
      if (lang) {
        return { ...prev, [field]: { ...(prev[field] as MultilingualText), [lang]: value } };
      }
      if (index !== undefined && subfield) {
        const newIngredients = [...prev.ingredients];
        // Xử lý chuyển đổi cookingTime (nếu cần)
        if (field === 'cookingTime') {
          return { ...prev, cookingTime: value };
        }
        newIngredients[index] = { ...newIngredients[index], [subfield]: value };
        return { ...prev, ingredients: newIngredients };
      }

      // Xử lý cookingTime như number
      if (field === 'cookingTime') {
        return { ...prev, cookingTime: parseInt(value) || 0 };
      }

      return { ...prev, [field]: value };
    });
  };

  const handleAddIngredient = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', quantity: '' }],
    }));
  };

  const handleRemoveIngredient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Giữ lại tối đa 5 file mới
      setImageFiles(Array.from(e.target.files).slice(0, 5));
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // 1. Prepare Data for Upload and Validation (Không bao gồm images tạm thời)
    const dataToValidate = {
      ...formData,
      ingredients: formData.ingredients.filter((ing) => ing.name.trim() && ing.quantity.trim()),
      cookingTime: Number(formData.cookingTime),
    };

    try {
      let finalImageUrls = formData.images;

      // 2. Upload New Files (Luôn chạy trước Zod Validation)
      if (imageFiles.length > 0) {
        const uploadFormData = new FormData();
        imageFiles.forEach((file) => uploadFormData.append('images', file));

        const uploadedUrls = await uploadMutation.mutateAsync(uploadFormData);
        finalImageUrls = [...formData.images, ...uploadedUrls];
      }

      // 3. Chuẩn bị Final Data (Có đủ URLs)
      const finalData = { ...dataToValidate, images: finalImageUrls };

      // 4. Validation Frontend (Zod)
      const clientSchema = isEdit ? updateDishClientSchema : createDishClientSchema;
      const validatedData = clientSchema.parse(finalData);

      // 5. Submit Dish Data
      await dishMutation.mutateAsync(validatedData as CreateDishPayload | UpdateDishPayload);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errorDetails = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        setFormError(`Lỗi Validation: ${errorDetails}`);
      } else {
        setFormError(`Lỗi hệ thống: ${err.message || 'Không thể lưu món ăn.'}`);
      }
    }
  };

  if (isDishLoading) {
    return (
      <AdminLayout title={isEdit ? 'Đang tải món ăn...' : 'Tạo mới món ăn'}>
        <p>Đang tải...</p>
      </AdminLayout>
    );
  }

  const pageTitle = isEdit ? `Sửa Món Ăn: ${formData.name.vi}` : 'Tạo Món Ăn Mới';

  return (
    <AdminLayout title={pageTitle}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
          <div className="flex gap-3">
            <NavLink to="/admin/dishes">
              <Button type="button" variant="outline" disabled={isSubmitting}>
                <X className="w-4 h-4 mr-2" /> Hủy
              </Button>
            </NavLink>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {isEdit ? 'Cập Nhật' : 'Tạo Món Ăn'}
            </Button>
          </div>
        </div>

        {formError && <Alert type="error" message={formError} />}

        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tên Món Ăn */}
            <Label>Tên (Tiếng Việt)</Label>
            <Input
              value={formData.name.vi}
              onChange={(e) => handleInputChange('name', e.target.value, 'vi')}
            />
            <Label>Tên (Tiếng Nhật)</Label>
            <Input
              value={formData.name.ja}
              onChange={(e) => handleInputChange('name', e.target.value, 'ja')}
            />

            {/* Mô tả */}
            <Label>Mô tả (Tiếng Việt)</Label>
            <Textarea
              value={formData.description.vi}
              onChange={(e) => handleInputChange('description', e.target.value, 'vi')}
            />
            <Label>Mô tả (Tiếng Nhật)</Label>
            <Textarea
              value={formData.description.ja}
              onChange={(e) => handleInputChange('description', e.target.value, 'ja')}
            />

            {/* Category & Region & Cooking Time */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Danh Mục</Label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full h-10 border rounded-md p-2 bg-background"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Vùng Miền</Label>
                <select
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  className="w-full h-10 border rounded-md p-2 bg-background"
                >
                  {REGIONS.map((reg) => (
                    <option key={reg} value={reg}>
                      {reg}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Thời gian nấu (phút)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={formData.cookingTime}
                    onChange={(e) => handleInputChange('cookingTime', e.target.value)}
                    className="pr-12"
                  />
                  <Clock className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients Section */}
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Nguyên liệu</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient}>
              <Plus className="w-4 h-4 mr-2" /> Thêm
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.ingredients.map((ing, index) => (
              <div key={index} className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label>Tên Nguyên liệu</Label>
                  <Input
                    value={ing.name}
                    onChange={(e) =>
                      handleInputChange('ingredients', e.target.value, undefined, index, 'name')
                    }
                  />
                </div>
                <div className="flex-1">
                  <Label>Số lượng/Đơn vị</Label>
                  <Input
                    value={ing.quantity}
                    onChange={(e) =>
                      handleInputChange('ingredients', e.target.value, undefined, index, 'quantity')
                    }
                  />
                </div>
                {formData.ingredients.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon-sm"
                    onClick={() => handleRemoveIngredient(index)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Images Section */}
        <Card>
          <CardHeader>
            <CardTitle>Hình ảnh</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Chọn tệp ảnh (Max 5MB)</Label>
              <Input
                id="image-upload"
                type="file"
                multiple
                onChange={handleFileChange}
                accept="image/jpeg,image/png,image/webp"
              />
            </div>

            {/* Images Preview & Management */}
            {(formData.images.length > 0 || imageFiles.length > 0) && (
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                {/* Existing Images (with delete button) */}
                {formData.images.map((url, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 border rounded-md overflow-hidden group"
                  >
                    <img
                      src={url}
                      alt={`Ảnh cũ ${index}`}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.src = '/placeholder.jpg')}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon-sm"
                      className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(index)}
                      title="Xóa ảnh cũ"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                ))}

                {/* New Preview (Mới) */}
                {imageFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 border rounded-md overflow-hidden group"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover opacity-60"
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground bg-white/70">
                      Mới
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </AdminLayout>
  );
};
