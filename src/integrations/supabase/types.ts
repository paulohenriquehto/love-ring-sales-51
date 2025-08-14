export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      analytics_metrics: {
        Row: {
          created_at: string
          date: string
          id: string
          metadata: Json | null
          metric_type: string
          updated_at: string
          value: number
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_type: string
          updated_at?: string
          value: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metadata?: Json | null
          metric_type?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          active: boolean
          created_at: string
          expires_at: string | null
          id: string
          key_hash: string
          last_used_at: string | null
          name: string
          permissions: Json
          rate_limit: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash: string
          last_used_at?: string | null
          name: string
          permissions?: Json
          rate_limit?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          expires_at?: string | null
          id?: string
          key_hash?: string
          last_used_at?: string | null
          name?: string
          permissions?: Json
          rate_limit?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      api_requests: {
        Row: {
          api_key_id: string | null
          created_at: string
          endpoint: string
          id: string
          ip_address: unknown | null
          method: string
          request_size: number | null
          response_size: number | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string
          endpoint: string
          id?: string
          ip_address?: unknown | null
          method: string
          request_size?: number | null
          response_size?: number | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: unknown | null
          method?: string
          request_size?: number | null
          response_size?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_requests_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          severity: string
          status: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          severity?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          severity?: string
          status?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
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
      custom_fonts: {
        Row: {
          active: boolean
          created_at: string
          css_class_name: string
          font_family: string
          google_fonts_url: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          css_class_name: string
          font_family: string
          google_fonts_url: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          css_class_name?: string
          font_family?: string
          google_fonts_url?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
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
      engraving_categories: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          icon: string | null
          id: string
          image_url: string | null
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          image_url?: string | null
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      engraving_symbols: {
        Row: {
          active: boolean
          category_id: string
          created_at: string
          icon_path: string | null
          id: string
          image_url: string | null
          name: string
          price_adjustment: number | null
          svg_content: string | null
          unicode_char: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          category_id: string
          created_at?: string
          icon_path?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_adjustment?: number | null
          svg_content?: string | null
          unicode_char?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          category_id?: string
          created_at?: string
          icon_path?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_adjustment?: number | null
          svg_content?: string | null
          unicode_char?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "engraving_symbols_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "engraving_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      import_logs: {
        Row: {
          created_at: string
          error_count: number
          error_log: Json | null
          filename: string
          id: string
          mapping_config: Json | null
          processed_products: number
          status: string
          success_count: number
          success_log: Json | null
          total_products: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_count?: number
          error_log?: Json | null
          filename: string
          id?: string
          mapping_config?: Json | null
          processed_products?: number
          status?: string
          success_count?: number
          success_log?: Json | null
          total_products?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_count?: number
          error_log?: Json | null
          filename?: string
          id?: string
          mapping_config?: Json | null
          processed_products?: number
          status?: string
          success_count?: number
          success_log?: Json | null
          total_products?: number
          updated_at?: string
          user_id?: string
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
      order_items: {
        Row: {
          created_at: string
          engraving_font: string | null
          engraving_symbols: Json | null
          engraving_text: string | null
          id: string
          material: string | null
          order_id: string
          product_id: string
          product_name: string
          quantity: number
          size: string | null
          total_price: number
          unit_price: number
          variant_id: string | null
          width: string | null
        }
        Insert: {
          created_at?: string
          engraving_font?: string | null
          engraving_symbols?: Json | null
          engraving_text?: string | null
          id?: string
          material?: string | null
          order_id: string
          product_id: string
          product_name: string
          quantity?: number
          size?: string | null
          total_price: number
          unit_price: number
          variant_id?: string | null
          width?: string | null
        }
        Update: {
          created_at?: string
          engraving_font?: string | null
          engraving_symbols?: Json | null
          engraving_text?: string | null
          id?: string
          material?: string | null
          order_id?: string
          product_id?: string
          product_name?: string
          quantity?: number
          size?: string | null
          total_price?: number
          unit_price?: number
          variant_id?: string | null
          width?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_method: string
          discount: number
          id: string
          installment_value: number | null
          installments: number | null
          notes: string | null
          order_number: string | null
          payment_method: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_cpf: string
          customer_email: string
          customer_name: string
          customer_phone: string
          delivery_method?: string
          discount?: number
          id?: string
          installment_value?: number | null
          installments?: number | null
          notes?: string | null
          order_number?: string | null
          payment_method?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          customer_cpf?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string
          delivery_method?: string
          discount?: number
          id?: string
          installment_value?: number | null
          installments?: number | null
          notes?: string | null
          order_number?: string | null
          payment_method?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_engraving_config: {
        Row: {
          available_fonts: string[] | null
          created_at: string
          id: string
          max_characters: number
          price_adjustment: number | null
          product_id: string
          supports_engraving: boolean
          updated_at: string
        }
        Insert: {
          available_fonts?: string[] | null
          created_at?: string
          id?: string
          max_characters?: number
          price_adjustment?: number | null
          product_id: string
          supports_engraving?: boolean
          updated_at?: string
        }
        Update: {
          available_fonts?: string[] | null
          created_at?: string
          id?: string
          max_characters?: number
          price_adjustment?: number | null
          product_id?: string
          supports_engraving?: boolean
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
      security_events: {
        Row: {
          created_at: string
          description: string
          event_type: string
          id: string
          metadata: Json | null
          resolved: boolean
          resolved_at: string | null
          risk_level: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          risk_level?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          resolved?: boolean
          resolved_at?: string | null
          risk_level?: string
          user_id?: string | null
        }
        Relationships: []
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
      top_selling_products: {
        Row: {
          created_at: string
          id: string
          period_end: string
          period_start: string
          product_id: string
          total_quantity: number
          total_revenue: number
        }
        Insert: {
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          product_id: string
          total_quantity?: number
          total_revenue?: number
        }
        Update: {
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          product_id?: string
          total_quantity?: number
          total_revenue?: number
        }
        Relationships: [
          {
            foreignKeyName: "top_selling_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      webhook_deliveries: {
        Row: {
          created_at: string
          delivered_at: string
          error_message: string | null
          event: string
          id: string
          payload: Json | null
          response_time_ms: number | null
          status_code: number
          success: boolean
          webhook_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string
          error_message?: string | null
          event: string
          id?: string
          payload?: Json | null
          response_time_ms?: number | null
          status_code: number
          success?: boolean
          webhook_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string
          error_message?: string | null
          event?: string
          id?: string
          payload?: Json | null
          response_time_ms?: number | null
          status_code?: number
          success?: boolean
          webhook_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      webhooks: {
        Row: {
          active: boolean
          created_at: string
          created_by_user_id: string
          events: string[]
          id: string
          name: string
          secret: string | null
          updated_at: string
          url: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          created_by_user_id: string
          events?: string[]
          id?: string
          name: string
          secret?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          active?: boolean
          created_at?: string
          created_by_user_id?: string
          events?: string[]
          id?: string
          name?: string
          secret?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          current_step: number
          error_message: string | null
          execution_data: Json | null
          id: string
          started_at: string
          started_by_user_id: string
          status: string
          total_steps: number
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          started_at?: string
          started_by_user_id: string
          status?: string
          total_steps?: number
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number
          error_message?: string | null
          execution_data?: Json | null
          id?: string
          started_at?: string
          started_by_user_id?: string
          status?: string
          total_steps?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string
          created_by_user_id: string
          description: string | null
          id: string
          name: string
          status: string
          steps: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by_user_id: string
          description?: string | null
          id?: string
          name: string
          status?: string
          steps?: Json
          trigger_type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by_user_id?: string
          description?: string | null
          id?: string
          name?: string
          status?: string
          steps?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_order_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      log_audit_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type: string
          p_severity?: string
        }
        Returns: string
      }
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
