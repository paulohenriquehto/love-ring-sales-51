export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          parent_category_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          parent_category_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          parent_category_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          active: boolean
          budget_limit: number | null
          created_at: string
          description: string | null
          id: string
          manager_user_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          budget_limit?: number | null
          created_at?: string
          description?: string | null
          id?: string
          manager_user_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          budget_limit?: number | null
          created_at?: string
          description?: string | null
          id?: string
          manager_user_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          created_at: string
          id: string
          last_count_date: string | null
          last_movement_date: string | null
          maximum_stock: number | null
          minimum_stock: number | null
          product_id: string
          quantity_available: number
          quantity_reserved: number
          quantity_total: number | null
          updated_at: string
          variant_id: string | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_count_date?: string | null
          last_movement_date?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          product_id: string
          quantity_available?: number
          quantity_reserved?: number
          quantity_total?: number | null
          updated_at?: string
          variant_id?: string | null
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_count_date?: string | null
          last_movement_date?: string | null
          maximum_stock?: number | null
          minimum_stock?: number | null
          product_id?: string
          quantity_available?: number
          quantity_reserved?: number
          quantity_total?: number | null
          updated_at?: string
          variant_id?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          price_multiplier: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price_multiplier?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price_multiplier?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          product_id: string
          variant_id: string | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          product_id: string
          variant_id?: string | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          product_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          active: boolean
          color: string | null
          created_at: string
          id: string
          material_id: string | null
          price_adjustment: number | null
          product_id: string
          size: string | null
          sku_variant: string | null
          updated_at: string
          width: string | null
        }
        Insert: {
          active?: boolean
          color?: string | null
          created_at?: string
          id?: string
          material_id?: string | null
          price_adjustment?: number | null
          product_id: string
          size?: string | null
          sku_variant?: string | null
          updated_at?: string
          width?: string | null
        }
        Update: {
          active?: boolean
          color?: string | null
          created_at?: string
          id?: string
          material_id?: string | null
          price_adjustment?: number | null
          product_id?: string
          size?: string | null
          sku_variant?: string | null
          updated_at?: string
          width?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          base_price: number
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          sku: string | null
          supplier_id: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          active?: boolean
          base_price: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sku?: string | null
          supplier_id?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          active?: boolean
          base_price?: number
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sku?: string | null
          supplier_id?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          budget_limit: number | null
          created_at: string
          department_id: string | null
          full_name: string
          id: string
          position: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          budget_limit?: number | null
          created_at?: string
          department_id?: string | null
          full_name: string
          id?: string
          position?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          budget_limit?: number | null
          created_at?: string
          department_id?: string | null
          full_name?: string
          id?: string
          position?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      request_items: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          product_id: string
          quantity: number
          request_id: string
          total_price: number | null
          unit_price: number
          updated_at: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          quantity: number
          request_id: string
          total_price?: number | null
          unit_price: number
          updated_at?: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          quantity?: number
          request_id?: string
          total_price?: number | null
          unit_price?: number
          updated_at?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "request_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "request_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          approved_amount: number | null
          approved_at: string | null
          approved_by_user_id: string | null
          created_at: string
          delivery_date_confirmed: string | null
          delivery_date_requested: string | null
          department_id: string | null
          description: string | null
          id: string
          justification: string | null
          notes: string | null
          priority: Database["public"]["Enums"]["request_priority"]
          rejection_reason: string | null
          request_number: string
          requester_user_id: string
          status: Database["public"]["Enums"]["request_status"]
          title: string
          total_amount: number | null
          updated_at: string
          warehouse_id: string | null
        }
        Insert: {
          approved_amount?: number | null
          approved_at?: string | null
          approved_by_user_id?: string | null
          created_at?: string
          delivery_date_confirmed?: string | null
          delivery_date_requested?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          justification?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["request_priority"]
          rejection_reason?: string | null
          request_number?: string
          requester_user_id: string
          status?: Database["public"]["Enums"]["request_status"]
          title: string
          total_amount?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Update: {
          approved_amount?: number | null
          approved_at?: string | null
          approved_by_user_id?: string | null
          created_at?: string
          delivery_date_confirmed?: string | null
          delivery_date_requested?: string | null
          department_id?: string | null
          description?: string | null
          id?: string
          justification?: string | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["request_priority"]
          rejection_reason?: string | null
          request_number?: string
          requester_user_id?: string
          status?: Database["public"]["Enums"]["request_status"]
          title?: string
          total_amount?: number | null
          updated_at?: string
          warehouse_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          movement_date: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes: string | null
          performed_by_user_id: string
          product_id: string
          quantity: number
          quantity_after: number
          quantity_before: number
          reference_id: string | null
          reference_type: string | null
          total_cost: number | null
          unit_cost: number | null
          variant_id: string | null
          warehouse_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          movement_date?: string
          movement_type: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          performed_by_user_id: string
          product_id: string
          quantity: number
          quantity_after: number
          quantity_before: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          variant_id?: string | null
          warehouse_id: string
        }
        Update: {
          created_at?: string
          id?: string
          movement_date?: string
          movement_type?: Database["public"]["Enums"]["stock_movement_type"]
          notes?: string | null
          performed_by_user_id?: string
          product_id?: string
          quantity?: number
          quantity_after?: number
          quantity_before?: number
          reference_id?: string | null
          reference_type?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          variant_id?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          active: boolean
          address: string | null
          cnpj: string | null
          contact_person: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          address?: string | null
          cnpj?: string | null
          contact_person?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      warehouses: {
        Row: {
          active: boolean
          created_at: string
          id: string
          location: string | null
          manager_user_id: string | null
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          location?: string | null
          manager_user_id?: string | null
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          location?: string | null
          manager_user_id?: string | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      request_priority: "low" | "normal" | "high" | "urgent"
      request_status:
        | "draft"
        | "submitted"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "in_preparation"
        | "ready_for_pickup"
        | "completed"
        | "cancelled"
      stock_movement_type:
        | "purchase"
        | "sale"
        | "transfer"
        | "adjustment"
        | "damage"
        | "return"
        | "reservation"
        | "unreservation"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      request_priority: ["low", "normal", "high", "urgent"],
      request_status: [
        "draft",
        "submitted",
        "pending_approval",
        "approved",
        "rejected",
        "in_preparation",
        "ready_for_pickup",
        "completed",
        "cancelled",
      ],
      stock_movement_type: [
        "purchase",
        "sale",
        "transfer",
        "adjustment",
        "damage",
        "return",
        "reservation",
        "unreservation",
      ],
    },
  },
} as const
