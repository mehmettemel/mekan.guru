export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'user' | 'moderator' | 'admin';
export type PlaceStatus = 'pending' | 'approved' | 'rejected';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';
export type LocationType = 'country' | 'city' | 'district';

export interface MultilingualContent {
  en: string;
  tr: string;
  es?: string;
}

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          trust_score: number;
          role: UserRole;
          email_verified: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          trust_score?: number;
          role?: UserRole;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          trust_score?: number;
          role?: UserRole;
          email_verified?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          slug: string;
          names: MultilingualContent;
          icon: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          names: MultilingualContent;
          icon?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          names?: MultilingualContent;
          icon?: string | null;
          display_order?: number;
          created_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          parent_id: string | null;
          type: LocationType;
          slug: string;
          names: MultilingualContent;
          path: string | null;
          has_districts: boolean;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          parent_id?: string | null;
          type: LocationType;
          slug: string;
          names: MultilingualContent;
          path?: string | null;
          has_districts?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          parent_id?: string | null;
          type?: LocationType;
          slug?: string;
          names?: MultilingualContent;
          path?: string | null;
          has_districts?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      places: {
        Row: {
          id: string;
          location_id: string;
          category_id: string;
          slug: string;
          names: MultilingualContent;
          descriptions: MultilingualContent | null;
          address: string | null;
          phone: string | null;
          website: string | null;
          google_maps_url: string | null;
          latitude: number | null;
          longitude: number | null;
          images: string[] | null;
          status: PlaceStatus;
          vote_count: number;
          vote_score: number;
          rank: number | null;
          submitted_by: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          location_id: string;
          category_id: string;
          slug: string;
          names: MultilingualContent;
          descriptions?: MultilingualContent | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          google_maps_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          images?: string[] | null;
          status?: PlaceStatus;
          vote_count?: number;
          vote_score?: number;
          rank?: number | null;
          submitted_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          location_id?: string;
          category_id?: string;
          slug?: string;
          names?: MultilingualContent;
          descriptions?: MultilingualContent | null;
          address?: string | null;
          phone?: string | null;
          website?: string | null;
          google_maps_url?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          images?: string[] | null;
          status?: PlaceStatus;
          vote_count?: number;
          vote_score?: number;
          rank?: number | null;
          submitted_by?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      votes: {
        Row: {
          id: string;
          user_id: string;
          place_id: string;
          value: number;
          weight: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          place_id: string;
          value: number;
          weight?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          place_id?: string;
          value?: number;
          weight?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          place_id: string;
          user_id: string;
          reason: string;
          status: ReportStatus;
          resolved_by: string | null;
          resolved_at: string | null;
          resolution_note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          place_id: string;
          user_id: string;
          reason: string;
          status?: ReportStatus;
          resolved_by?: string | null;
          resolved_at?: string | null;
          resolution_note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          place_id?: string;
          user_id?: string;
          reason?: string;
          status?: ReportStatus;
          resolved_by?: string | null;
          resolved_at?: string | null;
          resolution_note?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      calculate_vote_weight: {
        Args: {
          user_created_at: string;
        };
        Returns: number;
      };
      update_place_ranks: {
        Args: {};
        Returns: void;
      };
    };
    Enums: {
      user_role: UserRole;
      place_status: PlaceStatus;
      report_status: ReportStatus;
      location_type: LocationType;
    };
  };
}
