export type AmenitiesPublic = {
  data: Array<AmenityPublic>
  count: number
}

export type AmenityBase = {
  name: string
  ranking?: number
}

export type AmenityPublic = {
  name: string
  ranking?: number
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
  registration_image_url: string | null
  insurance_image_url: string | null
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
  registration_image_url: string | null
  insurance_image_url: string | null
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
  registration_image_url: string | null
  insurance_image_url: string | null
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
  registration_image_url: string | null
  insurance_image_url: string | null
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
  registration_image_url: string | null
  insurance_image_url: string | null
}

export type BoatsPublic = {
  data: Array<BoatPublic>
  count: number
}

export type Body_boats_update_boat_docs = {
  file_registration?: Blob | File | null
  file_insurance?: Blob | File | null
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

export type Coordinate = {
  latitude: number
  longitude: number
}

export type DurationType = "hourly" | "daily" | "weekly" | "custom"

export type EmployeeCreate = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  password: string
  marina_id?: string | null
}

export type EmployeePublic = {
  email: string
  is_active?: boolean
  is_superuser?: boolean
  full_name?: string | null
  id: string
  created_at: string
  updated_at: string
  marinas: Array<MarinaPublicBase>
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
  password?: string | null
  marina_links?: Array<string>
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
  latitude: number
  longitude: number
  name: string
  marina_code: string
  description: string | null
  address: string
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
  latitude: number
  longitude: number
  name: string
  marina_code: string
  description: string | null
  address: string
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
  latitude: number
  longitude: number
  name: string
  marina_code: string
  description: string | null
  address: string
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
  mooring_balls: Array<MooringBall>
  min_price: Array<MooringBallPricingPublic>
  active_services: Array<MarinaServicePublic>
}

export type MarinaPublicBase = {
  latitude: number
  longitude: number
  name: string
  marina_code: string
  description: string | null
  address: string
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
}

export type MarinaServiceItem = {
  name: string
  price: number
  unit: string
  type: string
}

export type MarinaServicePublic = {
  title: string
  description: string | null
  service_items?: Array<MarinaServiceItem>
  service_id: string
}

export type MarinaServicesPublic = {
  data: Array<MarinaServicePublic>
  count: number
}

export type MarinaUpdate = {
  name: string | null
  marina_code: string | null
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
  latitude: number
  longitude: number
  mooring_ball_id: string
  ball_number: number
  version: string
  is_active?: boolean
  depth: number
  created_at?: string
  updated_at: string
  marina_id: string
}

export type MooringBallBase = {
  latitude: number
  longitude: number
  mooring_ball_id: string
  ball_number: number
  version: string
  is_active?: boolean
  depth: number
}

export type MooringBallCreate = {
  latitude: number
  longitude: number
  mooring_ball_id: string
  ball_number: number
  version: string
  is_active?: boolean
  depth: number
  marina_id: string
}

export type MooringBallPricingPublic = {
  duration: DurationType
  rate: number
}

export type MooringBallPublic = {
  latitude: number
  longitude: number
  mooring_ball_id: string
  ball_number: number
  version: string
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
  latitude: number
  longitude: number
  mooring_ball_id: string
  ball_number: number
  version: string
  is_active?: boolean
  depth: number
  marina_id: string
  marina: MarinaBase
  pricing_list: Array<MooringBallPricingPublic>
  reservations: Array<ReservationBase>
}

export type MooringBallWithReservationsPublic = {
  latitude: number
  longitude: number
  mooring_ball_id: string
  ball_number: number
  version: string
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

export type PaymentMethodPublic = {
  id: string
  is_default: boolean
  card: StripeCardPublic
}

export type RegionData = {
  name: string
  subregions: Array<SubRegionData>
}

export type RegionStateData = {
  region_data: Array<RegionData>
  closest_subregion: SubRegionData | null
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
  service_requests: Array<ServiceOnReservationPublic>
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
  service_requests: Array<ServiceOnReservationPublic>
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

export type ServiceOnReservation = {
  service_reservation_id?: string
  receipt_id: string
  created_at?: string
  updated_at: string
  requested_date?: string
  status: ServiceRequestStatus
  services?: Array<SubServiceRequest>
  special_instructions: string | null
  total_price: number
  payment_details?: Record<string, unknown>
  approved_by_user: string | null
  confirmation_image_url: string | null
  reservation_id: string
}

export type ServiceOnReservationCreate = {
  requested_date: string
  requests: Array<SubServiceRequest>
  special_instructions: string | null
}

export type ServiceOnReservationPublic = {
  service_reservation_id: string
  receipt_id: string
  requested_date: string
  status: ServiceRequestStatus
  services: Array<SubServiceRequest>
  special_instructions: string | null
  total_price: number
  payment_details_simple: PaymentDetailsSimple | null
}

export type ServiceRequestStatus =
  | "initialized"
  | "confirmed"
  | "en-route"
  | "denied"
  | "delivered"
  | "completed"
  | "cancelled"
  | "failed"

export type StripeCardPublic = {
  country: string
  display_brand: string
  exp_month: number
  exp_year: number
  last4: string
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
  center: Coordinate | null
  zoom: number | null
  is_new: boolean | null
}

export type SubServiceRequest = {
  name: string
  quantity: number
  price: number
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
  country_code_name: string
  phone_number: string
  emergency_contact_name?: string | null
  emergency_contact_country_code?: number | null
  emergency_contact_country_code_name?: string | null
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
  country_code_name: string
  phone_number: string
  emergency_contact_name?: string | null
  emergency_contact_country_code?: number | null
  emergency_contact_country_code_name?: string | null
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
  country_code_name: string
  phone_number: string
  sign_up_code?: string | null
}

export type UserReservationsPublic = {
  today: ReservationPublic | null
  upcoming: Array<ReservationPublic>
  past: Array<ReservationPublic>
  cancelled: Array<ReservationPublic>
  count: number
}

export type UserUpdate = {
  email?: string | null
  is_active?: boolean
  first_name?: string | null
  last_name?: string | null
  preferred_name?: string | null
  country_code?: number | null
  country_code_name?: string | null
  phone_number?: string | null
  emergency_contact_name?: string | null
  emergency_contact_country_code?: number | null
  emergency_contact_country_code_name?: string | null
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
  country_code_name?: string | null
  phone_number?: string | null
  emergency_contact_name?: string | null
  emergency_contact_country_code?: number | null
  emergency_contact_country_code_name?: string | null
  emergency_contact_phone_number?: string | null
  mailing_address?: string | null
  mailing_city?: string | null
  mailing_state?: string | null
  mailing_postal_code?: string | null
  mailing_country?: string | null
}

export type UserWithPaymentPublic = {
  email: string
  is_active?: boolean
  first_name: string
  last_name: string
  preferred_name?: string | null
  country_code: number
  country_code_name: string
  phone_number: string
  emergency_contact_name?: string | null
  emergency_contact_country_code?: number | null
  emergency_contact_country_code_name?: string | null
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
  payment_methods: Array<PaymentMethodPublic>
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
