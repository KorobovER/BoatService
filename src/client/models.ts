export type AmenitiesPublic = {
  data: Array<AmenityPublic>
  count: number
}

export type AmenityBase = {
  name: string
}

export type AmenityPublic = {
  name: string
  amenity_id: string
}

export type Boat = {
  boatname: string
  make: string
  model: string
  is_default?: boolean
  is_active?: boolean
  loa: number
  beam: number
  freeboard: number
  draft: number
  vessel_type: VesselType
  boat_id?: string
  created_at?: string
  updated_at: string
  owner_id: string
}

export type BoatBase = {
  boatname: string
  make: string
  model: string
  is_default?: boolean
  is_active?: boolean
  loa: number
  beam: number
  freeboard: number
  draft: number
  vessel_type: VesselType
}

export type BoatCreate = {
  boatname: string
  make: string
  model: string
  is_default?: boolean
  is_active?: boolean
  loa: number
  beam: number
  freeboard: number
  draft: number
  vessel_type: VesselType
}

export type BoatPublic = {
  boatname: string
  make: string
  model: string
  is_default?: boolean
  is_active?: boolean
  loa: number
  beam: number
  freeboard: number
  draft: number
  vessel_type: VesselType
  boat_id: string
  owner_id: string
}

export type BoatUpdate = {
  boatname: string | null
  make: string | null
  model: string | null
  is_default: boolean | null
  is_active?: boolean
  loa: number | null
  beam: number | null
  freeboard: number | null
  draft: number | null
  vessel_type: VesselType | null
  boat_id: string
}

export type BoatsPublic = {
  data: Array<BoatPublic>
  count: number
}

export type Body_login_employees_login_access_token = {
  grant_type?: string | null
  username: string
  password: string
  scope?: string
  client_id?: string | null
  client_secret?: string | null
}

export type Body_login_users_login_access_token_user = {
  grant_type?: string | null
  username: string
  password: string
  scope?: string
  client_id?: string | null
  client_secret?: string | null
}

export type Body_users_create_profile_pic_me = {
  file: Blob | File
}

export type DurationType = "hourly" | "daily" | "weekly" | "custom"

export type EmployeeCreate = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  marina_id?: string | null
  password: string
}

export type EmployeePublic = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  marina_id: string | null
  id: string
  created_at: string
  updated_at: string
  marina: MarinaPublicBase | null
}

export type EmployeeRegister = {
  email: string
  password: string
  full_name?: string | null
  marina_id?: string | null
}

export type EmployeeUpdate = {
  email?: string | null
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  marina_id?: string | null
  password?: string | null
}

export type EmployeeUpdateMe = {
  full_name?: string | null
  email?: string | null
}

export type EmployeesPublic = {
  data: Array<EmployeePublic>
  count: number
}

export type HTTPValidationError = {
  detail?: Array<ValidationError>
}

export type Item = {
  title: string
  description?: string | null
  id?: string
  owner_id: string
}

export type ItemCreate = {
  title: string
  description?: string | null
}

export type ItemPublic = {
  title: string
  description?: string | null
  id: string
  owner_id: string
}

export type ItemUpdate = {
  title?: string | null
  description?: string | null
}

export type ItemsPublic = {
  data: Array<ItemPublic>
  count: number
}

export type MarinaBase = {
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  website: string
  contact_phone: string
  contact_email: string
  approach: string | null
  vhf_channel: number | null
  image_thumbnail_url: string | null
  logo_url: string | null
  subregion: SubRegion
}

export type MarinaCreate = {
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  website: string
  contact_phone: string
  contact_email: string
  approach: string | null
  vhf_channel: number | null
  image_thumbnail_url: string | null
  logo_url: string | null
  subregion: SubRegion
}

export type MarinaPublic = {
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  website: string
  contact_phone: string
  contact_email: string
  approach: string | null
  vhf_channel: number | null
  image_thumbnail_url: string | null
  logo_url: string | null
  subregion: SubRegion
  marina_id: string
  amenities: Array<AmenityBase>
  services: Array<MarinaServiceBase>
  mooring_balls: Array<MooringBall>
  min_price: Array<MooringBallPricingPublic>
}

