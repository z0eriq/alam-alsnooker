export type GameType = "billiards" | "snooker" | "cards";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type TournamentStatus = "upcoming" | "current" | "previous" | "cancelled";

export type TournamentFormat = "knockout" | "groups" | "league";

export type MatchStatus =
  | "scheduled"
  | "live"
  | "paused"
  | "completed"
  | "cancelled";

export type PostType = "news" | "tournament" | "winner" | "photo" | "offer";

export interface Table {
  id: number;
  game_type: GameType;
  game_type_display: string;
  number: number;
  name: string;
  display_name: string;
  hourly_price: string | number;
  is_active: boolean;
  is_available: boolean;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  game_type: GameType;
  game_type_display: string;
  table: number | null;
  table_detail?: Table | null;
  customer_name: string;
  customer_phone: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_hours: string | number;
  status: BookingStatus;
  status_display: string;
  total_price: string | number;
  notes: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: number;
  tournament: number;
  name: string;
  phone: string;
  ranking: number;
  seed: number;
  notes: string;
  is_eliminated: boolean;
  created_at: string;
}

export interface BracketNode {
  id: number;
  tournament: number;
  round_number: number;
  position: number;
  player1: number | null;
  player2: number | null;
  winner: number | null;
  player1_name?: string | null;
  player2_name?: string | null;
  winner_name?: string | null;
  match: number | null;
}

export interface Tournament {
  id: number;
  name: string;
  slug: string;
  game_type: GameType;
  game_type_display: string;
  format: TournamentFormat;
  format_display?: string;
  status: TournamentStatus;
  status_display: string;
  start_date: string;
  end_date: string | null;
  prize_info: string;
  description?: string;
  max_participants?: number;
  entry_fee?: string | number;
  cover_image: string | null;
  is_published: boolean;
  players_count: number;
  players?: Player[];
  bracket?: BracketNode[];
  created_at?: string;
  updated_at?: string;
}

export interface Match {
  id: number;
  tournament: number | null;
  tournament_name?: string | null;
  game_type: GameType;
  game_type_display: string;
  table: number | null;
  table_detail?: Table | null;
  player1: number | null;
  player2: number | null;
  player1_name: string;
  player2_name: string;
  display_player1: string;
  display_player2: string;
  score1: number;
  score2: number;
  status: MatchStatus;
  status_display: string;
  scheduled_at: string | null;
  started_at: string | null;
  ended_at: string | null;
  round_label: string;
  winner: number | null;
  winner_name: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  title: string;
  body: string;
  post_type: PostType;
  post_type_display: string;
  image: string | null;
  is_published: boolean;
  is_featured: boolean;
  author: number | null;
  author_name: string | null;
  published_at: string;
  updated_at: string;
}

export interface DashboardStats {
  today_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  active_games: number;
  upcoming_tournaments: number;
  current_tournaments: number;
  available_tables: number;
  total_tables: number;
  revenue_today: number;
  revenue_month: number;
  tables_by_type: Array<{
    game_type: GameType;
    total: number;
    available: number;
  }>;
}

export interface ClubInfo {
  name: string;
  location: string;
  whatsapp: string;
  opening_hours: string;
  about: string;
  facebook_url: string;
  instagram_url: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role?: string;
  phone?: string;
  is_staff?: boolean;
  is_club_admin?: boolean;
}

export interface AvailabilityResponse {
  tables: Array<{ id: number; number: number; name: string }>;
  busy_slots: Array<{
    table_id: number | null;
    start_time: string;
    end_time: string;
    status: BookingStatus;
  }>;
}

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface LiveSocketMessage {
  type: string;
  event?: string;
  match?: Match;
  booking?: Booking;
  channel?: string;
}
