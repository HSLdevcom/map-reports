import color from './colors'
import { typography } from './typography'
import { createGlobalStyle } from 'styled-components'

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    height: 100%;
  }
  
  ${color}
  ${typography}
`

export default GlobalStyle