export type MarinaPublicBase = {
  name: string
  description: string | null
  address: string
  latitude: number
  longitude: number
  website: string
  contact_phone: string
  contact_email: string
  approach: string | null
  vhf_channel: number | null
  image_thumbnail_url: string | null
  logo_url: string | null
  subregion: SubRegion
  marina_id: string
  amenities: Array<AmenityBase>
  services: Array<MarinaServiceBase>
}

export type MarinaServiceBase = {
  name: string
  description: string | null
  price: number
  is_active?: boolean
}

export type MarinaUpdate = {
  name: string | null
  description: string | null
  address: string | null
  website: string | null
  contact_phone: string | null
  contact_email: string | null
  approach: string | null
  vhf_channel: number | null
}

export type MarinasPublic = {
  data: Array<MarinaPublic>
  count: number
}

export type Message = {
  message: string
}

export type MooringBall = {
  mooring_ball_id: string
  ball_number: number
  version: string
  latitude: number
  longitude: number
  is_active?: boolean
  depth: number
  created_at?: string
  updated_at: string
  marina_id: string
}

export type MooringBallBase = {
  mooring_ball_id: string
  ball_number: number
  version: string
  latitude: number
  longitude: number
  is_active?: boolean
  depth: number
}

export type MooringBallCreate = {
  mooring_ball_id: string
  ball_number: number
  version: string
  latitude: number
  longitude: number
  is_active?: boolean
  depth: number
  marina_id: string
}

export type MooringBallPricingPublic = {
  duration: DurationType
  rate: number
}

export type MooringBallPublic = {
  mooring_ball_id: string
  ball_number: number
  version: string
  latitude: number
  longitude: number
  is_active?: boolean
  depth: number
  marina_id: string
  marina: MarinaBase
  pricing_list: Array<MooringBallPricingPublic>
}

export type MooringBallUpdate = {
  ball_number: number | null
  is_active: boolean | null
}

export type MooringBallWithReservationBasePublic = {
  mooring_ball_id: string
  ball_number: number
  version: string
  latitude: number
  longitude: number
  is_active?: boolean
  depth: number
  marina_id: string
  marina: MarinaBase
  pricing_list: Array<MooringBallPricingPublic>
  reservations: Array<ReservationBase>
}

export type MooringBallWithReservationsPublic = {
  mooring_ball_id: string
  ball_number: number
  version: string
  latitude: number
  longitude: number
  is_active?: boolean
  depth: number
  marina_id: string
  marina: MarinaBase
  pricing_list: Array<MooringBallPricingPublic>
  reservations: Array<Reservation>
}

export type MooringBallsPublic = {
  data: Array<MooringBallPublic>
  count: number
}

export type MooringBallsWithReservationBasePublic = {
  data: Array<MooringBallWithReservationBasePublic>
  count: number
}

export type NewPassword = {
  token: string
  new_password: string
}

export type PaymentDetailsSimple = {
  last4: string
  brand: string
}

export type RegionData = {
  name: string
  subregions: Array<SubRegionData>
}

export type Reservation = {
  mooring_ball_id: string
  user_id: string
  boat_id: string
  start_date: string
  end_date: string
  reservation_id?: string
  status: ReservationStatus
  applied_rate_type: DurationType
  applied_rate: number
  payment_details?: Record<string, unknown>
  arrived_time?: string | null
  departed_time?: string | null
  created_at?: string
  updated_at: string
}

export type ReservationBase = {
  mooring_ball_id: string
  user_id: string
  boat_id: string
  start_date: string
  end_date: string
}

export type ReservationCreate = {
  mooring_ball_id: string
  user_id: string
  boat_id: string
  start_date: string
  end_date: string
  price: number
  payment_method_id?: string | null
  timezone?: string | null
}

export type ReservationCreatedPublic = {
  mooring_ball_id: string
  user_id: string
  boat_id: string
  start_date: string
  end_date: string
  reservation_id: string
  status: ReservationStatus
  applied_rate_type: DurationType
  applied_rate: number
  arrived_time: string | null
  departed_time: string | null
  mooring_ball: MooringBallBase
  marina: MarinaPublicBase
  user: UserBase
  boat: BoatBase
  payment_details_simple: PaymentDetailsSimple | null
  stripe_client_secret: string | null
}

