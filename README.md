# huebris.js
A script that automatically generates hue-based CSS color palettes with tint, tone, shade and alpha variations using CSS `color-mix()`.

**huebris.js** simply generates and injects CSS variables (and optional utility classes), so it can easily co-exist with different workflows and approaches.

> [**huebris.js**](https://github.com/ianleckie/huebris.js) is [made by @ianleckie](https://ianleckie.me)

> [Download v1.0.0 (.zip)](https://github.com/ianleckie/huebris.js/releases/download/1.0.0/huebris-1.0.0.zip)

---

**Jump to:** 🧑‍💻 [Usage](#%E2%80%8D-usage) | ⚙️ [Options](#%EF%B8%8F-options) | 📜 [Example](#-example)

---

## 🧑‍💻 Usage:

**ie: `/css/style.css`**
```css
html {
    /*
        base hues:
        - any variable that starts with `--huebris-` (or your custom prefix) will be processed
        - supports any valid CSS color definition
        - gives the most range with opaque, pure hues, ie:
            - `hsl( {{0-360}}, 100%, 50% )`
    */
    --huebris-primary: purple;
    --huebris-secondary: #00ffff;
    --huebris-tertiary: hsl(30, 100%, 50%);
}
```

**ie: `index.html`**
```html
<html>
    <head>
        <link rel="stylesheet" href="/css/style.css">
    </head>
    <body>
        <script src="/js/vendor/huebris.js"></script>
        <script>
            huebris.init();
            // equivalent to:
            // huebris.init( 'html', 'heubris' );
        </script>
    </body>
</html>
```

### To view the generated color palette:

**HTML:**
```html
<!-- add whatever element you want... -->
<div id="palette"></div>
```

**JavaScript:**
```javascript
// then pass the element you're using
huebris.showPalette( document.getElementById( 'palette' ) );
```

#### *Or:*

**JavaScript:**
```javascript
// get the palette as HTML (obj or str) to use how you want
const palette = huebris.getPalette( 'obj' );
```

## ⚙️ Options:

**ie. `/css/style.css`**
```css
html {
    /* defaults are shown below */
    /* add any variables you want to change to your CSS */

    /*
        optionally tint black and white for a hued cast to the palette
        - supports any valid CSS color definition
        - results will vary the farther away from pure black and white you get
    */
    --huebrisconf-black: color-mix( in srgb, black 90%, khaki 10% );
    --huebrisconf-white: color-mix( in srgb, white 90%, khaki 10% );

    /* step settings - controls how many variations to generate */
    --huebrisconf-tint-steps:      '4';       /* 2-6, or 0 to skip: the number of tint variations to generate */
    --huebrisconf-tone-steps:      '4';       /* 2-6, or 0 to skip: the number of tone variations to generate */
    --huebrisconf-shade-steps:     '4';       /* 2-6, or 0 to skip: the number of shade variations to generate */
    --huebrisconf-alpha-steps:     '4';       /* 2-6, or 0 to skip: the number of alpha variations to generate */
    /* `--huebrisconf-global-steps` overrides the above settings if > 0: */
    --huebrisconf-global-steps:    '0';       /* 2-6, or 0 to use other settings: the number of variations to generate globally */
    
    /* output settings */
    --huebrisconf-utility-classes: 'true';    /* generate utility classes and variables if true, otherwise just variables */
    --huebrisconf-output-mode:     'steps';   /* 'value' (alpha60), 'steps' (alpha3), or 'compact' (a3) output for variables and utility classes */
    --huebrisconf-color-mode:      'srgb';    /* https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color-interpolation-method */
    --huebrisconf-hue-mode:        'shorter'; /* https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/hue-interpolation-method */
    --huebrisconf-debug:           'false';   /* outputs debug info to console if true */
}
```

### Example Settings:

**Compact style, No color variations, 4 alpha variations, no classes:**
```css
html {
    --huebrisconf-tint-steps:      '0';
    --huebrisconf-tone-steps:      '0';
    --huebrisconf-shade-steps:     '0';
    --huebrisconf-utility-classes: 'false';
    --huebrisconf-output-mode:     'compact';
}
```

**Steps style, 5 color variations, 3 alpha variations, no classes:**
```css
html {
    --huebrisconf-tint-steps:      '5';
    --huebrisconf-tone-steps:      '5';
    --huebrisconf-shade-steps:     '5';
    --huebrisconf-alpha-steps:     '3';
    --huebrisconf-utility-classes: 'false';
}
```

**Value style, 6 color variations, 5 alpha variations, utility classes:**
```css
html {
    --huebrisconf-tint-steps:      '6';
    --huebrisconf-tone-steps:      '6';
    --huebrisconf-shade-steps:     '6';
    --huebrisconf-alpha-steps:     '5';
    --huebrisconf-output-mode:     'value';
}
```

**Steps style, all the possible utility classes:**
```css
html {
   --huebrisconf-global-steps:    '6';
}
```

## 📜 Example:

**Input:**
```css
html {
    --huebris-primary: purple;
}
```

**Output (variables):**
```css
html {
    /* basics */
    --primary: purple;

    --black: black;
    --white: white;

    /* greyscale */
    --grey: color-mix( in srgb shorter hue, var(--black) 50%, var(--white) 50% );
    --grey-alpha1: color-mix( in srgb shorter hue, var(--grey) 80%, transparent 20% );
    --grey-alpha2: color-mix(...);
    --grey-alpha3: color-mix(...);
    --grey-alpha4: color-mix(...);
    --grey-tint1: color-mix( in srgb shorter hue, var(--grey) 80%, var(--white) 20% );
    --grey-tint1-alpha1: color-mix( in srgb shorter hue, var(--grey-tint1) 80%, transparent 20% );
    --grey-tint1-alpha2: color-mix(...);
    --grey-tint1-alpha3: color-mix(...);
    --grey-tint1-alpha4: color-mix(...);
    --grey-tint2: color-mix(...);
    --grey-tint2-alpha1: color-mix(...);
    --grey-tint2-alpha2: color-mix(...);
    --grey-tint2-alpha3: color-mix(...);
    --grey-tint2-alpha4: color-mix(...);
    --grey-tint3: color-mix(...);
    --grey-tint3-alpha1: color-mix(...);
    --grey-tint3-alpha2: color-mix(...);
    --grey-tint3-alpha3: color-mix(...);
    --grey-tint3-alpha4: color-mix(...);
    --grey-tint4: color-mix(...);
    --grey-tint4-alpha1: color-mix(...);
    --grey-tint4-alpha2: color-mix(...);
    --grey-tint4-alpha3: color-mix(...);
    --grey-tint4-alpha4: color-mix(...);
    /* no tones for greyscale */
    --grey-shade1: color-mix( in srgb shorter hue, var(--grey) 80%, var(--black) 20% );
    --grey-shade1-alpha1: color-mix(...);
    --grey-shade1-alpha2: color-mix(...);
    --grey-shade1-alpha3: color-mix(...);
    --grey-shade1-alpha4: color-mix(...);
    --grey-shade2: color-mix(...);
    --grey-shade2-alpha1: color-mix(...);
    --grey-shade2-alpha2: color-mix(...);
    --grey-shade2-alpha3: color-mix(...);
    --grey-shade2-alpha4: color-mix(...);
    --grey-shade3: color-mix(...);
    --grey-shade3-alpha1: color-mix(...);
    --grey-shade3-alpha2: color-mix(...);
    --grey-shade3-alpha3: color-mix(...);
    --grey-shade3-alpha4: color-mix(...);
    --grey-shade4: color-mix(...);
    --grey-shade4-alpha1: color-mix(...);
    --grey-shade4-alpha2: color-mix(...);
    --grey-shade4-alpha3: color-mix(...);
    --grey-shade4-alpha4: color-mix(...);

    /* primary */
    --primary-alpha1: color-mix(...);
    --primary-alpha2: color-mix(...);
    --primary-alpha3: color-mix(...);
    --primary-alpha4: color-mix(...);
    --primary-tint1: color-mix(...);
    --primary-tint1-alpha1: color-mix(...);
    --primary-tint1-alpha2: color-mix(...);
    --primary-tint1-alpha3: color-mix(...);
    --primary-tint1-alpha4: color-mix(...);
    --primary-tint2: color-mix(...);
    --primary-tint2-alpha1: color-mix(...);
    --primary-tint2-alpha2: color-mix(...);
    --primary-tint2-alpha3: color-mix(...);
    --primary-tint2-alpha4: color-mix(...);
    --primary-tint3: color-mix(...);
    --primary-tint3-alpha1: color-mix(...);
    --primary-tint3-alpha2: color-mix(...);
    --primary-tint3-alpha3: color-mix(...);
    --primary-tint3-alpha4: color-mix(...);
    --primary-tint4: color-mix(...);
    --primary-tint4-alpha1: color-mix(...);
    --primary-tint4-alpha2: color-mix(...);
    --primary-tint4-alpha3: color-mix(...);
    --primary-tint4-alpha4: color-mix(...);
    --primary-tone1:  color-mix( in srgb shorter hue, var(--primary) 80%, var(--grey) 20% );
    --primary-tone1-alpha1: color-mix(...);
    --primary-tone1-alpha2: color-mix(...);
    --primary-tone1-alpha3: color-mix(...);
    --primary-tone1-alpha4: color-mix(...);
    --primary-tone2: color-mix(...);
    --primary-tone2-alpha1: color-mix(...);
    --primary-tone2-alpha2: color-mix(...);
    --primary-tone2-alpha3: color-mix(...);
    --primary-tone2-alpha4: color-mix(...);
    --primary-tone3: color-mix(...);
    --primary-tone3-alpha1: color-mix(...);
    --primary-tone3-alpha2: color-mix(...);
    --primary-tone3-alpha3: color-mix(...);
    --primary-tone3-alpha4: color-mix(...);
    --primary-tone4: color-mix(...);
    --primary-tone4-alpha1: color-mix(...);
    --primary-tone4-alpha2: color-mix(...);
    --primary-tone4-alpha3: color-mix(...);
    --primary-tone4-alpha4: color-mix(...);
    --primary-shade1: color-mix(...);
    --primary-shade1-alpha1: color-mix(...);
    --primary-shade1-alpha2: color-mix(...);
    --primary-shade1-alpha3: color-mix(...);
    --primary-shade1-alpha4: color-mix(...);
    --primary-shade2: color-mix(...);
    --primary-shade2-alpha1: color-mix(...);
    --primary-shade2-alpha2: color-mix(...);
    --primary-shade2-alpha3: color-mix(...);
    --primary-shade2-alpha4: color-mix(...);
    --primary-shade3: color-mix(...);
    --primary-shade3-alpha1: color-mix(...);
    --primary-shade3-alpha2: color-mix(...);
    --primary-shade3-alpha3: color-mix(...);
    --primary-shade3-alpha4: color-mix(...);
    --primary-shade4: color-mix(...);
    --primary-shade4-alpha1: color-mix(...);
    --primary-shade4-alpha2: color-mix(...);
    --primary-shade4-alpha3: color-mix(...);
    --primary-shade4-alpha4: color-mix(...);
}
```

**Output (variables):**
```css
.black { background-color: var(--black); }
.black-text { color: var(--black); }

.white { background-color: var(--white); }
.white-text { color: var(--white); }

.grey { background-color: var(--grey); }
.grey-text { color: var(--grey); }

.primary { background-color: var(--primary); }
.primary-text { color: var(--primary); }

/* etc... */
```

---
