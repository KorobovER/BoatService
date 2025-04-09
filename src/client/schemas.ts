export const $AmenitiesPublic = {
  properties: {
    data: {
      type: "array",
      contains: {
        type: "AmenityPublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $AmenityBase = {
  properties: {
    name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    ranking: {
      type: "number",
      default: 1,
      maximum: 100,
      minimum: 0,
    },
  },
} as const

export const $AmenityPublic = {
  properties: {
    name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    ranking: {
      type: "number",
      default: 1,
      maximum: 100,
      minimum: 0,
    },
    amenity_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
  },
} as const

export const $Boat = {
  properties: {
    boatname: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    make: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    model: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    is_default: {
      type: "boolean",
      default: false,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    loa: {
      type: "number",
      isRequired: true,
    },
    beam: {
      type: "number",
      isRequired: true,
    },
    freeboard: {
      type: "number",
      isRequired: true,
    },
    draft: {
      type: "number",
      isRequired: true,
    },
    vessel_type: {
      type: "VesselType",
      isRequired: true,
    },
    registration_image_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    insurance_image_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    boat_id: {
      type: "string",
      format: "uuid",
    },
    created_at: {
      type: "string",
      format: "date-time",
    },
    updated_at: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    owner_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
  },
} as const

export const $BoatBase = {
  properties: {
    boatname: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    make: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    model: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    is_default: {
      type: "boolean",
      default: false,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    loa: {
      type: "number",
      isRequired: true,
    },
    beam: {
      type: "number",
      isRequired: true,
    },
    freeboard: {
      type: "number",
      isRequired: true,
    },
    draft: {
      type: "number",
      isRequired: true,
    },
    vessel_type: {
      type: "VesselType",
      isRequired: true,
    },
    registration_image_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    insurance_image_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
  },
} as const

export const $BoatCreate = {
  properties: {
    boatname: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    make: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    model: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    is_default: {
      type: "boolean",
      default: false,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    loa: {
      type: "number",
      isRequired: true,
    },
    beam: {
      type: "number",
      isRequired: true,
    },
    freeboard: {
      type: "number",
      isRequired: true,
    },
    draft: {
      type: "number",
      isRequired: true,
    },
    vessel_type: {
      type: "VesselType",
      isRequired: true,
    },
    registration_image_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    insurance_image_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
  },
} as const

export const $BoatPublic = {
  properties: {
    boatname: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    make: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    model: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    is_default: {
      type: "boolean",
      default: false,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    loa: {
      type: "number",
      isRequired: true,
    },
    beam: {
      type: "number",
      isRequired: true,
    },
    freeboard: {
      type: "number",
      isRequired: true,
    },
    draft: {
      type: "number",
      isRequired: true,
    },
    vessel_type: {
      type: "VesselType",
      isRequired: true,
    },
    registration_image_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    insurance_image_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    boat_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    owner_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
  },
} as const

export const $BoatUpdate = {
  properties: {
    boatname: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    make: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    model: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    is_default: {
      type: "any-of",
      contains: [
        {
          type: "boolean",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    loa: {
      type: "any-of",
      contains: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    beam: {
      type: "any-of",
      contains: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    freeboard: {
      type: "any-of",
      contains: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    draft: {
      type: "any-of",
      contains: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    vessel_type: {
      type: "any-of",
      contains: [
        {
          type: "VesselType",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    registration_image_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    insurance_image_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
  },
} as const

export const $BoatsPublic = {
  properties: {
    data: {
      type: "array",
      contains: {
        type: "BoatPublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $Body_boats_update_boat_docs = {
  properties: {
    file_registration: {
      type: "any-of",
      contains: [
        {
          type: "binary",
          format: "binary",
        },
        {
          type: "null",
        },
      ],
    },
    file_insurance: {
      type: "any-of",
      contains: [
        {
          type: "binary",
          format: "binary",
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $Body_login_employees_login_access_token = {
  properties: {
    grant_type: {
      type: "any-of",
      contains: [
        {
          type: "string",
          pattern: "password",
        },
        {
          type: "null",
        },
      ],
    },
    username: {
      type: "string",
      isRequired: true,
    },
    password: {
      type: "string",
      isRequired: true,
    },
    scope: {
      type: "string",
      default: "",
    },
    client_id: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
    },
    client_secret: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $Body_login_users_login_access_token_user = {
  properties: {
    grant_type: {
      type: "any-of",
      contains: [
        {
          type: "string",
          pattern: "password",
        },
        {
          type: "null",
        },
      ],
    },
    username: {
      type: "string",
      isRequired: true,
    },
    password: {
      type: "string",
      isRequired: true,
    },
    scope: {
      type: "string",
      default: "",
    },
    client_id: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
    },
    client_secret: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $Body_users_create_profile_pic_me = {
  properties: {
    file: {
      type: "binary",
      isRequired: true,
      format: "binary",
    },
  },
} as const

export const $Coordinate = {
  properties: {
    latitude: {
      type: "number",
      isRequired: true,
      maximum: 90,
      minimum: -90,
    },
    longitude: {
      type: "number",
      isRequired: true,
      maximum: 180,
      minimum: -180,
    },
  },
} as const

export const $DurationType = {
  type: "Enum",
  enum: ["hourly", "daily", "weekly", "custom"],
} as const

export const $EmployeeCreate = {
  properties: {
    email: {
      type: "string",
      isRequired: true,
      format: "email",
      maxLength: 64,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    is_superuser: {
      type: "boolean",
      default: false,
    },
    full_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    password: {
      type: "string",
      isRequired: true,
      maxLength: 40,
      minLength: 8,
    },
    marina_id: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "uuid",
          maxLength: 32,
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $EmployeePublic = {
  properties: {
    email: {
      type: "string",
      isRequired: true,
      format: "email",
      maxLength: 64,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    is_superuser: {
      type: "boolean",
      default: false,
    },
    full_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    created_at: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    updated_at: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    marinas: {
      type: "array",
      contains: {
        type: "MarinaPublicBase",
      },
      isRequired: true,
    },
  },
} as const

export const $EmployeeRegister = {
  properties: {
    email: {
      type: "string",
      isRequired: true,
      format: "email",
      maxLength: 255,
    },
    password: {
      type: "string",
      isRequired: true,
      maxLength: 40,
      minLength: 8,
    },
    full_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    marina_id: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "uuid",
          maxLength: 32,
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $EmployeeUpdate = {
  properties: {
    email: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "email",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    is_superuser: {
      type: "boolean",
      default: false,
    },
    full_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    password: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 40,
          minLength: 8,
        },
        {
          type: "null",
        },
      ],
    },
    marina_links: {
      type: "array",
      contains: {
        type: "string",
        format: "uuid",
      },
      default: [],
    },
  },
} as const

export const $EmployeeUpdateMe = {
  properties: {
    full_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    email: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "email",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $EmployeesPublic = {
  properties: {
    data: {
      type: "array",
      contains: {
        type: "EmployeePublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $HTTPValidationError = {
  properties: {
    detail: {
      type: "array",
      contains: {
        type: "ValidationError",
      },
    },
  },
} as const

export const $Item = {
  properties: {
    title: {
      type: "string",
      isRequired: true,
      maxLength: 64,
    },
    description: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
    },
    id: {
      type: "string",
      format: "uuid",
    },
    owner_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
  },
} as const

export const $ItemCreate = {
  properties: {
    title: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 1,
    },
    description: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $ItemPublic = {
  properties: {
    title: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 1,
    },
    description: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
    },
    id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    owner_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
  },
} as const

export const $ItemUpdate = {
  properties: {
    title: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
          minLength: 1,
        },
        {
          type: "null",
        },
      ],
    },
    description: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $ItemsPublic = {
  properties: {
    data: {
      type: "array",
      contains: {
        type: "ItemPublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $MarinaBase = {
  properties: {
    latitude: {
      type: "number",
      isRequired: true,
      maximum: 90,
      minimum: -90,
    },
    longitude: {
      type: "number",
      isRequired: true,
      maximum: 180,
      minimum: -180,
    },
    name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    marina_code: {
      type: "string",
      isRequired: true,
      maxLength: 4,
      minLength: 4,
    },
    description: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    address: {
      type: "string",
      isRequired: true,
      maxLength: 255,
      minLength: 3,
    },
    website: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    contact_phone: {
      type: "string",
      isRequired: true,
      maxLength: 20,
      minLength: 3,
    },
    contact_email: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    approach: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    vhf_channel: {
      type: "any-of",
      contains: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    image_thumbnail_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    logo_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    subregion: {
      type: "SubRegion",
      isRequired: true,
    },
  },
} as const

export const $MarinaCreate = {
  properties: {
    latitude: {
      type: "number",
      isRequired: true,
      maximum: 90,
      minimum: -90,
    },
    longitude: {
      type: "number",
      isRequired: true,
      maximum: 180,
      minimum: -180,
    },
    name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    marina_code: {
      type: "string",
      isRequired: true,
      maxLength: 4,
      minLength: 4,
    },
    description: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    address: {
      type: "string",
      isRequired: true,
      maxLength: 255,
      minLength: 3,
    },
    website: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    contact_phone: {
      type: "string",
      isRequired: true,
      maxLength: 20,
      minLength: 3,
    },
    contact_email: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    approach: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    vhf_channel: {
      type: "any-of",
      contains: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    image_thumbnail_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    logo_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    subregion: {
      type: "SubRegion",
      isRequired: true,
    },
  },
} as const

export const $MarinaPublic = {
  properties: {
    latitude: {
      type: "number",
      isRequired: true,
      maximum: 90,
      minimum: -90,
    },
    longitude: {
      type: "number",
      isRequired: true,
      maximum: 180,
      minimum: -180,
    },
    name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    marina_code: {
      type: "string",
      isRequired: true,
      maxLength: 4,
      minLength: 4,
    },
    description: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    address: {
      type: "string",
      isRequired: true,
      maxLength: 255,
      minLength: 3,
    },
    website: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    contact_phone: {
      type: "string",
      isRequired: true,
      maxLength: 20,
      minLength: 3,
    },
    contact_email: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    approach: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    vhf_channel: {
      type: "any-of",
      contains: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    image_thumbnail_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    logo_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    subregion: {
      type: "SubRegion",
      isRequired: true,
    },
    marina_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    amenities: {
      type: "array",
      contains: {
        type: "AmenityBase",
      },
      isRequired: true,
    },
    mooring_balls: {
      type: "array",
      contains: {
        type: "MooringBall",
      },
      isRequired: true,
    },
    min_price: {
      type: "array",
      contains: {
        type: "MooringBallPricingPublic",
      },
      isRequired: true,
    },
    active_services: {
      type: "array",
      contains: {
        type: "MarinaServicePublic",
      },
      isRequired: true,
    },
  },
} as const

export const $MarinaPublicBase = {
  properties: {
    latitude: {
      type: "number",
      isRequired: true,
      maximum: 90,
      minimum: -90,
    },
    longitude: {
      type: "number",
      isRequired: true,
      maximum: 180,
      minimum: -180,
    },
    name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    marina_code: {
      type: "string",
      isRequired: true,
      maxLength: 4,
      minLength: 4,
    },
    description: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    address: {
      type: "string",
      isRequired: true,
      maxLength: 255,
      minLength: 3,
    },
    website: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    contact_phone: {
      type: "string",
      isRequired: true,
      maxLength: 20,
      minLength: 3,
    },
    contact_email: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    approach: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    vhf_channel: {
      type: "any-of",
      contains: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    image_thumbnail_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    logo_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    subregion: {
      type: "SubRegion",
      isRequired: true,
    },
    marina_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    amenities: {
      type: "array",
      contains: {
        type: "AmenityBase",
      },
      isRequired: true,
    },
  },
} as const

export const $MarinaServiceItem = {
  properties: {
    name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    price: {
      type: "number",
      isRequired: true,
      maximum: 1000,
      minimum: 0,
    },
    unit: {
      type: "string",
      isRequired: true,
    },
    type: {
      type: "string",
      isRequired: true,
    },
  },
} as const

export const $MarinaServicePublic = {
  properties: {
    title: {
      type: "string",
      isRequired: true,
      maxLength: 64,
      minLength: 3,
    },
    description: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    service_items: {
      type: "array",
      contains: {
        type: "MarinaServiceItem",
      },
    },
    service_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
  },
} as const

export const $MarinaServicesPublic = {
  properties: {
    data: {
      type: "array",
      contains: {
        type: "MarinaServicePublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $MarinaUpdate = {
  properties: {
    name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    marina_code: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 4,
          minLength: 4,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    description: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    address: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    website: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    contact_phone: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    contact_email: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    approach: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
          minLength: 3,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    vhf_channel: {
      type: "any-of",
      contains: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
  },
} as const

export const $MarinasPublic = {
  properties: {
    data: {
      type: "array",
      contains: {
        type: "MarinaPublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $Message = {
  properties: {
    message: {
      type: "string",
      isRequired: true,
    },
  },
} as const

export const $MooringBall = {
  properties: {
    latitude: {
      type: "number",
      isRequired: true,
      maximum: 90,
      minimum: -90,
    },
    longitude: {
      type: "number",
      isRequired: true,
      maximum: 180,
      minimum: -180,
    },
    mooring_ball_id: {
      type: "string",
      isRequired: true,
      maxLength: 8,
      minLength: 8,
    },
    ball_number: {
      type: "number",
      isRequired: true,
    },
    version: {
      type: "string",
      isRequired: true,
      maxLength: 5,
      minLength: 3,
    },
    is_active: {
      type: "boolean",
      default: false,
    },
    depth: {
      type: "number",
      isRequired: true,
    },
    created_at: {
      type: "string",
      format: "date-time",
    },
    updated_at: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    marina_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
  },
} as const

export const $MooringBallBase = {
  properties: {
    latitude: {
      type: "number",
      isRequired: true,
      maximum: 90,
      minimum: -90,
    },
    longitude: {
      type: "number",
      isRequired: true,
      maximum: 180,
      minimum: -180,
    },
    mooring_ball_id: {
      type: "string",
      isRequired: true,
      maxLength: 8,
      minLength: 8,
    },
    ball_number: {
      type: "number",
      isRequired: true,
    },
    version: {
      type: "string",
      isRequired: true,
      maxLength: 5,
      minLength: 3,
    },
    is_active: {
      type: "boolean",
      default: false,
    },
    depth: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $MooringBallCreate = {
  properties: {
    latitude: {
      type: "number",
      isRequired: true,
      maximum: 90,
      minimum: -90,
    },
    longitude: {
      type: "number",
      isRequired: true,
      maximum: 180,
      minimum: -180,
    },
    mooring_ball_id: {
      type: "string",
      isRequired: true,
      maxLength: 8,
      minLength: 8,
    },
    ball_number: {
      type: "number",
      isRequired: true,
    },
    version: {
      type: "string",
      isRequired: true,
      maxLength: 5,
      minLength: 3,
    },
    is_active: {
      type: "boolean",
      default: false,
    },
    depth: {
      type: "number",
      isRequired: true,
    },
    marina_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
  },
} as const

export const $MooringBallPricingPublic = {
  properties: {
    duration: {
      type: "DurationType",
      isRequired: true,
    },
    rate: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $MooringBallPublic = {
  properties: {
    latitude: {
      type: "number",
      isRequired: true,
      maximum: 90,
      minimum: -90,
    },
    longitude: {
      type: "number",
      isRequired: true,
      maximum: 180,
      minimum: -180,
    },
    mooring_ball_id: {
      type: "string",
      isRequired: true,
    },
    ball_number: {
      type: "number",
      isRequired: true,
    },
    version: {
      type: "string",
      isRequired: true,
      maxLength: 5,
      minLength: 3,
    },
    is_active: {
      type: "boolean",
      default: false,
    },
    depth: {
      type: "number",
      isRequired: true,
    },
    marina_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    marina: {
      type: "MarinaBase",
      isRequired: true,
    },
    pricing_list: {
      type: "array",
      contains: {
        type: "MooringBallPricingPublic",
      },
      isRequired: true,
    },
  },
} as const

export const $MooringBallUpdate = {
  properties: {
    ball_number: {
      type: "any-of",
      contains: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    is_active: {
      type: "any-of",
      contains: [
        {
          type: "boolean",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
  },
} as const

export const $MooringBallWithReservationBasePublic = {
  properties: {
    latitude: {
      type: "number",
      isRequired: true,
      maximum: 90,
      minimum: -90,
    },
    longitude: {
      type: "number",
      isRequired: true,
      maximum: 180,
      minimum: -180,
    },
    mooring_ball_id: {
      type: "string",
      isRequired: true,
    },
    ball_number: {
      type: "number",
      isRequired: true,
    },
    version: {
      type: "string",
      isRequired: true,
      maxLength: 5,
      minLength: 3,
    },
    is_active: {
      type: "boolean",
      default: false,
    },
    depth: {
      type: "number",
      isRequired: true,
    },
    marina_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    marina: {
      type: "MarinaBase",
      isRequired: true,
    },
    pricing_list: {
      type: "array",
      contains: {
        type: "MooringBallPricingPublic",
      },
      isRequired: true,
    },
    reservations: {
      type: "array",
      contains: {
        type: "ReservationBase",
      },
      isRequired: true,
    },
  },
} as const

export const $MooringBallWithReservationsPublic = {
  properties: {
    latitude: {
      type: "number",
      isRequired: true,
      maximum: 90,
      minimum: -90,
    },
    longitude: {
      type: "number",
      isRequired: true,
      maximum: 180,
      minimum: -180,
    },
    mooring_ball_id: {
      type: "string",
      isRequired: true,
    },
    ball_number: {
      type: "number",
      isRequired: true,
    },
    version: {
      type: "string",
      isRequired: true,
      maxLength: 5,
      minLength: 3,
    },
    is_active: {
      type: "boolean",
      default: false,
    },
    depth: {
      type: "number",
      isRequired: true,
    },
    marina_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    marina: {
      type: "MarinaBase",
      isRequired: true,
    },
    pricing_list: {
      type: "array",
      contains: {
        type: "MooringBallPricingPublic",
      },
      isRequired: true,
    },
    reservations: {
      type: "array",
      contains: {
        type: "Reservation",
      },
      isRequired: true,
    },
  },
} as const

export const $MooringBallsPublic = {
  properties: {
    data: {
      type: "array",
      contains: {
        type: "MooringBallPublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $MooringBallsWithReservationBasePublic = {
  properties: {
    data: {
      type: "array",
      contains: {
        type: "MooringBallWithReservationBasePublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $NewPassword = {
  properties: {
    token: {
      type: "string",
      isRequired: true,
    },
    new_password: {
      type: "string",
      isRequired: true,
      maxLength: 40,
      minLength: 8,
    },
  },
} as const

export const $PaymentDetailsSimple = {
  properties: {
    last4: {
      type: "string",
      isRequired: true,
    },
    brand: {
      type: "string",
      isRequired: true,
    },
  },
} as const

export const $PaymentMethodPublic = {
  properties: {
    id: {
      type: "string",
      isRequired: true,
    },
    is_default: {
      type: "boolean",
      isRequired: true,
    },
    card: {
      type: "StripeCardPublic",
      isRequired: true,
    },
  },
} as const

export const $RegionData = {
  properties: {
    name: {
      type: "string",
      isRequired: true,
    },
    subregions: {
      type: "array",
      contains: {
        type: "SubRegionData",
      },
      isRequired: true,
    },
  },
} as const

export const $RegionStateData = {
  properties: {
    region_data: {
      type: "array",
      contains: {
        type: "RegionData",
      },
      isRequired: true,
    },
    closest_subregion: {
      type: "any-of",
      contains: [
        {
          type: "SubRegionData",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
  },
} as const

export const $Reservation = {
  properties: {
    mooring_ball_id: {
      type: "string",
      isRequired: true,
    },
    user_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    boat_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    start_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    end_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    reservation_id: {
      type: "string",
      format: "uuid",
    },
    status: {
      type: "ReservationStatus",
      isRequired: true,
    },
    applied_rate_type: {
      type: "DurationType",
      isRequired: true,
    },
    applied_rate: {
      type: "number",
      isRequired: true,
    },
    payment_details: {
      type: "dictionary",
      contains: {
        properties: {},
      },
    },
    arrived_time: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "date-time",
        },
        {
          type: "null",
        },
      ],
    },
    departed_time: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "date-time",
        },
        {
          type: "null",
        },
      ],
    },
    created_at: {
      type: "string",
      format: "date-time",
    },
    updated_at: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
  },
} as const

export const $ReservationBase = {
  properties: {
    mooring_ball_id: {
      type: "string",
      isRequired: true,
    },
    user_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    boat_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    start_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    end_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
  },
} as const

export const $ReservationCreate = {
  properties: {
    mooring_ball_id: {
      type: "string",
      isRequired: true,
    },
    user_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    boat_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    start_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    end_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    price: {
      type: "number",
      isRequired: true,
      maximum: 1000,
      minimum: 0,
    },
    payment_method_id: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
    },
    timezone: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $ReservationCreatedPublic = {
  properties: {
    mooring_ball_id: {
      type: "string",
      isRequired: true,
    },
    user_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    boat_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    start_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    end_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    reservation_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    status: {
      type: "ReservationStatus",
      isRequired: true,
    },
    applied_rate_type: {
      type: "DurationType",
      isRequired: true,
    },
    applied_rate: {
      type: "number",
      isRequired: true,
    },
    arrived_time: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "date-time",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    departed_time: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "date-time",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    mooring_ball: {
      type: "MooringBallBase",
      isRequired: true,
    },
    marina: {
      type: "MarinaPublicBase",
      isRequired: true,
    },
    user: {
      type: "UserBase",
      isRequired: true,
    },
    boat: {
      type: "BoatBase",
      isRequired: true,
    },
    payment_details_simple: {
      type: "any-of",
      contains: [
        {
          type: "PaymentDetailsSimple",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    service_requests: {
      type: "array",
      contains: {
        type: "ServiceOnReservationPublic",
      },
      isRequired: true,
    },
    stripe_client_secret: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
  },
} as const

export const $ReservationPublic = {
  properties: {
    mooring_ball_id: {
      type: "string",
      isRequired: true,
    },
    user_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    boat_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    start_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    end_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    reservation_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    status: {
      type: "ReservationStatus",
      isRequired: true,
    },
    applied_rate_type: {
      type: "DurationType",
      isRequired: true,
    },
    applied_rate: {
      type: "number",
      isRequired: true,
    },
    arrived_time: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "date-time",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    departed_time: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "date-time",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    mooring_ball: {
      type: "MooringBallBase",
      isRequired: true,
    },
    marina: {
      type: "MarinaPublicBase",
      isRequired: true,
    },
    user: {
      type: "UserBase",
      isRequired: true,
    },
    boat: {
      type: "BoatBase",
      isRequired: true,
    },
    payment_details_simple: {
      type: "any-of",
      contains: [
        {
          type: "PaymentDetailsSimple",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    service_requests: {
      type: "array",
      contains: {
        type: "ServiceOnReservationPublic",
      },
      isRequired: true,
    },
  },
} as const

export const $ReservationStatus = {
  type: "Enum",
  enum: [
    "pending",
    "confirmed",
    "checked_in",
    "checked_in_locked",
    "checked_out",
    "cancelled",
    "no_show",
    "payment_failed",
  ],
} as const

export const $ReservationUpdate = {
  properties: {
    mooring_ball_id: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    boat_id: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "uuid",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    status: {
      type: "any-of",
      contains: [
        {
          type: "ReservationStatus",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    start_date: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "date-time",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    end_date: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "date-time",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
  },
} as const

export const $ReservationsPublic = {
  properties: {
    data: {
      type: "array",
      contains: {
        type: "ReservationPublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $ServiceOnReservation = {
  properties: {
    service_reservation_id: {
      type: "string",
      format: "uuid",
    },
    receipt_id: {
      type: "string",
      isRequired: true,
    },
    created_at: {
      type: "string",
      format: "date-time",
    },
    updated_at: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    requested_date: {
      type: "string",
      format: "date-time",
    },
    status: {
      type: "ServiceRequestStatus",
      isRequired: true,
    },
    services: {
      type: "array",
      contains: {
        type: "SubServiceRequest",
      },
    },
    special_instructions: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    total_price: {
      type: "number",
      isRequired: true,
      minimum: 0,
    },
    payment_details: {
      type: "dictionary",
      contains: {
        properties: {},
      },
    },
    approved_by_user: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "uuid",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    confirmation_image_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 256,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    reservation_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
  },
} as const

export const $ServiceOnReservationCreate = {
  properties: {
    requested_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    requests: {
      type: "array",
      contains: {
        type: "SubServiceRequest",
      },
      isRequired: true,
    },
    special_instructions: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
  },
} as const

export const $ServiceOnReservationPublic = {
  properties: {
    service_reservation_id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    receipt_id: {
      type: "string",
      isRequired: true,
    },
    requested_date: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    status: {
      type: "ServiceRequestStatus",
      isRequired: true,
    },
    services: {
      type: "array",
      contains: {
        type: "SubServiceRequest",
      },
      isRequired: true,
    },
    special_instructions: {
      type: "any-of",
      contains: [
        {
          type: "string",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    total_price: {
      type: "number",
      isRequired: true,
    },
    payment_details_simple: {
      type: "any-of",
      contains: [
        {
          type: "PaymentDetailsSimple",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
  },
} as const

export const $ServiceRequestStatus = {
  type: "Enum",
  enum: [
    "initialized",
    "confirmed",
    "en-route",
    "denied",
    "delivered",
    "completed",
    "cancelled",
    "failed",
  ],
} as const

export const $StripeCardPublic = {
  properties: {
    country: {
      type: "string",
      isRequired: true,
    },
    display_brand: {
      type: "string",
      isRequired: true,
    },
    exp_month: {
      type: "number",
      isRequired: true,
    },
    exp_year: {
      type: "number",
      isRequired: true,
    },
    last4: {
      type: "string",
      isRequired: true,
    },
  },
} as const

export const $SubRegion = {
  type: "Enum",
  enum: [
    "British Virgin Islands",
    "US Virgin Islands",
    "Antigua",
    "Grenada",
    "St. Lucia",
    "St. Martin",
    "United States of America",
    "Bahamas",
    "Belize",
    "Mexico",
    "Croatia",
    "Greece",
    "Italy",
    "Spain",
    "Seychelle",
    "Tahiti",
    "Thailand",
  ],
} as const

export const $SubRegionData = {
  properties: {
    name: {
      type: "string",
      isRequired: true,
    },
    center: {
      type: "any-of",
      contains: [
        {
          type: "Coordinate",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    zoom: {
      type: "any-of",
      contains: [
        {
          type: "number",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    is_new: {
      type: "any-of",
      contains: [
        {
          type: "boolean",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
  },
} as const

export const $SubServiceRequest = {
  properties: {
    name: {
      type: "string",
      isRequired: true,
    },
    quantity: {
      type: "number",
      isRequired: true,
    },
    price: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $Token = {
  properties: {
    access_token: {
      type: "string",
      isRequired: true,
    },
    token_type: {
      type: "string",
      default: "bearer",
    },
  },
} as const

export const $UpdatePassword = {
  properties: {
    current_password: {
      type: "string",
      isRequired: true,
      maxLength: 40,
      minLength: 8,
    },
    new_password: {
      type: "string",
      isRequired: true,
      maxLength: 40,
      minLength: 8,
    },
  },
} as const

export const $UserBase = {
  properties: {
    email: {
      type: "string",
      isRequired: true,
      format: "email",
      maxLength: 64,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    first_name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
    },
    last_name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
    },
    preferred_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    country_code: {
      type: "number",
      isRequired: true,
      maximum: 999,
      minimum: 1,
    },
    country_code_name: {
      type: "string",
      isRequired: true,
      maxLength: 3,
    },
    phone_number: {
      type: "string",
      isRequired: true,
      maxLength: 20,
    },
    emergency_contact_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_country_code: {
      type: "any-of",
      contains: [
        {
          type: "number",
          maximum: 999,
          minimum: 1,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_country_code_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 3,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_phone_number: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_address: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_city: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_state: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_postal_code: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_country: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    profile_pic_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
    },
    sign_up_code: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $UserPublic = {
  properties: {
    email: {
      type: "string",
      isRequired: true,
      format: "email",
      maxLength: 64,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    first_name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
    },
    last_name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
    },
    preferred_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    country_code: {
      type: "number",
      isRequired: true,
      maximum: 999,
      minimum: 1,
    },
    country_code_name: {
      type: "string",
      isRequired: true,
      maxLength: 3,
    },
    phone_number: {
      type: "string",
      isRequired: true,
      maxLength: 20,
    },
    emergency_contact_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_country_code: {
      type: "any-of",
      contains: [
        {
          type: "number",
          maximum: 999,
          minimum: 1,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_country_code_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 3,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_phone_number: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_address: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_city: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_state: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_postal_code: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_country: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    profile_pic_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
    },
    sign_up_code: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
    id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    referral_code: {
      type: "string",
      isRequired: true,
    },
    display_name: {
      type: "string",
      isRequired: true,
    },
    created_at: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    updated_at: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    items: {
      type: "array",
      contains: {
        type: "Item",
      },
      isRequired: true,
    },
    reservations: {
      type: "array",
      contains: {
        type: "Reservation",
      },
      isRequired: true,
    },
    active_boats: {
      type: "array",
      contains: {
        type: "Boat",
      },
      isRequired: true,
    },
  },
} as const

export const $UserRegister = {
  properties: {
    email: {
      type: "string",
      isRequired: true,
      format: "email",
      maxLength: 64,
    },
    password: {
      type: "string",
      isRequired: true,
      maxLength: 40,
      minLength: 8,
    },
    first_name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
    },
    last_name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
    },
    country_code: {
      type: "number",
      isRequired: true,
      maximum: 999,
      minimum: 1,
    },
    country_code_name: {
      type: "string",
      isRequired: true,
      maxLength: 3,
    },
    phone_number: {
      type: "string",
      isRequired: true,
      maxLength: 20,
    },
    sign_up_code: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $UserReservationsPublic = {
  properties: {
    today: {
      type: "any-of",
      contains: [
        {
          type: "ReservationPublic",
        },
        {
          type: "null",
        },
      ],
      isRequired: true,
    },
    upcoming: {
      type: "array",
      contains: {
        type: "ReservationPublic",
      },
      isRequired: true,
    },
    past: {
      type: "array",
      contains: {
        type: "ReservationPublic",
      },
      isRequired: true,
    },
    cancelled: {
      type: "array",
      contains: {
        type: "ReservationPublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $UserUpdate = {
  properties: {
    email: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "email",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    first_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    last_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    preferred_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    country_code: {
      type: "any-of",
      contains: [
        {
          type: "number",
          maximum: 999,
          minimum: 1,
        },
        {
          type: "null",
        },
      ],
    },
    country_code_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 3,
        },
        {
          type: "null",
        },
      ],
    },
    phone_number: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_country_code: {
      type: "any-of",
      contains: [
        {
          type: "number",
          maximum: 999,
          minimum: 1,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_country_code_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 3,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_phone_number: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_address: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_city: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_state: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_postal_code: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_country: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    profile_pic_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
    },
    sign_up_code: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
    password: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 40,
          minLength: 8,
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $UserUpdateMe = {
  properties: {
    first_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    last_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    email: {
      type: "any-of",
      contains: [
        {
          type: "string",
          format: "email",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    preferred_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    country_code: {
      type: "any-of",
      contains: [
        {
          type: "number",
          maximum: 999,
          minimum: 1,
        },
        {
          type: "null",
        },
      ],
    },
    country_code_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 3,
        },
        {
          type: "null",
        },
      ],
    },
    phone_number: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_country_code: {
      type: "any-of",
      contains: [
        {
          type: "number",
          maximum: 999,
          minimum: 1,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_country_code_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 3,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_phone_number: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_address: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_city: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_state: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_postal_code: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_country: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
  },
} as const

export const $UserWithPaymentPublic = {
  properties: {
    email: {
      type: "string",
      isRequired: true,
      format: "email",
      maxLength: 64,
    },
    is_active: {
      type: "boolean",
      default: true,
    },
    first_name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
    },
    last_name: {
      type: "string",
      isRequired: true,
      maxLength: 64,
    },
    preferred_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    country_code: {
      type: "number",
      isRequired: true,
      maximum: 999,
      minimum: 1,
    },
    country_code_name: {
      type: "string",
      isRequired: true,
      maxLength: 3,
    },
    phone_number: {
      type: "string",
      isRequired: true,
      maxLength: 20,
    },
    emergency_contact_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_country_code: {
      type: "any-of",
      contains: [
        {
          type: "number",
          maximum: 999,
          minimum: 1,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_country_code_name: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 3,
        },
        {
          type: "null",
        },
      ],
    },
    emergency_contact_phone_number: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_address: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 255,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_city: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_state: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_postal_code: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
    mailing_country: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 64,
        },
        {
          type: "null",
        },
      ],
    },
    profile_pic_url: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 128,
        },
        {
          type: "null",
        },
      ],
    },
    sign_up_code: {
      type: "any-of",
      contains: [
        {
          type: "string",
          maxLength: 20,
        },
        {
          type: "null",
        },
      ],
    },
    id: {
      type: "string",
      isRequired: true,
      format: "uuid",
    },
    referral_code: {
      type: "string",
      isRequired: true,
    },
    display_name: {
      type: "string",
      isRequired: true,
    },
    created_at: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    updated_at: {
      type: "string",
      isRequired: true,
      format: "date-time",
    },
    items: {
      type: "array",
      contains: {
        type: "Item",
      },
      isRequired: true,
    },
    reservations: {
      type: "array",
      contains: {
        type: "Reservation",
      },
      isRequired: true,
    },
    active_boats: {
      type: "array",
      contains: {
        type: "Boat",
      },
      isRequired: true,
    },
    payment_methods: {
      type: "array",
      contains: {
        type: "PaymentMethodPublic",
      },
      isRequired: true,
    },
  },
} as const

export const $UsersPublic = {
  properties: {
    data: {
      type: "array",
      contains: {
        type: "UserPublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const

export const $ValidationError = {
  properties: {
    loc: {
      type: "array",
      contains: {
        type: "any-of",
        contains: [
          {
            type: "string",
          },
          {
            type: "number",
          },
        ],
      },
      isRequired: true,
    },
    msg: {
      type: "string",
      isRequired: true,
    },
    type: {
      type: "string",
      isRequired: true,
    },
  },
} as const

export const $VesselType = {
  type: "Enum",
  enum: ["monohull", "catamaran", "power"],
} as const

export const $VesselTypePublic = {
  properties: {
    type: {
      type: "string",
      isRequired: true,
    },
    value: {
      type: "string",
      isRequired: true,
    },
  },
} as const

export const $VesselTypesPublic = {
  properties: {
    data: {
      type: "array",
      contains: {
        type: "VesselTypePublic",
      },
      isRequired: true,
    },
    count: {
      type: "number",
      isRequired: true,
    },
  },
} as const
