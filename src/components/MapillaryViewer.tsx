import * as React from 'react'
import * as Mapillary from 'mapillary-js'
import styled from 'styled-components'
import { LatLng, LatLngLiteral } from 'leaflet'
import 'mapillary-js/dist/mapillary.min.css'
import { AnyFunction } from '../../shared/types/AnyFunction'

const MAPILLARY_ELEMENT_ID = 'mapillary-viewer'

interface Props {
  location: LatLng
  className?: string
  onNavigation: AnyFunction
}

const MapillaryWrapper = styled.div``

class MapillaryViewer extends React.Component<Props, {}> {
  mly = null

  componentDidMount() {
    const { location } = this.props

    this.initMapillary()
    this.showLocation(location)
  }

  componentDidUpdate(prevProps) {
    const { location } = this.props
    const prevLocation = prevProps.location

    if (!location.equals(prevLocation)) {
      this.showLocation(location)
    }
  }

  showLocation(location: LatLngLiteral) {
    if (!this.mly) {
      this.initMapillary()
    }

    if (this.mly.isNavigable) {
      this.mly.moveCloseTo(location.lat, location.lng)
    }
  }

  initMapillary() {
    const { onNavigation } = this.props

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

    this.mly.on(Mapillary.Viewer.nodechanged, onNavigation)
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
