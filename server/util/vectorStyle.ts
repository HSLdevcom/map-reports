import { merge, pick, reduce } from 'lodash'

const styleComponents = {
  text: true,
  text_sv: false,
  text_fisv: true,
  routes: true,
  stops: true,
  citybikes: true,
  icons: true,
  print: false,
  municipal_borders: false,
}

export function getStyleComponents(selection) {
  const styleKeys = Object.keys(styleComponents)
  const mergedSelection = merge(
    {},
    styleComponents,
    pick(
      selection,
      Object.keys(selection).filter(selectedComponent =>
        styleKeys.includes(selectedComponent)
      )
    )
  )

  return reduce(
    mergedSelection,
    (components, isEnabled, key) => {
      components[key] = { enabled: isEnabled }
      return components
    },
    {}
  )
}
