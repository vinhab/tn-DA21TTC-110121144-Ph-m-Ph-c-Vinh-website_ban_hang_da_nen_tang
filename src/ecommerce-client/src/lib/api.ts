import axios from 'axios'
import { UIProduct } from '@/types/product-ui'
import { mapApiProductToUIProduct } from '@/utils/product-mapping'
import { CartResponse } from '@/types/cart'

interface RegisterPayload {
  name: string
  email: string
  password: string
}

interface LoginPayload {
  email: string
  password: string
}

const api = axios.create({
  baseURL: 'http://192.168.3.10:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
})

export default api

// 📦 Sản phẩm
export async function fetchProducts(params?: { search?: string, showInactive?: string }) {
  const res = await api.get('/products', { params })
  return res.data.data || []
}

export async function fetchProductById(id: string) {
  const res = await api.get(`/products/${id}`)
  return mapApiProductToUIProduct(res.data)
}

export async function fetchGroupedSuggestions(productId: string) {
  const res = await api.get(`/products/${productId}/suggestions/grouped`)
  const rawData = res.data?.data as Record<string, any[]>

  const mapped: Record<string, UIProduct[]> = {}
  for (const [key, group] of Object.entries(rawData)) {
    mapped[key] = group.map(mapApiProductToUIProduct)
  }

  return mapped
}

export async function fetchSimilarProducts(id: string): Promise<UIProduct[]> {
  const res = await api.get(`/products/${id}/similar`)
  return (res.data as any[]).map(mapApiProductToUIProduct)
}

// 📦 Đánh giá sản phẩm
export async function fetchProductReviews(productId: string) {
  const res = await api.get(`/reviews/product/${productId}`)
  return res.data
}

// 📦 Đánh giá sản phẩm
export async function postReview(productId: string, orderId: string, rating: number, comment: string) {
  const token = localStorage.getItem('access_token');
  const res = await api.post(
    '/reviews',
    {
      product: productId,
      order: orderId,
      rating,
      comment,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return res.data;
}

// Kiểm tra quyền đánh giá cho từng đơn
export async function fetchCanReview(productId: string, orderId: string): Promise<boolean> {
  const token = localStorage.getItem('access_token')
  try {
    const res = await api.get(
      `/reviews/product/${productId}/order/${orderId}/can-review`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return res.data?.canReview === true
  } catch (err: any) {
    if (err.response?.status === 401) return false
    throw err
  }
}




// 👤 Xác thực
export async function registerUser(data: RegisterPayload) {
  const res = await api.post('/auth/register', data)
  return res.data
}

export async function loginUser(data: LoginPayload) {
  const res = await api.post('/auth/login', data)
  return res.data
}

export async function requestPasswordReset(email: string) {
  const res = await api.post('/auth/request-password-reset', { email })
  return res.data
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await api.post(`/auth/reset-password/${token}`, { newPassword })
  return res.data
}

export async function verifyEmail(token: string) {
  const res = await api.get(`/auth/verify-email/${token}`)
  return res.data
}

export async function resendConfirmation(email: string) {
  const res = await api.post('/auth/resend-confirmation', { email })
  return res.data
}

export async function uploadAvatar(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('avatar', file)

  const res = await api.put('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  })

  return res.data.avatarUrl // trả về URL mới từ backend
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const res = await api.put(
    '/users/change-password',
    { oldPassword, newPassword },
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    }
  )

  return res.data
}

export async function updateUserInfo(data: Partial<{ name: string; address: string; phone: string, birthday: string, gender: 'nam' | 'nu' }>) {
  const res = await api.put('/users/me', data, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  })

  return res.data
}

export async function fetchMyOrders() {
  const res = await api.get('/orders/my-orders', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  })

  return res.data // hoặc res.data.data nếu bạn bọc dữ liệu trong key `data`
}

export async function cancelOrder(orderId: string) {
  const res = await api.put(
    `/orders/${orderId}/cancel`,
    {}, // <-- body rỗng hợp lệ
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      },
    }
  )
  return res.data
}


