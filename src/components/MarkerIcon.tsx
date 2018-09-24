import * as React from 'react'
import { createGlobalStyle } from 'styled-components'
import { extraIcon } from '../helpers/ExtraIcon'

export const MarkerIconStyle = createGlobalStyle`
  .leaflet-popup {
    &[style] {
       bottom: 1.75rem !important;
       margin-left: 1px;
    }
  }
  
  .marker-cluster {
    border: 0;
    background: transparent;
  }
  
  .marker-cluster-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    border-radius: 50%;
    background: var(--blue);
    width: calc(1.5rem + (var(--count) * 0.25rem));
    height: calc(1.5rem + (var(--count) * 0.25rem));
    font-size: calc(1rem + (var(--count) * 0.1rem));
  }
`

export default ({ focused = false, type }) =>
  extraIcon({
    prefix: 'fas',
    icon: 'fa-bug',
    markerColor: focused ? 'green-light' : 'violet',
    shape: 'circle',
  })
