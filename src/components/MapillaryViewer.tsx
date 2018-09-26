import * as React from 'react'
import * as Mapillary from 'mapillary-js'
import styled from 'styled-components'

const MAPILLARY_ELEMENT_ID = 'mapillary-viewer'

interface Props {
  mapillaryKey: string | boolean
}

const MapillaryWrapper = styled.div`
  width: 400px;
  height: 300px;
  position: fixed;
  bottom: 1rem;
  right: 1rem;
`

class MapillaryViewer extends React.Component<Props, {}> {
  static defaultProps = {
    mapillaryKey: null,
  }

  mly = null

  componentDidMount() {
    const { mapillaryKey } = this.props

    if (mapillaryKey) {
      this.initMapillary(mapillaryKey)
    }
  }

  componentDidUpdate(prevProps) {
    const { mapillaryKey } = this.props
    const prevMapillaryKey = prevProps.mapillaryKey

    if (mapillaryKey && mapillaryKey !== prevMapillaryKey) {
      if (!this.mly) {
        this.initMapillary(mapillaryKey)
      } else {
        this.mly.moveToKey(mapillaryKey)
      }
    }
  }

  initMapillary(mapillaryKey) {
    this.mly = new Mapillary.Viewer(
      MAPILLARY_ELEMENT_ID,
      'V2RqRUsxM2dPVFBMdnlhVUliTkM0ZzoxNmI5ZDZhOTc5YzQ2MzEw',
      mapillaryKey
    )
  }

  componentWillUnmount() {
    this.mly = null
  }

  shouldComponentUpdate() {
    return false
  }

  render() {
    return <MapillaryWrapper id={MAPILLARY_ELEMENT_ID} />
  }
}

export default MapillaryViewer