export async function fetchOrderById(orderId: string) {
  const res = await api.get(`/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  })
  return res.data
}

export const fetchCart = async () => {
  const token = localStorage.getItem('access_token') // ✅ dùng đúng key
  const res = await api.get('/cart', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export const addToCart = async (productId: string, quantity: number = 1) => {
  const token = localStorage.getItem('access_token')
  await api.post(
    '/cart',
    { productId, quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const updateCartItem = async (productId: string, quantity: number) => {
  const token = localStorage.getItem('access_token')
  await api.patch(
    '/cart',
    { productId, quantity },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )
}

export const removeCartItem = async (productId: string) => {
  const token = localStorage.getItem('access_token')
  await api.delete(`/cart/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
}

export async function createOrder(data: {
  items: { productId: string; quantity: number }[];
  paymentMethod: string;
  address: string;
  phone: string;
}) {
  const token = localStorage.getItem('access_token'); // dùng chung với các API khác

  const res = await api.post('/orders', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
}


export async function retryOrderPayment(orderId: string) {
  const token = localStorage.getItem('access_token');
  const res = await api.put(`/orders/${orderId}/retry`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}


export async function fetchMe() {
  const res = await api.get('/users/me', {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
    },
  });
  return res.data;
}

export async function searchProducts(keyword: string): Promise<UIProduct[]> {
  const res = await api.get(`/products/search`, {
    params: { keyword },
  })
  return (res.data as any[]).map(mapApiProductToUIProduct)
}

export async function fetchProductsByCategory(categoryId: string): Promise<UIProduct[]> {
  const res = await api.get(`/products/category/${categoryId}`)
  return (res.data as any[]).map(mapApiProductToUIProduct)
}

export async function fetchProductsByCategorySlug(slug: string): Promise<UIProduct[]> {
  const res = await api.get(`/products/by-category-slug/${slug}`)
  return (res.data as any[]).map(mapApiProductToUIProduct)
}

export async function fetchDashboardSummary() {
  const token = localStorage.getItem('access_token');
  const res = await api.get('/admin/summary', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchDashboardRevenue(from?: string, to?: string) {
  const token = localStorage.getItem('access_token');
  const res = await api.get('/admin/revenue', {
    params: { from, to },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchDashboardOrderStatus() {
  const token = localStorage.getItem('access_token');
  const res = await api.get('/admin/order-status', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchDashboardTopProducts(limit = 5) {
  const token = localStorage.getItem('access_token');
  const res = await api.get('/admin/top-products', {
    params: { limit },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchDashboardLowStockProducts(threshold = 5) {
  const token = localStorage.getItem('access_token');
  const res = await api.get('/admin/low-stock-products', {
    params: { threshold },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchDashboardNewUsers(limit = 5) {
  const token = localStorage.getItem('access_token');
  const res = await api.get('/admin/new-users', {
    params: { limit },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchDashboardRecentOrders(limit = 5) {
  const token = localStorage.getItem('access_token');
  const res = await api.get('/admin/recent-orders', {
    params: { limit },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchDashboardNotifications(limit = 5) {
  const token = localStorage.getItem('access_token');
  const res = await api.get('/admin/notifications', {
    params: { limit },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function createProduct(formData: FormData) {
  const token = localStorage.getItem('access_token');
  const res = await api.post('/products', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}




export async function deleteProduct(id: string) {
  const token = localStorage.getItem('access_token')
  const res = await api.delete(`/products/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function fetchCategories() {
  const res = await api.get('/categories');
  return res.data || []; // Trả về trực tiếp mảng category
}

// Cập nhật với JSON (PUT)
export async function updateProduct(id: string, data: object) {
  const token = localStorage.getItem('access_token');
  const res = await api.put(`/products/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return res.data;
}

// Cập nhật với FormData (PATCH)
export async function updateProductWithImages(id: string, formData: FormData) {
  const token = localStorage.getItem('access_token');
  const res = await api.patch(`/products/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
}

// PATCH /products/:id/activate
export async function updateProductActive(productId: string, isActive: boolean) {
  const token = localStorage.getItem('access_token');
  const res = await api.patch(
    `/products/${productId}/activate`,
    { isActive }, // payload phải là object, không phải body, không cần JSON.stringify
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return res.data;
}

// Tạo danh mục mới (POST)
export async function createCategory(data: { name: string; status?: string; icon?: string; description?: string }) {
  const token = localStorage.getItem('access_token');
  const res = await api.post('/categories', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}


export async function updateCategory(id: string, data: Partial<{
  name: string;
  status?: string;
  icon?: string;
  description?: string;
  isActive?: boolean;
}>) {
  const token = localStorage.getItem('access_token');
  const res = await api.put(`/categories/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}


// Xoá danh mục (DELETE)
export async function deleteCategory(id: string) {
  const token = localStorage.getItem('access_token');
  const res = await api.delete(`/categories/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function fetchUsers() {
  const token = localStorage.getItem('access_token');
  const res = await api.get('/users', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function blockUser(id: string) {
  const token = localStorage.getItem('access_token');
  const res = await api.patch(`/users/${id}/block`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function unblockUser(id: string) {
  const token = localStorage.getItem('access_token');
  const res = await api.patch(`/users/${id}/unblock`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}


export async function deleteUser(id: string) {
  const token = localStorage.getItem('access_token');
  const res = await api.delete(`/users/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}) {
  const token = localStorage.getItem('access_token');
  const res = await api.post('/users', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}

export async function updateUser(
  id: string,
  data: Partial<{
    name: string;
    email: string;
    phone?: string;
    role?: 'user' | 'admin';
    address?: string;
    birthday?: string;
    gender?: 'nam' | 'nu';
  }>
) {
  const token = localStorage.getItem('access_token');
  const res = await api.put(`/users/${id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
}


export async function fetchUserById(id: string) {
  const token = localStorage.getItem('access_token');
  const res = await api.get(`/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data; // giả sử backend trả về user object
}

export async function fetchOrdersByUserId(userId: string) {
  const token = localStorage.getItem('access_token');
  const res = await api.get(`/orders/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data; // backend trả về danh sách đơn hàng của user này
}

// Lấy toàn bộ đơn hàng (chỉ admin)
export async function fetchAllOrders() {
  const token = localStorage.getItem('access_token');
  const res = await api.get('/orders', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Cập nhật trạng thái đơn hàng (chỉ admin)
export async function updateOrderStatus(orderId: string, status: string) {
  const token = localStorage.getItem('access_token');
  const res = await api.put(`/orders/status/${orderId}`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// Thêm vào lib/api.ts
export async function createReview({
  productId,
  orderId,
  rating,
  comment,
}: {
  productId: string;
  orderId: string;
  rating: number;
  comment?: string;
}) {
  const token = localStorage.getItem('access_token')
  const res = await api.post('/reviews', {
    product: productId,
    order: orderId,
    rating,
    comment,
  }, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  return res.data
}

export async function importProductsFromExcel(file: File) {
  const token = localStorage.getItem('access_token');
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.post('/products/import-excel', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return res.data;
}