export type ReservationPublic = {
  mooring_ball_id: string
  user_id: string
  boat_id: string
  start_date: string
  end_date: string
  reservation_id: string
  status: ReservationStatus
  applied_rate_type: DurationType
  applied_rate: number
  arrived_time: string | null
  departed_time: string | null
  mooring_ball: MooringBallBase
  marina: MarinaPublicBase
  user: UserBase
  boat: BoatBase
  payment_details_simple: PaymentDetailsSimple | null
}

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_in_locked"
  | "checked_out"
  | "cancelled"
  | "no_show"
  | "payment_failed"

export type ReservationUpdate = {
  mooring_ball_id: string | null
  boat_id: string | null
  status: ReservationStatus | null
  start_date: string | null
  end_date: string | null
}

export type ReservationsPublic = {
  data: Array<ReservationPublic>
  count: number
}

export type ServiceRequest = {
  service_id: string
  quantity: number
  requested_date: string
}

export type ServicesPublic = {
  data: Array<MarinaServiceBase>
  count: number
}

export type SubRegion =
  | "British Virgin Islands"
  | "US Virgin Islands"
  | "Antigua"
  | "Grenada"
  | "St. Lucia"
  | "St. Martin"
  | "United States of America"
  | "Bahamas"
  | "Belize"
  | "Mexico"
  | "Croatia"
  | "Greece"
  | "Italy"
  | "Spain"
  | "Seychelle"
  | "Tahiti"
  | "Thailand"

export type SubRegionData = {
  name: string
  center: unknown[] | null
  zoom: number | null
  is_new: boolean | null
}

export type Token = {
  access_token: string
  token_type?: string
}

export type UpdatePassword = {
  current_password: string
  new_password: string
}

export type UserBase = {
  email: string
  is_active?: boolean
  first_name: string
  last_name: string
  preferred_name?: string | null
  country_code: number
  phone_number: string
  emergency_contact_name?: string | null
  emergency_contact_country_code?: number | null
  emergency_contact_phone_number?: string | null
  mailing_address?: string | null
  mailing_city?: string | null
  mailing_state?: string | null
  mailing_postal_code?: string | null
  mailing_country?: string | null
  profile_pic_url?: string | null
  sign_up_code?: string | null
}

export type UserPublic = {
  email: string
  is_active?: boolean
  first_name: string
  last_name: string
  preferred_name?: string | null
  country_code: number
  phone_number: string
  emergency_contact_name?: string | null
  emergency_contact_country_code?: number | null
  emergency_contact_phone_number?: string | null
  mailing_address?: string | null
  mailing_city?: string | null
  mailing_state?: string | null
  mailing_postal_code?: string | null
  mailing_country?: string | null
  profile_pic_url?: string | null
  sign_up_code?: string | null
  id: string
  referral_code: string
  display_name: string
  created_at: string
  updated_at: string
  items: Array<Item>
  reservations: Array<Reservation>
  active_boats: Array<Boat>
}

export type UserRegister = {
  email: string
  password: string
  first_name: string
  last_name: string
  country_code: number
  phone_number: string
  sign_up_code?: string | null
}

export type UserUpdate = {
  email?: string | null
  is_active?: boolean
  first_name?: string | null
  last_name?: string | null
  preferred_name?: string | null
  country_code: number
  phone_number: string
  emergency_contact_name?: string | null
  emergency_contact_country_code?: number | null
  emergency_contact_phone_number?: string | null
  mailing_address?: string | null
  mailing_city?: string | null
  mailing_state?: string | null
  mailing_postal_code?: string | null
  mailing_country?: string | null
  profile_pic_url?: string | null
  sign_up_code?: string | null
  password?: string | null
}

export type UserUpdateMe = {
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  preferred_name?: string | null
  country_code?: number | null
  phone_number?: string | null
  emergency_contact_name?: string | null
  emergency_contact_country_code?: number | null
  emergency_contact_phone_number?: string | null
  mailing_address?: string | null
  mailing_city?: string | null
  mailing_state?: string | null
  mailing_postal_code?: string | null
  mailing_country?: string | null
}

export type UsersPublic = {
  data: Array<UserPublic>
  count: number
}

export type ValidationError = {
  loc: Array<string | number>
  msg: string
  type: string
}

export type VesselType = "monohull" | "catamaran" | "power"

export type VesselTypePublic = {
  type: string
  value: string
}

export type VesselTypesPublic = {
  data: Array<VesselTypePublic>
  count: number
}
