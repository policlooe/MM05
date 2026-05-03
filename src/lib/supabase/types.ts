/**
 * Database Types
 * Auto-generated types for Supabase tables
 * 
 * To regenerate: supabase gen types typescript --local > src/lib/supabase/types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          role: 'user' | 'admin'
          avatar_url: string | null
          default_address: Json
          created_at: string
          updated_at: string
          last_login_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin'
          avatar_url?: string | null
          default_address?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          role?: 'user' | 'admin'
          avatar_url?: string | null
          default_address?: Json
          created_at?: string
          updated_at?: string
          last_login_at?: string | null
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          image_url: string | null
          parent_id: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          image_url?: string | null
          parent_id?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string | null
          name: string
          slug: string
          description: string | null
          short_description: string | null
          price: number
          old_price: number | null
          cost_price: number | null
          images: Json
          thumbnail_url: string | null
          specifications: Json
          stock_quantity: number
          is_in_stock: boolean
          low_stock_threshold: number
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          is_active: boolean
          is_featured: boolean
          badge: string | null
          sort_order: number
          views_count: number
          sales_count: number
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          category_id?: string | null
          name: string
          slug: string
          description?: string | null
          short_description?: string | null
          price: number
          old_price?: number | null
          cost_price?: number | null
          images?: Json
          thumbnail_url?: string | null
          specifications?: Json
          stock_quantity?: number
          low_stock_threshold?: number
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          badge?: string | null
          sort_order?: number
          views_count?: number
          sales_count?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          category_id?: string | null
          name?: string
          slug?: string
          description?: string | null
          short_description?: string | null
          price?: number
          old_price?: number | null
          cost_price?: number | null
          images?: Json
          thumbnail_url?: string | null
          specifications?: Json
          stock_quantity?: number
          low_stock_threshold?: number
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          is_active?: boolean
          is_featured?: boolean
          badge?: string | null
          sort_order?: number
          views_count?: number
          sales_count?: number
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
      }
      cart_items: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          price_at_add: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          price_at_add: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          price_at_add?: number
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          order_number: string
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal: number
          delivery_cost: number
          discount: number
          total: number
          customer_name: string
          customer_email: string
          customer_phone: string
          delivery_address: Json
          customer_note: string | null
          admin_note: string | null
          created_at: string
          updated_at: string
          confirmed_at: string | null
          shipped_at: string | null
          delivered_at: string | null
          cancelled_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          order_number?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal: number
          delivery_cost?: number
          discount?: number
          total: number
          customer_name: string
          customer_email: string
          customer_phone: string
          delivery_address: Json
          customer_note?: string | null
          admin_note?: string | null
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          order_number?: string
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          subtotal?: number
          delivery_cost?: number
          discount?: number
          total?: number
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          delivery_address?: Json
          customer_note?: string | null
          admin_note?: string | null
          created_at?: string
          updated_at?: string
          confirmed_at?: string | null
          shipped_at?: string | null
          delivered_at?: string | null
          cancelled_at?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_snapshot: Json
          quantity: number
          price: number
          total: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_snapshot: Json
          quantity: number
          price: number
          total: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_snapshot?: Json
          quantity?: number
          price?: number
          total?: number
          created_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string
          record_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name: string
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string
          record_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      increment_sales_count: {
        Args: {
          product_id: string
          amount: number
        }
        Returns: void
      }
      decrement_stock: {
        Args: {
          product_id: string
          amount: number
        }
        Returns: void
      }
      increment_stock: {
        Args: {
          product_id: string
          amount: number
        }
        Returns: void
      }
      get_products_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_products: number
          active_products: number
          out_of_stock: number
          low_stock: number
          total_value: number
        }
      }
      get_orders_stats: {
        Args: {
          start_date?: string
          end_date?: string
        }
        Returns: {
          total_orders: number
          pending_orders: number
          completed_orders: number
          cancelled_orders: number
          total_revenue: number
          average_order_value: number
        }
      }
      search_products: {
        Args: {
          search_query: string
          max_results?: number
        }
        Returns: {
          id: string
          name: string
          slug: string
          price: number
          thumbnail_url: string
          rank: number
        }[]
      }
      get_top_products: {
        Args: {
          limit_count?: number
          order_by?: string
        }
        Returns: Database['public']['Tables']['products']['Row'][]
      }
      check_product_availability: {
        Args: {
          product_id: string
          requested_quantity: number
        }
        Returns: {
          available: boolean
          current_stock: number
          message: string
        }
      }
      calculate_delivery_cost: {
        Args: {
          distance_km: number
          order_total: number
        }
        Returns: number
      }
    }
    Enums: {
      user_role: 'user' | 'admin'
      order_status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
    }
  }
}
