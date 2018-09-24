import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { AppContainer } from 'react-hot-loader'
import { configure } from 'mobx'
import 'normalize.css'
import { createStore } from 'mobx-app'
import UIStore from './stores/UIStore'
import { Router } from 'pathricia'
import createHistory from 'history/createBrowserHistory'
import { typography } from './style/typography'
import { injectGlobal } from 'styled-components'
import MapStore from './stores/MapStore'
import ReportStore from './stores/ReportStore'
import color from './style/colors'
import App from './App'

injectGlobal`
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

configure({
  computedRequiresReaction: true,
  enforceActions: 'observed',
})

const baseUrl = process.env.BASE_URL || ''

const router = Router('/', createHistory({ basename: baseUrl }))
const mountNode = document.getElementById('app')

let state
let actions
const prevState = {}

function initStore(initialState = {}) {
  const stores = createStore(
    {
      UI: UIStore(router),
      Report: ReportStore,
      Map: MapStore,
    },
    initialState
  )

  state = stores.state
  actions = stores.actions
}

function render() {
  /*const App = require('./App').default*/

  ReactDOM.render(
    <AppContainer>
      <App state={state} actions={actions} router={router} />
    </AppContainer>,
    mountNode
  )
}

initStore(prevState)
render()

declare const module: any

if (module.hot) {
  module.hot.accept(() => {
    // initStore(toJS(state))
    render()
  })
}
