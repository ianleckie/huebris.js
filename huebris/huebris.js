/**
 * huebris.js
 * ----------
 * A script that automatically generates hue-based CSS color palettes with tint, tone, shade and alpha variations.
 * 
 * Use: huebris.init( CSSElement = 'html', variablePrefix = 'huebris' )
 *  ie: huebris.init()
 *  or: huebris.init( 'body', 'myprefix' )
 * 
 * Optional palette display in HTML element: huebris.showPalette( {{document.getElementById('mypalette')}} )
 * Optional palette HTML output as obj or str: huebris.getPalette( '{{obj|str}}')
 * 
 * More in-depth documentation available on GitHub.
 * 
 * huebris.js <https://github.com/ianleckie/huebris.js>
 * is (part of) Probably Enough <https://huebris.probablyenough.dev/>
 * and made by @ianleckie <https://ianleckie.me/>
 */

const huebris = {

    huebrisDefaults: {
        black: 'black', // supports any CSS color format
        white: 'white', // supports any CSS color format

        tintSteps:  4, // 2-6, or 0 to skip
        toneSteps:  4, // 2-6, or 0 to skip
        shadeSteps: 4, // 2-6, or 0 to skip
        alphaSteps: 4, // 2-6, or 0 to skip
        globalSteps: 0, // overrides tint/tone/shade/alpha if > 0

        utilityClasses: true,

        outputMode: 'steps',   // value (--primary-alpha60), steps (--primary-alpha3), compact (--pa3)
        colorMode:  'srgb',    // https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color-interpolation-method
        hueMode:    'shorter', // https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/hue-interpolation-method

        debug: false,
    },

    stepOptions: {
        2: [ 67, 33 ],
        3: [ 75, 50, 25 ],
        4: [ 80, 60, 40, 20 ],
        5: [ 84, 67, 50, 33, 16 ],
        6: [ 86, 71, 57, 43, 29, 14 ],
    },

    huebrisConfig: {},
    baseColors: {}, // discovered from CSS variables
    generatedVars: {},
    startTime: null,
    
    setConfig( CSSElement, variablePrefix ) {
        const el = document.querySelector( CSSElement );
        if ( ! el ) {
            console.error( `huebris: could not find element "${ CSSElement }"` );
            return false;
        }

        const computed = getComputedStyle( el );

        // helper: read a --huebrisconf- var, falling back to default; strips surrounding quotes
        const conf = ( key, fallback ) => {
            const val = computed.getPropertyValue( `--huebrisconf-${ key }` ).trim().replace( /^['"]|['"]$/g, '' );
            return val !== '' ? val : fallback;
        };

        const d = this.huebrisDefaults;

        this.huebrisConfig = {
            CSSElement,
            element: el,
            variablePrefix,

            black: conf( 'black', d.black ),
            white: conf( 'white', d.white ),

            tintSteps:   parseInt( conf( 'tint-steps',   d.tintSteps  ) ),
            toneSteps:   parseInt( conf( 'tone-steps',   d.toneSteps  ) ),
            shadeSteps:  parseInt( conf( 'shade-steps',  d.shadeSteps ) ),
            alphaSteps:  parseInt( conf( 'alpha-steps',  d.alphaSteps ) ),
            globalSteps: parseInt( conf( 'global-steps', d.globalSteps ) ),

            utilityClasses: conf( 'utility-classes', String( d.utilityClasses ) ) === 'true',
            outputMode:     conf( 'output-mode', d.outputMode ),
            colorMode:      conf( 'color-mode',  d.colorMode  ),
            hueMode:        conf( 'hue-mode',    d.hueMode    ),
            debug:          conf( 'debug', String( d.debug ) ) === 'true',
        };

        // globalSteps overrides individual steps if set
        if ( this.huebrisConfig.globalSteps > 0 ) {
            const g = this.huebrisConfig.globalSteps;
            this.huebrisConfig.tintSteps  = g;
            this.huebrisConfig.toneSteps  = g;
            this.huebrisConfig.shadeSteps = g;
            this.huebrisConfig.alphaSteps = g;
        }

        // validate step values
        const validSteps = [ 0, 2, 3, 4, 5, 6 ];
        [ 'tintSteps', 'toneSteps', 'shadeSteps', 'alphaSteps' ].forEach( key => {
            if ( ! validSteps.includes( this.huebrisConfig[ key ] ) ) {
                console.warn( `huebris: invalid ${ key } value "${ this.huebrisConfig[ key ] }" — must be 0 or 2-6. Falling back to ${ d[ key ] }.` );
                this.huebrisConfig[ key ] = d[ key ];
            }
        } );

        // mixMode: hueMode only meaningful for polar color spaces, not srgb
        const polarModes = [ 'hsl', 'hwb', 'lch', 'oklch', 'lab', 'oklab' ];
        const isPolar = polarModes.some( m => this.huebrisConfig.colorMode.includes( m ) );
        this.huebrisConfig.mixMode = isPolar
            ? `in ${ this.huebrisConfig.colorMode } ${ this.huebrisConfig.hueMode } hue`
            : `in ${ this.huebrisConfig.colorMode }`;

        if ( this.huebrisConfig.debug ) console.log( 'huebris config:', this.huebrisConfig );
        return true;
    },
    
    discoverColors( variablePrefix ) {
        this.baseColors = {};
        const prefix = `--${ variablePrefix }-`;

        // Walk all stylesheets looking for rules on the configured CSSElement
        // Note: cross-origin stylesheets will throw an error, we skip those gracefully
        for ( const sheet of document.styleSheets ) {
            let rules;
            try {
                rules = sheet.cssRules;
            } catch ( e ) {
                if ( this.huebrisConfig.debug ) console.warn( 'huebris: skipping cross-origin stylesheet', sheet.href );
                continue;
            }

            for ( const rule of rules ) {
                if ( rule.selectorText !== this.huebrisConfig.CSSElement ) continue;

                for ( const prop of rule.style ) {
                    if ( ! prop.startsWith( prefix ) ) continue;

                    // '--huebris-primary' → 'primary'
                    const name = prop.slice( prefix.length );
                    const value = rule.style.getPropertyValue( prop ).trim();
                    this.baseColors[ name ] = value;
                }
            }
        }

        if ( Object.keys( this.baseColors ).length === 0 ) {
            console.warn( `huebris: no color variables found with prefix "${ prefix }" on "${ this.huebrisConfig.CSSElement }"` );
        }

        if ( this.huebrisConfig.debug ) console.log( 'huebris baseColors:', this.baseColors );
    },
    
    addGrey() {
        this.generatedVars.grey = `color-mix( ${ this.huebrisConfig.mixMode }, var(--black) 50%, var(--white) 50% )`;
    },

    addVariations( type, stepCount ) {
        const mixWith = {
            tint:  'var(--white)',
            tone:  'var(--grey)',
            shade: 'var(--black)',
            alpha: 'transparent',
        };

        const mix   = this.huebrisConfig.mixMode;
        const steps = this.stepOptions[ stepCount ];
        const mode  = this.huebrisConfig.outputMode;

        // variable name based on outputMode
        // compact abbreviates: 'primary-tint' → 'pt', 'primary-alpha' → 'pa'
        const varName = ( colorName, varType, stepIndex, stepValue ) => {
            switch ( mode ) {
                case 'value':   return `${ colorName }-${ varType }${ stepValue }`;
                case 'compact': return `${ colorName[ 0 ] }${ varType[ 0 ] }${ stepIndex }`;
                default:        return `${ colorName }-${ varType }${ stepIndex }`; // steps
            }
        };

        const colorMix = ( colorName, stepValue ) =>
            `color-mix( ${ mix }, var(--${ colorName }) ${ stepValue }%, ${ mixWith[ type ] } ${ 100 - stepValue }% )`;

        if ( type === 'alpha' ) {
            // alpha targets: black + white + grey + baseColors + all tint/tone/shade vars generated so far
            const alphaSources = [
                'black',
                'white',
                'grey',
                ...Object.keys( this.baseColors ),
                ...Object.keys( this.generatedVars ),
            ];

            alphaSources.forEach( colorName => {
                steps.forEach( ( stepValue, i ) => {
                    const key = varName( colorName, 'alpha', i + 1, stepValue );
                    this.generatedVars[ key ] = colorMix( colorName, stepValue );
                } );
            } );

        } else {
            // tint / tone / shade:
            const colorTargets = [
                ...Object.keys( this.baseColors ),
            ];

            if ( type !== 'tint' ) colorTargets.push( 'white' );
            if ( type !== 'tone' ) colorTargets.push( 'grey' );
            if ( type !== 'shade' ) colorTargets.push( 'black' );

            colorTargets.forEach( colorName => {
                steps.forEach( ( stepValue, i ) => {
                    const key = varName( colorName, type, i + 1, stepValue );
                    this.generatedVars[ key ] = colorMix( colorName, stepValue );
                } );
            } );
        }

        if ( this.huebrisConfig.debug ) console.log( `huebris addVariations [${ type }]:`, this.generatedVars );
    },

    writeCSS() {
        const selector = this.huebrisConfig.CSSElement;

        // all vars to write: black, white, baseColors, grey, then all generated variations
        const allVars = {
            black: this.huebrisConfig.black,
            white: this.huebrisConfig.white,
            ...Object.fromEntries( Object.entries( this.baseColors ).map( ( [ k, v ] ) => [ k, v ] ) ),
            ...this.generatedVars,
        };

        // -- CSS custom properties block --
        const varLines = Object.entries( allVars )
            .map( ( [ name, value ] ) => `    --${ name }: ${ value };` )
            .join( '\n' );

        let css = `${ selector } {\n${ varLines }\n}\n`;

        // -- utility classes --
        if ( this.huebrisConfig.utilityClasses ) {
            const classLines = Object.keys( allVars )
                .map( name => [
                    `.${ name } { background-color: var(--${ name }); }`,
                    `.${ name }-text { color: var(--${ name }); }`,
                ].join( '\n' ) )
                .join( '\n' );

            css += `\n${ classLines }\n`;
        }

        // inject into <head>, replacing any previous huebris style tag
        const existing = document.getElementById( '--huebris-styles' );
        if ( existing ) existing.remove();

        const style = document.createElement( 'style' );
        style.id = '--huebris-styles';
        style.textContent = css;
        document.head.appendChild( style );

        if ( this.huebrisConfig.debug ) console.log( 'huebris writeCSS:\n', css );
    },

    getPalette( objOrStr = 'str' ) {
        const vars = this.generatedVars;

        // find all vars for a given color name + type prefix, eg. 'primary', 'tint'
        const getSteps = ( colorName, type ) =>
            Object.keys( vars )
                .filter( k => {
                    if ( type === 'alpha' ) return k.match( new RegExp( `^${ colorName }-alpha\\d+$` ) );
                    return k.match( new RegExp( `^${ colorName }-${ type }\\d+$` ) );
                } )
                .sort();

        const getAlphasOf = ( varName ) =>
            Object.keys( vars )
                .filter( k => k.match( new RegExp( `^${ varName }-alpha\\d+$` ) ) )
                .sort();

        const swatch = ( varName, size = 'large', label = null ) => {
            const text = label ?? varName;
            return `<div class="huebris-swatch huebris-swatch--${ size }" style="background-color: var(--${ varName })" title="--${ varName }">
                <span class="huebris-swatch__label">${ text }</span>
            </div>`;
        };

        const alphaRow = ( alphas ) =>
            `<div class="huebris-row huebris-row--alpha">
                ${ alphas.map( k => swatch( k, 'large' ) ).join( '' ) }
            </div>`;

        const variationSection = ( steps ) =>
            `<div class="huebris-row">
                ${ steps.map( k => {
                    const alphas = getAlphasOf( k );
                    return `<div class="huebris-col">
                        ${ swatch( k, 'large' ) }
                        ${ alphas.map( a => swatch( a, 'small' ) ).join( '' ) }
                    </div>`;
                } ).join( '' ) }
            </div>`;

        const colors = [ 'black', 'white', 'grey', ...Object.keys( this.baseColors ) ];

        const cards = colors.map( colorName => {
            const alphas  = getSteps( colorName, 'alpha' );
            const tints   = getSteps( colorName, 'tint' );
            const tones   = getSteps( colorName, 'tone' );
            const shades  = getSteps( colorName, 'shade' );

            return `<div class="huebris-card">
                <div class="huebris-card__header">--${ colorName }</div>
                <div class="huebris-card__base">${ swatch( colorName, 'large' ) }</div>
                ${ alphas.length  ? alphaRow( alphas )            : '' }
                ${ tints.length   ? variationSection( tints )     : '' }
                ${ tones.length   ? variationSection( tones )     : '' }
                ${ shades.length  ? variationSection( shades )    : '' }
            </div>`;
        } );

        const styles = `<style>
            .huebris-palette { font-family: monospace; font-size: 11px; display: flex; flex-direction: column; gap: 24px; padding: 16px; background: #111; color: #eee; }
            .huebris-card { border: 1px solid #333; padding: 8px; }
            .huebris-card__header { padding: 4px 0 8px; font-weight: bold; }
            .huebris-card__base { margin-bottom: 8px; }
            .huebris-row { display: flex; gap: 8px; margin-bottom: 8px; }
            .huebris-col { display: flex; flex-direction: column; gap: 4px; }
            .huebris-swatch { border: 1px solid #444; display: flex; align-items: flex-start; padding: 4px; box-sizing: border-box; }
            .huebris-swatch--large { width: 90px; height: 90px; }
            .huebris-swatch--small { width: 90px; height: 20px; }
            .huebris-swatch__label { background: rgba(0,0,0,.5); color: #fff; font-size: 9px; padding: 1px 3px; line-height: 1.2; word-break: break-all; }
        </style>`;

        const html = `${ styles }<div class="huebris-palette">${ cards.join( '' ) }</div>`;

        if ( objOrStr === 'obj' ) return { cards, styles };
        return html;
    },

    showPalette( htmlElement ) {
        if ( ! htmlElement ) {
            console.error( 'huebris: showPalette requires a valid HTML element' );
            return;
        }
        htmlElement.innerHTML = this.getPalette( 'str' );
    },
    
    init( CSSElement = 'html', variablePrefix = 'huebris' ) {
        this.startTime = Date.now();
        if ( this.huebrisDefaults.debug ) console.log( 'Starting huebris.js...' );

        // 1. config (reads --huebrisconf-* vars from the element)
        const ok = this.setConfig( CSSElement, variablePrefix );
        if ( ! ok ) return;

        if ( this.huebrisConfig.debug ) console.log( 'Starting huebris.js...' );

        // 2. discover base colors ( --huebris-* vars from stylesheets )
        this.discoverColors( variablePrefix );

        // 3. setup
        this.addGrey();

        // 4. generate tint, tone, shade variations for all baseColors
        if ( this.huebrisConfig.tintSteps  > 0 ) this.addVariations( 'tint',  this.huebrisConfig.tintSteps  );
        if ( this.huebrisConfig.toneSteps  > 0 ) this.addVariations( 'tone',  this.huebrisConfig.toneSteps  );
        if ( this.huebrisConfig.shadeSteps > 0 ) this.addVariations( 'shade', this.huebrisConfig.shadeSteps );

        // 5. generate alpha variations for black, white, grey, baseColors, and all tint/tone/shade variations
        if ( this.huebrisConfig.alphaSteps > 0 ) this.addVariations( 'alpha', this.huebrisConfig.alphaSteps );

        // 6. write everything to the document
        this.writeCSS();

        if ( this.huebrisConfig.debug ) {
            console.log( 'huebris generatedVars:', this.generatedVars );
            console.log( `huebris done in ${ Date.now() - this.startTime }ms` );
        }
    },

}
