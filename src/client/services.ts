import type { CancelablePromise } from "./core/CancelablePromise"
import { OpenAPI } from "./core/OpenAPI"
import { request as __request } from "./core/request"

import type {
  Body_login_employees_login_access_token,
  EmployeePublic,
  Message,
  NewPassword,
  Token,
  Body_login_users_login_access_token_user,
  UserPublic,
  BoatCreate,
  BoatPublic,
  BoatsPublic,
  BoatUpdate,
  Body_boats_update_boat_docs,
  VesselTypesPublic,
  EmployeeCreate,
  EmployeeRegister,
  EmployeesPublic,
  EmployeeUpdate,
  EmployeeUpdateMe,
  UpdatePassword,
  ItemCreate,
  ItemPublic,
  ItemsPublic,
  ItemUpdate,
  AmenitiesPublic,
  MarinaCreate,
  MarinaPublic,
  MarinasPublic,
  MarinaUpdate,
  ServicesPublic,
  SubRegion,
  MooringBallCreate,
  MooringBallPublic,
  MooringBallsPublic,
  MooringBallsWithReservationBasePublic,
  MooringBallUpdate,
  MooringBallWithReservationsPublic,
  ReservationCreate,
  ReservationCreatedPublic,
  ReservationPublic,
  ReservationsPublic,
  ReservationUpdate,
  ServiceRequest,
  UserReservationsPublic,
  Body_users_create_profile_pic_me,
  UserRegister,
  UsersPublic,
  UserUpdate,
  UserUpdateMe,
  UserWithPaymentPublic,
  Coordinate,
  RegionStateData,
} from "./models"

export type TDataLoginAccessToken = {
  formData: Body_login_employees_login_access_token
}
export type TDataRecoverPassword = {
  email: string
}
export type TDataResetPassword = {
  requestBody: NewPassword
}
export type TDataRecoverPasswordHtmlContent = {
  email: string
}

export class LoginEmployeesService {
  /**
   * Login Access Token
   * OAuth2 compatible token login, get an access token for future requests
   * @returns Token Successful Response
   * @throws ApiError
   */
  public static loginAccessToken(
    data: TDataLoginAccessToken,
  ): CancelablePromise<Token> {
    const { formData } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/access-token",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Test Token
   * Test access token
   * @returns EmployeePublic Successful Response
   * @throws ApiError
   */
  public static testToken(): CancelablePromise<EmployeePublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/test-token",
    })
  }

  /**
   * Recover Password
   * Password Recovery
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static recoverPassword(
    data: TDataRecoverPassword,
  ): CancelablePromise<Message> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Reset Password
   * Reset password
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static resetPassword(
    data: TDataResetPassword,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reset-password/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Recover Password Html Content
   * HTML Content for Password Recovery
   * @returns string Successful Response
   * @throws ApiError
   */
  public static recoverPasswordHtmlContent(
    data: TDataRecoverPasswordHtmlContent,
  ): CancelablePromise<string> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery-html-content/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataLoginAccessTokenUser = {
  formData: Body_login_users_login_access_token_user
}
export type TDataRecoverPasswordUser = {
  email: string
}
export type TDataResetPasswordUser = {
  requestBody: NewPassword
}
export type TDataRecoverPasswordHtmlContentUser = {
  email: string
}

