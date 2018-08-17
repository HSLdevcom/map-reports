import * as React from 'react'
import { observer } from 'mobx-react'
import { FormControl, InputLabel } from '@material-ui/core'
import Select from './Select'

@observer
class SelectPointProps extends React.Component<any, any> {
  state = {
    lat: 0,
    lng: 0,
  }

  setPointProp = (prop: 'lat' | 'lng') => e => {
    this.setState({
      [prop]: e.target.value,
    })
  }

  componentDidUpdate(_, { lat: prevLat, lng: prevLng }) {
    const { lat, lng } = this.state
    const { onSelected } = this.props

    if (lat && lng && (lat !== prevLat || lng !== prevLng)) {
      onSelected([lat, lng])
    }
  }

  render() {
    const { lat, lng } = this.state
    const { options } = this.props

    return (
      <FormControl>
        <InputLabel>Add point</InputLabel>
        <div>
          <Select
            name="add_point_lat"
            value={lat}
            options={[
              { value: 0, label: 'Select lat prop' },
              ...options.filter(opt => opt.value !== lng),
            ]}
            onChange={this.setPointProp('lat')}
          />
          <Select
            name="add_point_lng"
            value={lng}
            options={[
              { value: 0, label: 'Select lng prop' },
              ...options.filter(opt => opt.value !== lat),
            ]}
            onChange={this.setPointProp('lng')}
          />
        </div>
      </FormControl>
    )
  }
}

export default SelectPointProps
