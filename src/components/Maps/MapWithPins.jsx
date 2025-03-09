import GoogleMapReact from "google-map-react"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { MooringBallsService } from "../../client"
import { OpenAPI } from "../../client"

const MAP_API_KEY = OpenAPI.REACT_APP_MAP_API_KEY

const markerStyle = {
  position: "absolute",
  top: "100%",
  left: "50%",
  transform: "translate(-50%, -100%)",
}
const Marker = ({ text }) => (
  <div style={markerStyle}>
    <img
      src="https://maps.google.com/mapfiles/ms/icons/red-dot.png"
      alt="Marker"
    />
    <div>{text}</div>
  </div>
)

export default function MapWithPins() {
  const defaultProps = {
    center: {
      lat: 40.69,
      lng: -74.06,
    },
    zoom: 14,
  }

  const [pins, setPins] = useState(null)
  const [selectedPin, setSelectedPin] = useState(null)

  console.log(setSelectedPin)
  console.log(selectedPin)

  useEffect(() => {
    const fetchPins = async () => {
      try {
        const mooringBalls = await MooringBallsService.readMooringBalls()
        console.log(mooringBalls)
        setPins(mooringBalls)
      } catch (error) {
        console.error("Failed to fetch mooring balls", error)
      }
    }

    fetchPins()
  }, [])

  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: MAP_API_KEY }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
      >
        {pins?.data.map((pin) => (
          <Marker
            lat={pin.latitude}
            lng={pin.longitude}
            text={`BolaBuddy ${pin.mooring_ball_id}`}
          />
        ))}
      </GoogleMapReact>
    </div>
  )
}