export class LoginUsersService {
  /**
   * Login Access Token User
   * OAuth2 compatible token login, get an access token for future requests
   * @returns Token Successful Response
   * @throws ApiError
   */
  public static loginAccessTokenUser(
    data: TDataLoginAccessTokenUser,
  ): CancelablePromise<Token> {
    const { formData } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/user/login/access-token",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Test Token User
   * Test access token
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static testTokenUser(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/user/login/test-token",
    })
  }

  /**
   * Recover Password User
   * Password Recovery
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static recoverPasswordUser(
    data: TDataRecoverPasswordUser,
  ): CancelablePromise<Message> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/user/password-recovery/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Reset Password User
   * Reset password
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static resetPasswordUser(
    data: TDataResetPasswordUser,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/user/reset-password/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Recover Password Html Content User
   * HTML Content for Password Recovery
   * @returns string Successful Response
   * @throws ApiError
   */
  public static recoverPasswordHtmlContentUser(
    data: TDataRecoverPasswordHtmlContentUser,
  ): CancelablePromise<string> {
    const { email } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/user/password-recovery-html-content/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataReadBoats = {
  limit?: number
  skip?: number
}
export type TDataCreateBoat = {
  requestBody: BoatCreate
}
export type TDataUpdateBoatDocs = {
  formData?: Body_boats_update_boat_docs
  id: string
}
export type TDataReadBoat = {
  id: string
}
export type TDataUpdateBoat = {
  id: string
  requestBody: BoatUpdate
}
export type TDataDeleteBoat = {
  id: string
}

export class BoatsService {
  /**
   * Get All Vessel Types
   * Retrieve all vessel types.
   * @returns VesselTypesPublic Successful Response
   * @throws ApiError
   */
  public static getAllVesselTypes(): CancelablePromise<VesselTypesPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/boats/vessel-types",
    })
  }

  /**
   * Read Boats
   * Retrieve boats.
   * @returns BoatsPublic Successful Response
   * @throws ApiError
   */
  public static readBoats(
    data: TDataReadBoats = {},
  ): CancelablePromise<BoatsPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/boats/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Boat
   * Create new boat.
   * @returns BoatPublic Successful Response
   * @throws ApiError
   */
  public static createBoat(
    data: TDataCreateBoat,
  ): CancelablePromise<BoatPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/boats/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Boat Docs
   * Update a boat's documents.
   * @returns BoatPublic Successful Response
   * @throws ApiError
   */
  public static updateBoatDocs(
    data: TDataUpdateBoatDocs,
  ): CancelablePromise<BoatPublic> {
    const { formData, id } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/boats/docs/{id}",
      path: {
        id,
      },
      formData: formData,
      mediaType: "multipart/form-data",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Boat
   * Get boat by ID.
   * @returns BoatPublic Successful Response
   * @throws ApiError
   */
  public static readBoat(data: TDataReadBoat): CancelablePromise<BoatPublic> {
    const { id } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/boats/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Boat
   * Update a boat.
   * @returns BoatPublic Successful Response
   * @throws ApiError
   */
  public static updateBoat(
    data: TDataUpdateBoat,
  ): CancelablePromise<BoatPublic> {
    const { id, requestBody } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/boats/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Boat
   * Delete an boat.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteBoat(data: TDataDeleteBoat): CancelablePromise<Message> {
    const { id } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/boats/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataReadEmployees = {
  limit?: number
  skip?: number
}
export type TDataCreateEmployee = {
  requestBody: EmployeeCreate
}
export type TDataUpdateEmployeeMe = {
  requestBody: EmployeeUpdateMe
}
export type TDataUpdateEmployeePasswordMe = {
  requestBody: UpdatePassword
}
export type TDataRegisterEmployee = {
  requestBody: EmployeeRegister
}
export type TDataReadEmployeeById = {
  id: string
}
export type TDataUpdateEmployee = {
  id: string
  requestBody: EmployeeUpdate
}
export type TDataDeleteEmployee = {
  id: string
}

export class EmployeesService {
  /**
   * Read Employees
   * Retrieve employees.
   * @returns EmployeesPublic Successful Response
   * @throws ApiError
   */
  public static readEmployees(
    data: TDataReadEmployees = {},
  ): CancelablePromise<EmployeesPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/employees/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Employee
   * Create new employee.
   * @returns EmployeePublic Successful Response
   * @throws ApiError
   */
  public static createEmployee(
    data: TDataCreateEmployee,
  ): CancelablePromise<EmployeePublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/employees/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Employee Me
   * Get current employee.
   * @returns EmployeePublic Successful Response
   * @throws ApiError
   */
  public static readEmployeeMe(): CancelablePromise<EmployeePublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/employees/me",
    })
  }

  /**
   * Delete Employee Me
   * Delete self.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteEmployeeMe(): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/employees/me",
    })
  }

  /**
   * Update Employee Me
   * Update own employee.
   * @returns EmployeePublic Successful Response
   * @throws ApiError
   */
  public static updateEmployeeMe(
    data: TDataUpdateEmployeeMe,
  ): CancelablePromise<EmployeePublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/employees/me",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Employee Password Me
   * Update own password.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static updateEmployeePasswordMe(
    data: TDataUpdateEmployeePasswordMe,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/employees/me/password",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Register Employee
   * Create new employee without the need to be logged in.
   * @returns EmployeePublic Successful Response
   * @throws ApiError
   */
  public static registerEmployee(
    data: TDataRegisterEmployee,
  ): CancelablePromise<EmployeePublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/employees/signup",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Employee By Id
   * Get a specific employee by id.
   * @returns EmployeePublic Successful Response
   * @throws ApiError
   */
  public static readEmployeeById(
    data: TDataReadEmployeeById,
  ): CancelablePromise<EmployeePublic> {
    const { id } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/employees/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Employee
   * Update a employee.
   * @returns EmployeePublic Successful Response
   * @throws ApiError
   */
  public static updateEmployee(
    data: TDataUpdateEmployee,
  ): CancelablePromise<EmployeePublic> {
    const { id, requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/employees/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Employee
   * Delete an employee.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteEmployee(
    data: TDataDeleteEmployee,
  ): CancelablePromise<Message> {
    const { id } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/employees/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataReadItems = {
  limit?: number
  skip?: number
}
export type TDataCreateItem = {
  requestBody: ItemCreate
}
export type TDataReadItem = {
  id: string
}
export type TDataUpdateItem = {
  id: string
  requestBody: ItemUpdate
}
export type TDataDeleteItem = {
  id: string
}

export class ItemsService {
  /**
   * Read Items
   * Retrieve items.
   * @returns ItemsPublic Successful Response
   * @throws ApiError
   */
  public static readItems(
    data: TDataReadItems = {},
  ): CancelablePromise<ItemsPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Item
   * Create new item.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static createItem(
    data: TDataCreateItem,
  ): CancelablePromise<ItemPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/items/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Item
   * Get item by ID.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static readItem(data: TDataReadItem): CancelablePromise<ItemPublic> {
    const { id } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Item
   * Update an item.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static updateItem(
    data: TDataUpdateItem,
  ): CancelablePromise<ItemPublic> {
    const { id, requestBody } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Item
   * Delete an item.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteItem(data: TDataDeleteItem): CancelablePromise<Message> {
    const { id } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataReadServices = {
  limit?: number
  skip?: number
}
export type TDataOnboardMarina = {
  marinaId: string
}
export type TDataReadMarinas = {
  limit?: number
  skip?: number
  subregion?: SubRegion | null
}
export type TDataCreateMarina = {
  requestBody: MarinaCreate
}
export type TDataReadMarina = {
  id: string
}
export type TDataUpdateMarina = {
  id: string
  requestBody: MarinaUpdate
}
export type TDataDeleteMarina = {
  id: string
}

export class MarinasService {
  /**
   * Read Amenities
   * Retrieve amenities.
   * @returns AmenitiesPublic Successful Response
   * @throws ApiError
   */
  public static readAmenities(): CancelablePromise<AmenitiesPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/marinas/amenities",
    })
  }

  /**
   * Read Services
   * Retrieve services.
   * @returns ServicesPublic Successful Response
   * @throws ApiError
   */
  public static readServices(
    data: TDataReadServices = {},
  ): CancelablePromise<ServicesPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/marinas/services",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Onboard Marina
   * Create a Stripe Connect account for a marina
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static onboardMarina(
    data: TDataOnboardMarina,
  ): CancelablePromise<unknown> {
    const { marinaId } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/marinas/onboard",
      query: {
        marina_id: marinaId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Marinas
   * Retrieve marinas.
   * @returns MarinasPublic Successful Response
   * @throws ApiError
   */
  public static readMarinas(
    data: TDataReadMarinas = {},
  ): CancelablePromise<MarinasPublic> {
    const { limit = 100, skip = 0, subregion } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/marinas/",
      query: {
        subregion,
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Marina
   * Create new marina.
   * @returns MarinaPublic Successful Response
   * @throws ApiError
   */
  public static createMarina(
    data: TDataCreateMarina,
  ): CancelablePromise<MarinaPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/marinas/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Marina
   * Get marina by ID.
   * @returns MarinaPublic Successful Response
   * @throws ApiError
   */
  public static readMarina(
    data: TDataReadMarina,
  ): CancelablePromise<MarinaPublic> {
    const { id } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/marinas/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Marina
   * Update an marina.
   * @returns MarinaPublic Successful Response
   * @throws ApiError
   */
  public static updateMarina(
    data: TDataUpdateMarina,
  ): CancelablePromise<MarinaPublic> {
    const { id, requestBody } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/marinas/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Marina
   * Delete an marina.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteMarina(
    data: TDataDeleteMarina,
  ): CancelablePromise<Message> {
    const { id } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/marinas/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataIlluminateMooringBall = {
  mooringBallId: string
  requestBody: Record<string, string>
}
export type TDataSoundMooringBall = {
  mooringBallId: string
  requestBody: Record<string, string>
}
export type TDataReadMooringBalls = {
  daysLookahead?: number
  limit?: number
  marinaUuid?: string | null
  skip?: number
  startDate?: string | null
  subregion?: SubRegion | null
}
export type TDataCreateMooringBall = {
  requestBody: MooringBallCreate
}
export type TDataReadMooringBall = {
  id: string
}
export type TDataUpdateMooringBall = {
  id: string
  requestBody: MooringBallUpdate
}
export type TDataDeleteMooringBall = {
  id: string
}

export class MooringBallsService {
  /**
   * Illuminate Sequence Options
   * @returns string Successful Response
   * @throws ApiError
   */
  public static illuminateSequenceOptions(): CancelablePromise<Array<string>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/mooring-balls/illuminate",
    })
  }

  /**
   * Sound Sequence Options
   * @returns string Successful Response
   * @throws ApiError
   */
  public static soundSequenceOptions(): CancelablePromise<Array<string>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/mooring-balls/sound",
    })
  }

  /**
   * Illuminate Mooring Ball
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static illuminateMooringBall(
    data: TDataIlluminateMooringBall,
  ): CancelablePromise<Message> {
    const { mooringBallId, requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/mooring-balls/illuminate/{mooring_ball_id}}",
      path: {
        mooring_ball_id: mooringBallId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Sound Mooring Ball
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static soundMooringBall(
    data: TDataSoundMooringBall,
  ): CancelablePromise<Message> {
    const { mooringBallId, requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/mooring-balls/sound/{mooring_ball_id}}",
      path: {
        mooring_ball_id: mooringBallId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Mooring Balls
   * Retrieve mooring_balls.
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static readMooringBalls(
    data: TDataReadMooringBalls = {},
  ): CancelablePromise<
    MooringBallsPublic | MooringBallsWithReservationBasePublic
  > {
    const {
      daysLookahead = 90,
      limit = 100,
      marinaUuid,
      skip = 0,
      startDate,
      subregion,
    } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/mooring-balls/",
      query: {
        skip,
        limit,
        marina_uuid: marinaUuid,
        subregion,
        start_date: startDate,
        days_lookahead: daysLookahead,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Mooring Ball
   * Create new mooring_ball.
   * @returns MooringBallPublic Successful Response
   * @throws ApiError
   */
  public static createMooringBall(
    data: TDataCreateMooringBall,
  ): CancelablePromise<MooringBallPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/mooring-balls/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Mooring Ball
   * Get mooring_ball by ID.
   * @returns MooringBallWithReservationsPublic Successful Response
   * @throws ApiError
   */
  public static readMooringBall(
    data: TDataReadMooringBall,
  ): CancelablePromise<MooringBallWithReservationsPublic> {
    const { id } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/mooring-balls/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Mooring Ball
   * Update an mooring_ball.
   * @returns MooringBallPublic Successful Response
   * @throws ApiError
   */
  public static updateMooringBall(
    data: TDataUpdateMooringBall,
  ): CancelablePromise<MooringBallPublic> {
    const { id, requestBody } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/mooring-balls/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Mooring Ball
   * Delete an mooring_ball.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteMooringBall(
    data: TDataDeleteMooringBall,
  ): CancelablePromise<Message> {
    const { id } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/mooring-balls/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataReadReservations = {
  endDate?: string | null
  limit?: number
  marinaId?: string | null
  mooringBallId?: string | null
  skip?: number
  startDate?: string | null
}
export type TDataCreateReservation = {
  requestBody: ReservationCreate
}
export type TDataReadReservationsMe = {
  limit?: number
  skip?: number
}
export type TDataReadReservation = {
  id: string
}
export type TDataUpdateReservation = {
  id: string
  requestBody: ReservationUpdate
}
export type TDataDeleteReservation = {
  id: string
}
export type TDataRequestReservationService = {
  id: string
  requestBody: ServiceRequest
}
export type TDataActivateReservation = {
  id: string
}
export type TDataCompleteReservation = {
  id: string
}

export class ReservationsService {
  /**
   * Read Reservations
   * Retrieve reservations.
   *
   * marina_id: only query reservations for this marina
   * mooring_ball_id: only query reservations for this mooring ball
   * start_date: filter where start_date >= value
   * end_date: filter where end_date <= value
   * @returns ReservationsPublic Successful Response
   * @throws ApiError
   */
  public static readReservations(
    data: TDataReadReservations = {},
  ): CancelablePromise<ReservationsPublic> {
    const {
      endDate,
      limit = 100,
      marinaId,
      mooringBallId,
      skip = 0,
      startDate,
    } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/reservations/",
      query: {
        skip,
        limit,
        marina_id: marinaId,
        mooring_ball_id: mooringBallId,
        start_date: startDate,
        end_date: endDate,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Reservation
   * Create new reservation.
   * @returns ReservationCreatedPublic Successful Response
   * @throws ApiError
   */
  public static createReservation(
    data: TDataCreateReservation,
  ): CancelablePromise<ReservationCreatedPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reservations/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Reservations Me
   * Retrieve reservations for the current user.
   * @returns UserReservationsPublic Successful Response
   * @throws ApiError
   */
  public static readReservationsMe(
    data: TDataReadReservationsMe = {},
  ): CancelablePromise<UserReservationsPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/reservations/me",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Reservation
   * Get reservation by ID.
   * @returns ReservationPublic Successful Response
   * @throws ApiError
   */
  public static readReservation(
    data: TDataReadReservation,
  ): CancelablePromise<ReservationPublic> {
    const { id } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/reservations/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Reservation
   * Update an reservation.
   * @returns ReservationPublic Successful Response
   * @throws ApiError
   */
  public static updateReservation(
    data: TDataUpdateReservation,
  ): CancelablePromise<ReservationPublic> {
    const { id, requestBody } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/reservations/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Reservation
   * Delete an reservation, "soft cancel"
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteReservation(
    data: TDataDeleteReservation,
  ): CancelablePromise<Message> {
    const { id } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/reservations/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Request Reservation Service
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static requestReservationService(
    data: TDataRequestReservationService,
  ): CancelablePromise<unknown> {
    const { id, requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reservations/{id}/request-service",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Activate Reservation
   * @returns ReservationPublic Successful Response
   * @throws ApiError
   */
  public static activateReservation(
    data: TDataActivateReservation,
  ): CancelablePromise<ReservationPublic> {
    const { id } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reservations/{id}/activate",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Complete Reservation
   * @returns ReservationPublic Successful Response
   * @throws ApiError
   */
  public static completeReservation(
    data: TDataCompleteReservation,
  ): CancelablePromise<ReservationPublic> {
    const { id } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reservations/{id}/complete",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataVerifySignUpCode = {
  code: string
}
export type TDataGetVerifyEmail = {
  emailIn: string
}
export type TDataValidatePhoneNumber = {
  phone: string
}
export type TDataModifyCustomerPaymentMethod = {
  paymentMethodId: string
}
export type TDataDeleteCustomerPaymentMethod = {
  paymentMethodId: string
}
export type TDataReadUsers = {
  limit?: number
  skip?: number
}
export type TDataUpdateUserMe = {
  requestBody: UserUpdateMe
}
export type TDataUpdatePasswordMe = {
  requestBody: UpdatePassword
}
export type TDataCreateProfilePicMe = {
  formData: Body_users_create_profile_pic_me
}
export type TDataRegisterUser = {
  requestBody: UserRegister
}
export type TDataVerifyUser = {
  token: string
  userId: string
}
export type TDataReadUserById = {
  userId: string
}
export type TDataUpdateUser = {
  requestBody: UserUpdate
  userId: string
}
export type TDataDeleteUser = {
  userId: string
}

export class UsersService {
  /**
   * Verify Sign Up Code
   * Verify sign up code is valid or not
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static verifySignUpCode(
    data: TDataVerifySignUpCode,
  ): CancelablePromise<Message> {
    const { code } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/verify-sign-up-code/{code}",
      path: {
        code,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Get Verify Email
   * Check if user with this email exists in the system
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static getVerifyEmail(
    data: TDataGetVerifyEmail,
  ): CancelablePromise<Message> {
    const { emailIn } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/verify-email/{email_in}",
      path: {
        email_in: emailIn,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Validate Phone Number
   * Check if user with this phone exists in the system
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static validatePhoneNumber(
    data: TDataValidatePhoneNumber,
  ): CancelablePromise<Message> {
    const { phone } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/verify-phone-number/{phone}",
      path: {
        phone,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Customer Payment Methods
   * Get current user stripe payment info.
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static readCustomerPaymentMethods(): CancelablePromise<unknown> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/payment-method",
    })
  }

  /**
   * Create Customer Payment Method
   * Create card for current user stripe payment info.
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static createCustomerPaymentMethod(): CancelablePromise<unknown> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/payment-method",
    })
  }

  /**
   * Modify Customer Payment Method
   * Modify a card for current user stripe payment info (set default).
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static modifyCustomerPaymentMethod(
    data: TDataModifyCustomerPaymentMethod,
  ): CancelablePromise<unknown> {
    const { paymentMethodId } = data
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/users/payment-method/{payment_method_id}",
      path: {
        payment_method_id: paymentMethodId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Customer Payment Method
   * Delete payment method for for current user.
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static deleteCustomerPaymentMethod(
    data: TDataDeleteCustomerPaymentMethod,
  ): CancelablePromise<unknown> {
    const { paymentMethodId } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/payment-method/{payment_method_id}",
      path: {
        payment_method_id: paymentMethodId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read Users
   * Retrieve users.
   * @returns UsersPublic Successful Response
   * @throws ApiError
   */
  public static readUsers(
    data: TDataReadUsers = {},
  ): CancelablePromise<UsersPublic> {
    const { limit = 100, skip = 0 } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read User Me
   * Get current user.
   * @returns UserWithPaymentPublic Successful Response
   * @throws ApiError
   */
  public static readUserMe(): CancelablePromise<UserWithPaymentPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/me",
    })
  }

  /**
   * Update User Me
   * Update own user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUserMe(
    data: TDataUpdateUserMe,
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update Password Me
   * Update own password.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static updatePasswordMe(
    data: TDataUpdatePasswordMe,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me/password",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Create Profile Pic Me
   * Create own profile picture.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static createProfilePicMe(
    data: TDataCreateProfilePicMe,
  ): CancelablePromise<Message> {
    const { formData } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/me/profile-pic",
      formData: formData,
      mediaType: "multipart/form-data",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete Profile Pic Me
   * Delete own profile picture.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteProfilePicMe(): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/me/profile-pic",
    })
  }

  /**
   * Deactivate User Me
   * Deactivate own user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deactivateUserMe(): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/me/deactivate",
    })
  }

  /**
   * Delete User Me
   * Delete own user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUserMe(): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/me/delete",
    })
  }

  /**
   * Register User
   * Create new user without the need to be logged in.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static registerUser(
    data: TDataRegisterUser,
  ): CancelablePromise<Message> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/signup",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Resend Verification Email
   * Send email verification for a user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static resendVerificationEmail(): CancelablePromise<Message> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/send-email-verification",
    })
  }

  /**
   * Verify User
   * Verify a user's email address
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static verifyUser(data: TDataVerifyUser): CancelablePromise<Message> {
    const { token, userId } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/{user_id}/verify",
      path: {
        user_id: userId,
      },
      query: {
        token,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Read User By Id
   * Get a specific user by id.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserById(
    data: TDataReadUserById,
  ): CancelablePromise<UserPublic> {
    const { userId } = data
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Update User
   * Update a user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUser(
    data: TDataUpdateUser,
  ): CancelablePromise<UserPublic> {
    const { requestBody, userId } = data
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Delete User
   * Delete a user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUser(data: TDataDeleteUser): CancelablePromise<Message> {
    const { userId } = data
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }
}

export type TDataGetRegionStateInitWithCoordinates = {
  requestBody?: Coordinate | null
}
export type TDataTestEmail = {
  emailTo: string
}

export class UtilsService {
  /**
   * Get Region State Init
   * Show region and subregions for mobile app alongside map and zoom presets for regions
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static getRegionStateInit(): CancelablePromise<unknown> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/utils/map-region-init/",
    })
  }

  /**
   * Get Region State Init With Coordinates
   * Show region and subregions for mobile app alongside map and zoom presets for regions.
   * Optionally show the closest subregion to the given coordinates.
   * @returns RegionStateData Successful Response
   * @throws ApiError
   */
  public static getRegionStateInitWithCoordinates(
    data: TDataGetRegionStateInitWithCoordinates = {},
  ): CancelablePromise<RegionStateData> {
    const { requestBody } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/utils/map-region-init/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Test Email
   * Test emails.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static testEmail(data: TDataTestEmail): CancelablePromise<Message> {
    const { emailTo } = data
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/utils/test-email/",
      query: {
        email_to: emailTo,
      },
      errors: {
        422: `Validation Error`,
      },
    })
  }

  /**
   * Stripe Webhook
   * @returns unknown Successful Response
   * @throws ApiError
   */
  public static stripeWebhook(): CancelablePromise<unknown> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/utils/stripe/webhook",
    })
  }
}

export class GeneralService {
  /**
   * Status
   * @returns string Successful Response
   * @throws ApiError
   */
  public static status(): CancelablePromise<Record<string, string>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/status",
    })
  }
}
