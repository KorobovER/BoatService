import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  useDisclosure,
} from "@chakra-ui/react"
import { BsThreeDotsVertical } from "react-icons/bs"
import { FiEdit, FiTrash } from "react-icons/fi"

import type {
  BoatPublic,
  MarinaPublic,
  MooringBallPublic,
  ReservationPublic,
  EmployeePublic,
} from "../../client"
import EditEmployee from "../Admin/EditEmployee"
import EditBoat from "../Boats/EditBoat"
import EditMarina from "../Marinas/EditMarina"
import EditMooringBall from "../MooringBalls/EditMooringBall"
import EditReservation from "../Reservations/EditReservation"
import Delete from "./DeleteAlert"

interface ActionsMenuProps {
  type: string
  value:
    | EmployeePublic
    | BoatPublic
    | MarinaPublic
    | MooringBallPublic
    | ReservationPublic
  disabled?: boolean
}

const ActionsMenu = ({ type, value, disabled }: ActionsMenuProps) => {
  const editUserModal = useDisclosure()
  const deleteModal = useDisclosure()
  const componentMap = {
    EmployeePublic: EditEmployee,
    BoatPublic: EditBoat,
    MarinaPublic: EditMarina,
    MooringBallPublic: EditMooringBall,
    ReservationPublic: EditReservation,
  }
  type ComponentMapKey = keyof typeof componentMap
  const componentType = `${type}Public` as ComponentMapKey
  const EditComponent = componentMap[componentType]

  function getIdOf():
    | "id"
    | "mooring_ball_id"
    | "marina_id"
    | "reservation_id"
    | "boat_id" {
    if (type === "Employee") return "id"
    if (type === "Boat") return "boat_id"
    if (type === "Marina") return "marina_id"
    if (type === "MooringBall") return "mooring_ball_id"
    if (type === "Reservation") return "reservation_id"
    throw new Error("Unknown type")
  }
  const idKey = getIdOf()
  const _id = (value as any)[idKey]

  return (
    <>
      <Menu>
        <MenuButton
          isDisabled={disabled}
          as={Button}
          rightIcon={<BsThreeDotsVertical />}
          variant="unstyled"
        />
        <MenuList>
          <MenuItem
            onClick={editUserModal.onOpen}
            icon={<FiEdit fontSize="16px" />}
          >
            Edit {type}
          </MenuItem>
          <MenuItem
            onClick={deleteModal.onOpen}
            icon={<FiTrash fontSize="16px" />}
            color="ui.danger"
          >
            Delete {type}
          </MenuItem>
        </MenuList>
        <EditComponent
          item={value as any} // todo: should we fix this?
          isOpen={editUserModal.isOpen}
          onClose={editUserModal.onClose}
        />
        <Delete
          type={type}
          id={_id}
          isOpen={deleteModal.isOpen}
          onClose={deleteModal.onClose}
        />
      </Menu>
    </>
  )
}

export default ActionsMenu
