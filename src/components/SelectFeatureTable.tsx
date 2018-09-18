import React from 'react'
import { observer } from 'mobx-react'
import styled from 'styled-components'

const FeaturesTable = styled.table`
  width: 100%;

  thead td {
    font-weight: bold;
    padding-bottom: 0.4rem;
    border-bottom: 1px solid #efefef;
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
        {features.map(
          ({ name, identifierPropName, identifierPropValue, feature }, idx) => {
            return (
              <tr
                style={{ cursor: 'pointer' }}
                onMouseOver={onHover(feature)}
                onMouseOut={onHover(null)}
                key={`feature_row_${idx}_${name}_${identifierPropName}_${identifierPropValue}`}>
                <td>{name}</td>
                <td>{identifierPropValue}</td>
                <td>
                  <button
                    onClick={onSelect(identifierPropValue, identifierPropName, feature)}>
                    Select
                  </button>
                </td>
              </tr>
            )
          }
        )}
        <tr>
          <td>Muu</td>
          <td>Muu virhe</td>
          <td>
            <button onClick={onSelect('other', 'other', {})}>Select</button>
          </td>
        </tr>
      </tbody>
    </FeaturesTable>
  )
})
