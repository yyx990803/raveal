# Raveal.js

> Radially reveal an element.

[Demo](http://yyx990803.github.io/raveal/)

CSS `clip-path` property is pretty awesome, but for some reason `clip-path: circle(cx, cy, r);` is not working properly in latest Chrome. The workaround is to use an SVG clipPath with `clip-path: url(...)`, update the SVG path, then set the `clip-path` property again. Also, Chrome and Firefox behave quite differently when handling the positions of clipPaths.

Raveal.js wraps up these hacks into an easier to use interface.

## Compatibility

Chrome / Firefox / Safari. To my knowledge IE doesn't support non-rectangular shapes for clipPaths when used on non-SVG elements, but feel free to test and contribute a fix.

## Usage

Install via Bower, Component or NPM, or include with a script tag.

#### `new Raveal(element | selector [, options])`

```js
var rad = new Raveal('#rad', {
  // options with default values:
  closed : false,    // whether to initialize in closed state
  ease   : 6,        // animation easing factor. smaller = faster
  maxR   : undefined // max clip radius. if not provided will
                     // auto-calculate based on element dimensions
})
```

#### `rad.open()` or `rad.open(x, y)` or `rad.open(event)`

Reveal the element at given position (relative to the element's bounding box's top-left corner). If no position is given the previous position will be used.

You can also pass in a mouse/touch event and Raveal.js will resolve browser differences automatically for you. (See demo source in `index.html`)

#### `rad.close()` or `rad.close(x, y)` or `rad.close(event)`

Close the element.

#### `rad.toggle()` or `rad.toggle(x, y)` or `rad.toggle(event)`

Toggle the element.

## License

MIT