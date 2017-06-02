/*
 *  player - v4.1.0
 *  A jump-start for jQuery plugins development.
 *  
 *
 *  Made by JD-R2
 *  Under MIT License
 */
( function( $, window, document, undefined ) {
    "use strict";
    // Create the defaults once
    var pluginName = "player",
        defaults = {
            propertyName: "value"
        };
    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        // jQuery has an extend method which merges the contents of two or
        // more objects, storing the result in the first object. The first object
        // is generally empty as we don't want to alter the default options for
        // future instances of the plugin
        this.settings = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name = pluginName;
        this.init( );
    }

    function camelCase( string ) {
        return string.replace( /-([a-z])/ig, function( all, letter ) {
            return letter.toUpperCase( );
        } );
    }
    // Avoid Plugin.prototype conflicts
    $.extend( Plugin.prototype, {
        init: function( ) {
            // Place initialization logic here
            // You already have access to the DOM element and
            // the options via the instance, e.g. this.element
            // and this.settings
            // you can add more functions like the one below and
            // call them like the example below
            this.helloW( "hola mundo" );
        },
        help: function( ) {
            var funcs = $.map( this, function( elem, i ) {
                if ( typeof elem === "function" ) {
                    return i;
                }
            } );
            console.log( "defaults" );
            console.log( defaults );
            console.log( "métodos disponibles" );
            console.log( funcs );
            console.log( "------------" );
            return [ JSON.stringify( defaults ), JSON.stringify( funcs ) ];
        },
        helloW: function( text ) {
            // some logic
            return "text: " + text + ", my index: " + $( this.element ).text( text ).index( );
        }
    } );
    // preventing against multiple instantiations,
    // allowing set an action to do at the initialization
    $.fn[ pluginName ] = function( action, options ) {
        var toReturn;
        if ( typeof action !== "string" ) {
            options = action;
            toReturn = this.each( function( i, elem ) {
                if ( !$.data( elem, "plugin_" + pluginName ) ) {
                    $.data( elem, "plugin_" +
                        pluginName, new Plugin( elem, options ) );
                }
            } );
        } else {
            toReturn = this.map( function( i, elem ) {
                var plugin = $.data( elem, "plugin_" + pluginName );
                var tR;
                if ( !plugin ) {
                    plugin = new Plugin( elem, options );
                    $.data( elem, "plugin_" + pluginName, plugin );
                }
                if ( typeof plugin[ camelCase( action ) ] === "function" ) {
                    tR = plugin[ camelCase( action ) ]( options );
                }
                return tR;
            } ).get( );
            switch ( toReturn.length ) {
                case 0:
                    toReturn = null;
                    break;
                case 1:
                    toReturn = toReturn[ 0 ];
                    break;
                default:
            }
        }
        return toReturn;
    };
    $[ pluginName ] = function( action ) {
        return ( new Plugin( ) )[ camelCase( action ) ]( );
    };
} )( jQuery, window, document );
