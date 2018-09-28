import * as React from 'react'
import { observer } from 'mobx-react'
import { Button } from '@material-ui/core'
import styled from 'styled-components'
import { Util, LatLng } from 'leaflet'

const ButtonsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 0.75rem;
  margin-top: 1rem;
  border: 1px solid #ddd;
`

const EditHeading = styled.h5`
  margin: 0 0 0.5rem;
  flex: 1 0 100%;
`

interface Props {
  location: LatLng
}

@observer
class EditInOSM extends React.Component<Props, any> {
  openEditor = which => e => {
    e.preventDefault()

    const { location } = this.props

    let url = ''
    let timeout = 0

    switch (which) {
      case 'id':
        url = 'https://www.openstreetmap.org/edit?editor=id#map='
        url = url + [16, location.wrap().lat, location.wrap().lng].join('/')
        break
      case 'josm':
        const bounds = location.toBounds(100)
        timeout = 1000
        url = 'http://127.0.0.1:8111/load_and_zoom'
        url =
          url +
          Util.getParamString({
            left: bounds.getNorthWest().wrap().lng,
            right: bounds.getSouthEast().wrap().lng,
            top: bounds.getNorthWest().wrap().lat,
            bottom: bounds.getSouthEast().wrap().lat,
          })
        break
      case 'potlatch':
        url = 'http://open.mapquestapi.com/dataedit/index_flash.html'
        url =
          url +
          Util.getParamString({
            lat: location.wrap().lat,
            lon: location.wrap().lng,
            zoom: 16,
          })
        break
    }

    if (url) {
      const win = window.open(url)
      if (timeout) {
        setTimeout(() => win.close(), timeout)
      }
    }
  }

  render() {
    return (
      <ButtonsWrapper>
        <EditHeading>Open this issue in</EditHeading>
        <Button
          onClick={this.openEditor('id')}
          size="small"
          variant="outlined"
          color="default">
          iD
        </Button>
        <Button
          onClick={this.openEditor('josm')}
          size="small"
          variant="outlined"
          color="default">
          JOSM
        </Button>
        <Button
          onClick={this.openEditor('potlatch')}
          size="small"
          variant="outlined"
          color="default">
          potlatch
        </Button>
      </ButtonsWrapper>
    )
  }
}

export default EditInOSM
