"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  quantity: number;
  totalPrice: number;
  refresh: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);

  // ✅ Load từ localStorage khi lần đầu
  useEffect(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        console.error("Lỗi parse cart từ localStorage:", e);
      }
    }
  }, []);

  // ✅ Lưu vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ Thêm sản phẩm vào giỏ
  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
  };

  // ✅ Xoá sản phẩm khỏi giỏ
  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  // ✅ Xoá toàn bộ giỏ hàng
  const clearCart = () => {
    setCart([]);
  };

  // ✅ Làm mới giỏ hàng từ localStorage (hoặc backend sau này)
  const refresh = useCallback(() => {
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch (e) {
        console.error("Lỗi parse khi refresh:", e);
      }
    }
  }, []);

  // ✅ Tổng số lượng sản phẩm
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);

  // ✅ Tổng tiền
  const totalPrice = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        quantity,
        totalPrice,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart must be used within a CartProvider");
  return context;
};
