import { AdminLayout } from '@/components/admin/AdminLayout';
import { Alert } from '@/components/Alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, X, Globe, MapPin, Search, Trash2, Plus } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRestaurant,
  updateRestaurant,
  uploadRestaurantImages,
  getRestaurantByIdAdmin,
} from '@/services/restaurantService';
import { getActiveDishesList, getAssignedDishesList } from '@/services/dishService';
import { z } from 'zod';
import {
  createRestaurantClientSchema,
  updateRestaurantClientSchema,
} from '@/validators/restaurant.client';
import { IDish, IRestaurant, Location } from '../../../../shared/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

// Định nghĩa types từ Zod Client Validator (Sử dụng cho cả Request và Mutation)
type CreateRestaurantPayload = z.infer<typeof createRestaurantClientSchema>;
type UpdateRestaurantPayload = z.infer<typeof updateRestaurantClientSchema>;

interface RestaurantFormState {
  name: string;
  address: string;
  location: Location;
  phone: string;
  website: string;
  images: string[];
  dishes: string[]; // Array of Dish IDs
}

const INITIAL_LOCATION: Location = { type: 'Point', coordinates: [106.7008, 10.7769] }; // HCMC

export const AdminRestaurantForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = useMemo(() => !!id, [id]);

  const [formData, setFormData] = useState<RestaurantFormState>({
    name: '',
    address: '',
    location: INITIAL_LOCATION,
    phone: '',
    website: '',
    images: [],
    dishes: [],
  });
  const [formError, setFormError] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  // State tìm kiếm món ăn (dùng cho API getUnassignedDishesList)
  const [dishSearchQuery, setDishSearchQuery] = useState('');

  // State để lưu trữ thông tin chi tiết của tất cả dishes (cho việc hiển thị)
  const [allDishesMap, setAllDishesMap] = useState<Map<string, IDish>>(new Map());

  // --- Fetch Data ---
  const { data: restaurantData, isLoading: isRestaurantLoading } = useQuery({
    queryKey: ['adminRestaurant', id],
    queryFn: () => getRestaurantByIdAdmin(id!),
    enabled: isEdit,
    select: (data) => data.restaurant as IRestaurant,
  });

  // Lấy danh sách dishes ĐÃ ĐƯỢC GÁN cho restaurant này
  const { data: assignedDishesResponse, isLoading: isAssignedDishesLoading } = useQuery({
    queryKey: ['assignedDishes', id],
    queryFn: () => getAssignedDishesList(id!),
    enabled: isEdit, // Chỉ fetch khi là edit mode
    staleTime: 5 * 60 * 1000,
  });

  // Lấy danh sách dishes CHƯA ĐƯỢC GÁN (dùng API chuyên dụng)
  const { data: availableDishesResponse, isLoading: isAvailableDishesLoading } = useQuery({
    queryKey: ['availableDishes', dishSearchQuery],
    queryFn: () => getActiveDishesList(dishSearchQuery),
    staleTime: 5 * 60 * 1000,
  });

  // Chuyển đổi response data thành array và cập nhật allDishesMap
  useEffect(() => {
    const newMap = new Map<string, IDish>();

    // Thêm assigned dishes vào map
    if (assignedDishesResponse) {
      let assignedArray: any[] = [];
      if (Array.isArray(assignedDishesResponse)) {
        assignedArray = assignedDishesResponse;
      } else if (assignedDishesResponse && typeof assignedDishesResponse === 'object') {
        if (Array.isArray(assignedDishesResponse.dishes))
          assignedArray = assignedDishesResponse.dishes;
        else if (Array.isArray(assignedDishesResponse.data))
          assignedArray = assignedDishesResponse.data;
        else if (Array.isArray(assignedDishesResponse.items))
          assignedArray = assignedDishesResponse.items;
      }

      assignedArray.forEach((dish: any) => {
        if (dish && dish._id) {
          newMap.set(dish._id, dish);
        }
      });
    }

    // Thêm available dishes vào map
    if (availableDishesResponse) {
      let availableArray: any[] = [];
      if (Array.isArray(availableDishesResponse)) {
        availableArray = availableDishesResponse;
      } else if (availableDishesResponse && typeof availableDishesResponse === 'object') {
        if (Array.isArray(availableDishesResponse.dishes))
          availableArray = availableDishesResponse.dishes;
        else if (Array.isArray(availableDishesResponse.data))
          availableArray = availableDishesResponse.data;
        else if (Array.isArray(availableDishesResponse.items))
          availableArray = availableDishesResponse.items;
      }
      availableArray.forEach((dish: any) => {
        if (dish && dish._id && !newMap.has(dish._id)) {
          newMap.set(dish._id, dish);
        }
      });
    }

    setAllDishesMap(newMap);
  }, [assignedDishesResponse, availableDishesResponse]);

  // Cập nhật form state khi data được load
  useEffect(() => {
    if (isEdit && restaurantData && assignedDishesResponse) {
      let assignedArray: any[] = [];
      if (Array.isArray(assignedDishesResponse)) {
        assignedArray = assignedDishesResponse;
      } else if (assignedDishesResponse && typeof assignedDishesResponse === 'object') {
        if (Array.isArray(assignedDishesResponse.dishes))
          assignedArray = assignedDishesResponse.dishes;
        else if (Array.isArray(assignedDishesResponse.data))
          assignedArray = assignedDishesResponse.data;
        else if (Array.isArray(assignedDishesResponse.items))
          assignedArray = assignedDishesResponse.items;
      }

      setFormData({
        name: restaurantData.name,
        address: restaurantData.address,
        location: restaurantData.location,
        phone: restaurantData.phone,
        website: restaurantData.website || '',
        images: restaurantData.images,
        // Chuyển ObjectIds thành strings từ assigned dishes
        dishes: assignedArray.map((dish: any) => dish._id || dish.toString()),
      });
    }
  }, [isEdit, restaurantData, assignedDishesResponse]);

  // --- Mutations ---

  const uploadMutation = useMutation({
    mutationFn: (data: FormData) => uploadRestaurantImages(data),
  });

  const restaurantMutation = useMutation({
    mutationFn: (data: CreateRestaurantPayload | UpdateRestaurantPayload) => {
      if (isEdit) {
        return updateRestaurant(id!, data as UpdateRestaurantPayload);
      }
      return createRestaurant(data as CreateRestaurantPayload);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminRestaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', data._id] });
      queryClient.invalidateQueries({ queryKey: ['assignedDishes', id] });
      queryClient.invalidateQueries({ queryKey: ['unassignedDishes'] });

      alert(`Nhà hàng "${data.name}" đã được ${isEdit ? 'cập nhật' : 'tạo mới'} thành công.`);
      navigate('/admin/restaurants');
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.error?.details
          ?.map((d: any) => `${d.field}: ${d.message}`)
          .join('; ') || 'Lỗi xử lý dữ liệu.';
      setFormError(`Lỗi hệ thống/Validation: ${msg}`);
    },
  });

  const isSubmitting = restaurantMutation.isPending || uploadMutation.isPending;
  const isLoading =
    isRestaurantLoading || isAssignedDishesLoading || isAvailableDishesLoading || isSubmitting;

  // --- Handlers ---

  const handleInputChange = (field: keyof RestaurantFormState, value: any, coordIndex?: 0 | 1) => {
    setFormData((prev) => {
      if (field === 'location' && coordIndex !== undefined) {
        const newCoords = [...prev.location.coordinates];
        newCoords[coordIndex] = parseFloat(value) || 0;
        return {
          ...prev,
          location: { ...prev.location, coordinates: newCoords as [number, number] },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleAddDish = (dishId: string) => {
    if (!formData.dishes.includes(dishId)) {
      setFormData((prev) => ({ ...prev, dishes: [...prev.dishes, dishId] }));
      // Clear search để hiển thị danh sách cập nhật
      setDishSearchQuery('');
    }
  };

  const handleRemoveDish = (dishId: string) => {
    setFormData((prev) => ({
      ...prev,
      dishes: prev.dishes.filter((id) => id !== dishId),
    }));
  };

  // Lấy chi tiết của dishes đang được gán trong form
  const assignedDishDetails = useMemo(() => {
    return formData.dishes
      .map((dishId) => allDishesMap.get(dishId))
      .filter((dish): dish is IDish => !!dish);
  }, [formData.dishes, allDishesMap]);

  // Lấy danh sách dishes khả dụng để hiển thị (UPDATED Logic)
  const availableDishes = useMemo(() => {
    const allActiveDishes: IDish[] = [];

    // Lấy tất cả dishes từ API active-list
    if (availableDishesResponse) {
      let availableArray: any[] = [];
      if (Array.isArray(availableDishesResponse)) {
        availableArray = availableDishesResponse;
      } else if (availableDishesResponse && typeof availableDishesResponse === 'object') {
        if (Array.isArray(availableDishesResponse.dishes))
          availableArray = availableDishesResponse.dishes;
        else if (Array.isArray(availableDishesResponse.data))
          availableArray = availableDishesResponse.data;
        else if (Array.isArray(availableDishesResponse.items))
          availableArray = availableDishesResponse.items;
      }

      // Chỉ giữ lại những dishes chưa được gán vào form
      availableArray.forEach((dish: any) => {
        if (dish && dish._id && !formData.dishes.includes(dish._id)) {
          allActiveDishes.push(dish);
        }
      });
    }

    // Nếu có search query, lọc bằng cách match tên tiếng Việt
    if (dishSearchQuery) {
      return allActiveDishes.filter((dish) =>
        dish.name?.vi?.toLowerCase().includes(dishSearchQuery.toLowerCase())
      );
    }

    return allActiveDishes; // Trả về tất cả món đang hoạt động chưa được gán (trong form)
  }, [availableDishesResponse, formData.dishes, dishSearchQuery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
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

    const dataToValidate: CreateRestaurantPayload | UpdateRestaurantPayload = {
      ...formData,
      location: {
        ...formData.location,
        coordinates: [
          Number(formData.location.coordinates[0]),
          Number(formData.location.coordinates[1]),
        ] as [number, number],
      },
    };

    try {
      let finalImageUrls = formData.images;

      if (imageFiles.length > 0) {
        const uploadFormData = new FormData();
        imageFiles.forEach((file) => uploadFormData.append('images', file));
        const uploadedUrls = await uploadMutation.mutateAsync(uploadFormData);
        finalImageUrls = [...formData.images, ...uploadedUrls];
      }

      const finalData = { ...dataToValidate, images: finalImageUrls };

      const schema = isEdit ? updateRestaurantClientSchema : createRestaurantClientSchema;
      const validatedData = schema.parse(finalData);

      await restaurantMutation.mutateAsync(validatedData);
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        const errorDetails = err.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
        setFormError(`Lỗi Validation: ${errorDetails}`);
      } else {
        setFormError(`Lỗi hệ thống: ${err.message || 'Không thể lưu nhà hàng.'}`);
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout title={isEdit ? 'Đang tải nhà hàng...' : 'Tạo mới nhà hàng'}>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </AdminLayout>
    );
  }

  const pageTitle = isEdit ? `Sửa Nhà Hàng: ${formData.name}` : 'Tạo Nhà Hàng Mới';

  return (
    <AdminLayout title={pageTitle}>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">{pageTitle}</h1>
          <div className="flex gap-3">
            <NavLink to="/admin/restaurants">
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
              {isEdit ? 'Cập Nhật' : 'Tạo Nhà Hàng'}
            </Button>
          </div>
        </div>

        {formError && <Alert type="error" message={formError} />}

        {/* --- Thông tin Cơ bản --- */}
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Label>Tên Nhà Hàng</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nhập tên nhà hàng"
            />
            <Label>Địa Chỉ</Label>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Nhập địa chỉ"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Số Điện Thoại</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </div>
              <div className="space-y-2">
                <Label>Website</Label>
                <div className="relative">
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    className="pl-10"
                    placeholder="https://example.com"
                  />
                  <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Vị Trí (Geospatial) --- */}
        <Card>
          <CardHeader>
            <CardTitle>Vị trí (Tọa độ)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kinh Độ (Longitude)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    value={formData.location.coordinates[0]}
                    onChange={(e) => handleInputChange('location', e.target.value, 0)}
                    placeholder="106.7008"
                  />
                  <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Vĩ Độ (Latitude)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    step="any"
                    value={formData.location.coordinates[1]}
                    onChange={(e) => handleInputChange('location', e.target.value, 1)}
                    placeholder="10.7769"
                  />
                  <MapPin className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Gán Món Ăn (Dish Assignment) --- */}
        <Card>
          <CardHeader>
            <CardTitle>Món ăn phục vụ ({assignedDishDetails.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* PANEL 1: MÓN ĂN ĐANG GÁN */}
              <div>
                <Label className="font-semibold mb-2 block">Món ăn đang gán:</Label>
                <div className="flex flex-col gap-2 p-3 border rounded-md h-60 overflow-y-auto bg-muted/40">
                  {assignedDishDetails.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center pt-8">
                      Chưa có món ăn nào được gán.
                    </p>
                  ) : (
                    assignedDishDetails.map((dish) => (
                      <div
                        key={dish._id}
                        className="flex justify-between items-center bg-card p-2 rounded-md border text-sm"
                      >
                        <span className="font-medium">{dish.name.vi}</span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          title="Bỏ gán"
                          onClick={() => handleRemoveDish(dish._id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* PANEL 2: TÌM KIẾM CÁC MÓN ĂN KHẢ DỤNG */}
              <div>
                <Label className="font-semibold mb-2 block">
                  Tìm kiếm và gán món ăn (Khả dụng):
                </Label>
                <div className="relative mb-3">
                  <Input
                    type="text"
                    placeholder="Nhập tên món ăn..."
                    value={dishSearchQuery}
                    onChange={(e) => setDishSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>

                <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
                  {isAvailableDishesLoading ? (
                    <p className="text-sm text-muted-foreground text-center">
                      Đang tải danh sách món ăn...
                    </p>
                  ) : availableDishes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      {dishSearchQuery
                        ? 'Không tìm thấy món ăn nào phù hợp.'
                        : 'Không có món ăn nào khả dụng.'}
                    </p>
                  ) : (
                    availableDishes.map((dish) => (
                      <div
                        key={dish._id}
                        className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-md"
                      >
                        <span className="text-sm">
                          {dish.name?.vi || 'Không có tên'}{' '}
                          {dish.category && (
                            <Badge variant="secondary" className="ml-2">
                              {dish.category}
                            </Badge>
                          )}
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="success"
                          onClick={() => handleAddDish(dish._id)}
                        >
                          <Plus className="w-4 h-4 mr-1" /> Gán
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* --- Images Section (Upload và Preview) --- */}
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
                      src={url.startsWith('/') ? `${import.meta.env.VITE_BACKEND_URL}${url}` : url}
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
