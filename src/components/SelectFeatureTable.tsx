import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'
import { get, reduce } from 'lodash'

const FeaturesTable = styled.table`
  width: 100%;

  thead td {
    font-weight: bold;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid #efefef;
  }

  td {
    vertical-align: top;
  }
`

export default observer(({ onHover, onSelect, features }) => {
  return (
    <FeaturesTable>
      <thead>
        <tr>
          <td>Feature</td>
          <td>ID</td>
          <td>Select</td>
        </tr>
      </thead>
      <tbody>
        {features.map(({ name, entityIdentifier, feature }, idx) => {
          const tags = reduce(
            get(feature, 'tags', {}),
            (csv, value, name) => {
              csv += `${name}=${value}\n`
              return csv
            },
            ''
          )

          return (
            <tr
              onClick={onSelect(entityIdentifier, feature.type, feature)}
              style={{ cursor: 'pointer' }}
              onMouseOver={onHover(feature)}
              onMouseOut={onHover(null)}
              key={`feature_row_${idx}_${name}_${entityIdentifier}`}>
              <td>{name}</td>
              <td>{tags}</td>
            </tr>
          )
        })}
        <tr onClick={onSelect('other', 'other', {})}>
          <td>Muu</td>
          <td>Muu virhe</td>
        </tr>
      </tbody>
    </FeaturesTable>
  )
})
