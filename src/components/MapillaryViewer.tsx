import * as React from 'react'
import * as Mapillary from 'mapillary-js'
import styled from 'styled-components'
import { LatLngLiteral } from 'leaflet'
import 'mapillary-js/dist/mapillary.min.css'

const MAPILLARY_ELEMENT_ID = 'mapillary-viewer'

type LocationProp = LatLngLiteral | boolean

interface Props {
  location: LocationProp
  className?: string
}

const MapillaryWrapper = styled.div``

class MapillaryViewer extends React.Component<Props, {}> {
  static defaultProps = {
    location: false,
  }

  mly = null

  componentDidMount() {
    const { location } = this.props

    this.initMapillary()

    this.showLocation(location)
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props
    const prevLocation = prevProps.location

    if (location !== prevLocation) {
      this.showLocation(location)
    }
  }

  showLocation(location: LocationProp) {
    if (!this.mly) {
      this.initMapillary()
    }

    if (typeof location !== 'boolean') {
      this.mly.moveCloseTo(location.lat, location.lng)
    }
  }

  initMapillary() {
    this.mly = new Mapillary.Viewer(
      MAPILLARY_ELEMENT_ID,
      'V2RqRUsxM2dPVFBMdnlhVUliTkM0ZzoxNmI5ZDZhOTc5YzQ2MzEw',
      null,
      {
        component: {
          cover: false,
        },
      }
    )

    window.addEventListener('resize', this.onResize)
  }

  onResize = () => {
    this.mly.resize()
  }

  componentWillUnmount() {
    this.mly = null
  }

  render() {
    const { className } = this.props
    return <MapillaryWrapper className={className} id={MAPILLARY_ELEMENT_ID} />
  }
}

export default MapillaryViewer
