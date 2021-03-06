import * as L from 'leaflet'
// @ts-ignore
const mapboxgl = window.mapboxgl

// @ts-ignore
const MapboxLeaflet = L.Layer.extend({
  options: {},

  initialize(options) {
    // @ts-ignore
    L.setOptions(this, options)

    if (options.accessToken) {
      mapboxgl.accessToken = options.accessToken
    } else {
      throw new Error('You should provide a Mapbox GL access token as a token option.')
    }

    /**
     * Create a version of `fn` that only fires once every `time` millseconds.
     *
     * @param {Function} fn the function to be throttled
     * @param {number} time millseconds required between function calls
     * @param {*} context the value of `this` with which the function is called
     * @returns {Function} debounced function
     * @private
     */
    const throttle = function(fn, context) {
      let lock, args, wrapperFn, later

      later = function() {
        // reset lock and call if queued
        lock = false
        if (args) {
          wrapperFn.apply(context, args)
          args = false
        }
      }

      wrapperFn = function() {
        if (lock) {
          // called too soon, queue to call later
          args = arguments
        } else {
          // call and lock until later
          fn.apply(context, arguments)
          requestAnimationFrame(later)
          lock = true
        }
      }

      return wrapperFn
    }

    // setup throttling the update event when panning
    this._throttledUpdate = throttle(L.Util.bind(this._update, this), this)
  },

  onAdd(map) {
    if (!this._glContainer) {
      this._initContainer()
    }

    this.getPane().appendChild(this._glContainer)

    this._initGL()

    this._offset = this._map.containerPointToLayerPoint([0, 0])

    // work around https://github.com/mapbox/mapbox-gl-leaflet/issues/47
    if (map.options.zoomAnimation) {
      L.DomEvent.on(map._proxy, L.DomUtil.TRANSITION_END, this._transitionEnd, this)
    }
  },

  onRemove(map) {
    if (this._map.options.zoomAnimation) {
      L.DomEvent.off(this._map, L.DomUtil.TRANSITION_END, this._transitionEnd, this)
    }

    this.getPane().removeChild(this._glContainer)
    this._glMap.remove()
    this._glMap = null
  },

  getEvents() {
    return {
      move: this._throttledUpdate, // sensibly throttle updating while panning
      zoomanim: this._animateZoom, // applys the zoom animation to the <canvas>
      zoom: this._pinchZoom, // animate every zoom event for smoother pinch-zooming
      zoomstart: this._zoomStart, // flag starting a zoom to disable panning
      zoomend: this._zoomEnd,
    }
  },

  _initContainer() {
    const container = (this._glContainer = L.DomUtil.create('div', 'leaflet-gl-layer'))

    const size = this._map.getSize()
    container.style.width = size.x + 'px'
    container.style.height = size.y + 'px'
  },

  _initGL() {
    const center = this._map.getCenter()

    // @ts-ignore
    const options = L.extend({}, this.options, {
      container: this._glContainer,
      interactive: false,
      center: [center.lng, center.lat],
      zoom: this._map.getZoom() - 1,
      attributionControl: false,
    })

    this._glMap = new mapboxgl.Map(options)

    // allow GL base map to pan beyond min/max latitudes
    this._glMap.transform.latRange = null

    if (this._glMap._canvas.canvas) {
      // older versions of mapbox-gl surfaced the canvas differently
      this._glMap._actualCanvas = this._glMap._canvas.canvas
    } else {
      this._glMap._actualCanvas = this._glMap._canvas
    }

    // treat child <canvas> element like L.ImageOverlay
    L.DomUtil.addClass(this._glMap._actualCanvas, 'leaflet-image-layer')
    L.DomUtil.addClass(this._glMap._actualCanvas, 'leaflet-zoom-animated')
  },

  _update(e) {
    // update the offset so we can correct for it later when we zoom
    this._offset = this._map.containerPointToLayerPoint([0, 0])

    if (this._zooming) {
      return
    }

    const size = this._map.getSize(),
      container = this._glContainer,
      gl = this._glMap,
      topLeft = this._map.containerPointToLayerPoint([0, 0])

    L.DomUtil.setPosition(container, topLeft)

    const center = this._map.getCenter()

    if (gl.transform.width !== size.x || gl.transform.height !== size.y) {
      container.style.width = size.x + 'px'
      container.style.height = size.y + 'px'
      if (gl._resize !== null && gl._resize !== undefined) {
        gl._resize()
      } else {
        gl.resize()
      }
    } else {
      gl.setCenter([center.lng, center.lat])
      gl.setZoom(this._map.getZoom() - 1)
    }
  },

  // update the map constantly during a pinch zoom
  _pinchZoom(e) {
    this._glMap.jumpTo({
      zoom: this._map.getZoom() - 1,
      center: this._map.getCenter(),
    })
  },

  // borrowed from L.ImageOverlay https://github.com/Leaflet/Leaflet/blob/master/src/layer/ImageOverlay.js#L139-L144
  _animateZoom(e) {
    const scale = this._map.getZoomScale(e.zoom),
      offset = this._map._latLngToNewLayerPoint(
        this._map.getBounds().getNorthWest(),
        e.zoom,
        e.center
      )

    L.DomUtil.setTransform(
      this._glMap._actualCanvas,
      offset.subtract(this._offset),
      scale
    )
  },

  _zoomStart(e) {
    this._zooming = true
  },

  _zoomEnd() {
    const scale = this._map.getZoomScale(this._map.getZoom()),
      offset = this._map._latLngToNewLayerPoint(
        this._map.getBounds().getNorthWest(),
        this._map.getZoom(),
        this._map.getCenter()
      )

    L.DomUtil.setTransform(
      this._glMap._actualCanvas,
      offset.subtract(this._offset),
      scale
    )

    this._zooming = false
  },

  _transitionEnd(e) {
    L.Util.requestAnimFrame(function() {
      // @ts-ignore
      const zoom = this._map.getZoom(),
        // @ts-ignore
        center = this._map.getCenter(),
        // @ts-ignore
        offset = this._map.latLngToContainerPoint(this._map.getBounds().getNorthWest())

      // reset the scale and offset
      // @ts-ignore
      L.DomUtil.setTransform(this._glMap._actualCanvas, offset, 1)

      // enable panning once the gl map is ready again
      // @ts-ignore
      this._glMap.once(
        'moveend',
        L.Util.bind(function() {
          // @ts-ignore
          this._zoomEnd()
          // @ts-ignore
        }, this)
      )

      // update the map position
      // @ts-ignore
      this._glMap.jumpTo({
        center,
        zoom: zoom - 1,
      })
    }, this)
  },
})

export default function(options) {
  // @ts-ignore
  return new MapboxLeaflet(options)
}
