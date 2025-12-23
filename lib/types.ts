/**
 * This file defines types generated for our Supabase schema. For brevity,
 * it only includes a subset of columns necessary for the client. You can
 * regenerate this file using the Supabase CLI (`supabase gen types typescript --local`).
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          role: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          role?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          role?: string;
          created_at?: string;
        };
      };
      tickets: {
        Row: {
          id: string;
          created_by: string;
          scope: string;
          service_type: string;
          status: string;
          priority: string | null;
          ops_owner: string;
          assigned_to: string | null;
          origin: string | null;
          destination: string | null;
          commodity: string | null;
          qty: number | null;
          weight: number | null;
          volume: number | null;
          pickup_date: string | null;
          notes: string | null;
          submitted_at: string | null;
          closed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Row> & { id?: string };
        Update: Partial<Row>;
      };
      ticket_events: {
        Row: {
          id: string;
          ticket_id: string;
          event_type: string;
          actor_id: string;
          actor_role: string;
          from_status: string | null;
          to_status: string | null;
          payload_json: Json | null;
          created_at: string;
        };
        Insert: Partial<Row> & { id?: string };
        Update: Partial<Row>;
      };
      quotes: {
        Row: {
          id: string;
          ticket_id: string;
          all_in_amount: number | null;
          currency: string | null;
          validity_start: string | null;
          validity_end: string | null;
          lead_time_text: string | null;
          terms: string | null;
          exclusions: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: Partial<Row> & { id?: string };
        Update: Partial<Row>;
      };
      quote_line_items: {
        Row: {
          id: string;
          quote_id: string;
          label: string;
          amount: number;
        };
        Insert: Partial<Row> & { id?: string };
        Update: Partial<Row>;
      };
    };
    Views: {};
    Functions: {};
  };
}