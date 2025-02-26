export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      businesses: {
        Row: {
          address: string
          business_type: string
          created_at: string | null
          email: string
          id: string
          name: string
          owner_id: string | null
          phone: string
          tin: string
          updated_at: string | null
        }
        Insert: {
          address: string
          business_type: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          owner_id?: string | null
          phone: string
          tin: string
          updated_at?: string | null
        }
        Update: {
          address?: string
          business_type?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          owner_id?: string | null
          phone?: string
          tin?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          attachments: string[] | null
          createdat: string | null
          customerid: string | null
          date: string
          duedate: string
          id: string
          invoicenumber: string
          items: Json | null
          notes: string | null
          recurringid: string | null
          status: string | null
          subtotal: number
          taxamount: number
          terms: string | null
          total: number
          updatedat: string | null
        }
        Insert: {
          attachments?: string[] | null
          createdat?: string | null
          customerid?: string | null
          date: string
          duedate: string
          id?: string
          invoicenumber: string
          items?: Json | null
          notes?: string | null
          recurringid?: string | null
          status?: string | null
          subtotal: number
          taxamount: number
          terms?: string | null
          total: number
          updatedat?: string | null
        }
        Update: {
          attachments?: string[] | null
          createdat?: string | null
          customerid?: string | null
          date?: string
          duedate?: string
          id?: string
          invoicenumber?: string
          items?: Json | null
          notes?: string | null
          recurringid?: string | null
          status?: string | null
          subtotal?: number
          taxamount?: number
          terms?: string | null
          total?: number
          updatedat?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customerid_fkey"
            columns: ["customerid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          email: string
          full_name: string
          id: string
        }
        Insert: {
          email: string
          full_name: string
          id?: string
        }
        Update: {
          email?: string
          full_name?: string
          id?: string
        }
        Relationships: []
      }
      tax_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          attachments: string[] | null
          billable: boolean | null
          category: string | null
          customer: string | null
          date: string
          departmentid: string | null
          description: string | null
          id: string
          locationid: string | null
          notes: string | null
          paymentmethod: string | null
          projectid: string | null
          recurringid: string | null
          reference: string | null
          status: string | null
          taxable: boolean | null
          taxamount: number | null
          taxrate: number | null
          type: string | null
          vendor: string | null
        }
        Insert: {
          amount: number
          attachments?: string[] | null
          billable?: boolean | null
          category?: string | null
          customer?: string | null
          date: string
          departmentid?: string | null
          description?: string | null
          id?: string
          locationid?: string | null
          notes?: string | null
          paymentmethod?: string | null
          projectid?: string | null
          recurringid?: string | null
          reference?: string | null
          status?: string | null
          taxable?: boolean | null
          taxamount?: number | null
          taxrate?: number | null
          type?: string | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          attachments?: string[] | null
          billable?: boolean | null
          category?: string | null
          customer?: string | null
          date?: string
          departmentid?: string | null
          description?: string | null
          id?: string
          locationid?: string | null
          notes?: string | null
          paymentmethod?: string | null
          projectid?: string | null
          recurringid?: string | null
          reference?: string | null
          status?: string | null
          taxable?: boolean | null
          taxamount?: number | null
          taxrate?: number | null
          type?: string | null
          vendor?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          password_hash: string
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          password_hash: string
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          password_hash?: string
          role?: string
          updated_at?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
