/**
 * Conditions JS 1.1.0.
 *
 * This is a forked version of the jQuery Conditions plugin, version 3.4.0.
 *
 * Copyright 2016 Benjamin Rojas
 *
 * @license Released under the MIT license.
 * http://jquery.org/license
 */

/* globals jQuery, define, exports, require */

/**
 * @param $.each
 * @param $.extend
 * @param $.fn
 * @param $.on
 * @param define.amd
 * @param root.$
 * @param root.jQuery
 */

( function( root, factory ) {
	if ( typeof define === "function" && define.amd ) {
		/*
		 * We are in a RequireJS environment.
		 * The `define` function is used to define modules.
		 * The first argument is an array of module dependencies.
		 * The second argument is a function that will be called when all dependencies are loaded.
		 * The first argument of the callback function is the 'exports' object.
		 * The second argument of the callback function is the jQuery module.
		 */
		define( [ "exports", "jquery" ], function( exports, $ ) {
			return factory( exports, $ );
		} );
	} else if ( typeof exports !== "undefined" ) {
		/*
		 * We are in a CommonJS environment.
		 * Load jQuery as a dependency.
		 */
		// noinspection NpmUsedModulesInstalled
		const $ = require( "jquery" );

		factory( exports, $ );
	} else {
		// Browser.
		factory( root, ( root.jQuery || root.$ ) );
	}
}( this, function( exports, $ ) {
	"use strict";

	const conditionsjs = {
		defaults: {
			condition: null,
			actions: {},
			effect: 'fade'
		}
	};

	/**
	 * Callback function to be used with jQuery to create an instance of ConditionsJS.
	 *
	 * @param {object} conditions - An object that contains the conditions to be met.
	 *
	 * @returns {jQuery} The jQuery object, for chaining.
	 */
	conditionsjs.callback = function( conditions ) {
		return this.each( function( index, element ) {
			const CJS = new ConditionsJS( element, conditions, conditionsjs.defaults );

			CJS.init();
		} );
	};

	if ( typeof $.fn !== "undefined" ) {
		$.fn.conditions = conditionsjs.callback;
	}

	exports.conditionsjs = conditionsjs;

	/**
	 * ConditionsJS constructor.
	 *
	 * @param {HTMLElement} element - The element the conditions will be applied to.
	 * @param {object|array} conditions - The conditions or an array of conditions.
	 * @param {object} defaults - Object with default options.
	 *
	 * @constructor
	 */
	const ConditionsJS = function( element, conditions, defaults ) {
		const that = this;

		that.element = $( element );
		that.defaults = defaults;
		that.conditions = conditions;
		that._init = false;

		if ( ! Array.isArray( that.conditions ) ) {
			that.conditions = [ that.conditions ];
		}

		$.each( that.conditions, function( i, v ) {
			that.conditions[ i ] = $.extend( {}, that.defaults, v );
		} );
	};

	/**
	 * Initializes the ConditionsJS object.
	 *
	 * Sets up event listeners for the element:
	 *  - 'change' event: triggers {@link ConditionsJS#matchConditions} when the element's value changes.
	 *  - 'keyup' event: triggers {@link ConditionsJS#matchConditions} when the user types something in the element.
	 *
	 * Also calls {@link ConditionsJS#matchConditions} with the `init` argument set to true
	 * to show or hide elements based on the current value of the element.
	 */
	ConditionsJS.prototype.init = function() {
		const that = this;

		that._init = true;

		// Set up event listener.
		$( that.element ).on( 'change', function() {
			that.matchConditions();
		} );

		$( that.element ).on( 'keyup', function() {
			that.matchConditions();
		} );

		// Show based on current value on a page load.
		that.matchConditions( true );
	};

	/**
	 * Evaluates and applies conditions to show or hide elements based on specified criteria.
	 *
	 * @param {boolean} init - Indicates whether the function is called during initialization.
	 *                         If true, the function checks the current state and shows/hides
	 *                         elements accordingly.
	 *
	 * This function iterates over the conditions, evaluating each condition's criteria.
	 * Depending on the type and operator specified,
	 * it matches the condition against the element's value(s) or checked state.
	 * When conditions are met, it executes the 'if' actions to show or hide elements with the specified effect.
	 * If conditions are not met, it executes the 'else' actions.
	 *
	 * Supported types: 'value', 'checked'.
	 * Supported operators for 'value': '===', '==', '=', '!==', '!=', 'array', '!array'.
	 * Supported operators for 'checked': 'is', '!is'.
	 */
	ConditionsJS.prototype.matchConditions = function( init = false ) {
		const that = this;

		if ( ! init ) {
			that._init = false;
		}

		$.each( that.conditions, function( ind, cond ) {
			let condition_matches = false, all_conditions_match = true;

			if ( ! Array.isArray( cond.conditions ) ) {
				cond.conditions = [ cond.conditions ];
			}

			$.each( cond.conditions, function( i, c ) {
				c = $.extend( {
					element: null,
					type: 'val',
					operator: '==',
					condition: null,
					multiple: 'single'
				}, c );

				c.element = $( c.element );

				switch ( c.type ) {
					case 'value':
					case 'val':
						switch ( c.operator ) {
							case '===':
							case '==':
							case '=':
								if ( Array.isArray( c.element.val() ) ) {
									let m_single_condition_matches = false;
									let m_all_condition_matches = true;

									$.each( c.element.val(), function( index, value ) {
										if ( value === c.condition ) {
											m_single_condition_matches = true;
										} else {
											m_all_condition_matches = false;
										}
									} );

									condition_matches = 'single' === c.multiple ? m_single_condition_matches : m_all_condition_matches;
								} else {
									condition_matches = c.element.val() === c.condition;
								}

								break;
							case '!==':
							case '!=':
								if ( Array.isArray( c.element.val() ) ) {
									let m_single_condition_matches = false;
									let m_all_condition_matches = true;

									$.each( c.element.val(), function( index, value ) {
										if ( value !== c.condition ) {
											m_single_condition_matches = true;
										} else {
											m_all_condition_matches = false;
										}
									} );

									condition_matches = 'single' === c.multiple ? m_single_condition_matches : m_all_condition_matches;
								} else {
									condition_matches = c.element.val() !== c.condition;
								}

								break;
							case 'array':
								if ( Array.isArray( c.element.val() ) ) {
									let m_single_condition_matches = false;
									let m_all_condition_matches = c.element.val().length === c.condition.length;

									$.each( c.element.val(), function( index, value ) {
										if ( $.inArray( value, c.condition ) !== -1 ) {
											m_single_condition_matches = true;
										} else {
											m_all_condition_matches = false;
										}
									} );

									condition_matches = 'single' === c.multiple ? m_single_condition_matches : m_all_condition_matches;
								} else {
									condition_matches = $.inArray( c.element.val(), c.condition ) !== -1;
								}
								break;
							case '!array':
								if ( Array.isArray( c.element.val() ) ) {
									let m_single_condition_matches = false;
									let m_all_condition_matches = true;
									const selected = [];

									$.each( c.element.val(), function( index, value ) {
										if ( $.inArray( value, c.condition ) === -1 ) {
											m_single_condition_matches = true;
										} else {
											selected.push( value );
										}
									} );

									if ( selected.length === c.condition.length ) {
										m_all_condition_matches = false;
									}

									condition_matches = 'single' === c.multiple ? m_single_condition_matches : m_all_condition_matches;
								} else {
									condition_matches = $.inArray( c.element.val(), c.condition ) === -1;
								}

								break;
						}
						break;
					case 'checked':
						switch ( c.operator ) {
							case 'is':
								condition_matches = c.element.is( ':checked' );
								break;
							case '!is':
								condition_matches = ! c.element.is( ':checked' );
								break;
						}
						break;
				}

				if ( ! condition_matches && all_conditions_match ) {
					all_conditions_match = false;
				}

			} );

			if ( all_conditions_match ) {
				if ( ! $.isEmptyObject( cond.actions.if ) ) {
					if ( ! Array.isArray( cond.actions.if ) ) {
						cond.actions.if = [ cond.actions.if ];
					}

					$.each( cond.actions.if, function( i, condition ) {
						that.showAndHide( condition, cond.effect );
					} );
				}
			} else {
				if ( ! $.isEmptyObject( cond.actions.else ) ) {
					if ( ! Array.isArray( cond.actions.else ) ) {
						cond.actions.else = [ cond.actions.else ];
					}

					$.each( cond.actions.else, function( i, condition ) {
						that.showAndHide( condition, cond.effect );
					} );
				}
			}
		} );
	};

	/**
	 * Show or hide a jQuery element based on the action given.
	 *
	 * @param {object} condition - An object with the following properties:
	 *   - action {string}: The action to perform on the element. Supported actions are 'show'
	 *     and 'hide'.
	 *   - element {string}: The CSS selector for the element to target.
	 * @param {string} effect - The effect to use to show/hide the element.
	 *   Supported effects are 'appear', 'slide', and 'fade'.
	 *
	 * @private
	 */
	ConditionsJS.prototype.showAndHide = function( condition, effect ) {
		const that = this;

		switch ( condition.action ) {
			case 'show':
				that._show( $( condition.element ), effect );

				break;
			case 'hide':
				that._hide( $( condition.element ), effect );

				break;
		}
	};

	/**
	 * Private method to show a jQuery element with a specified effect.
	 *
	 * @param {jQuery} element - The jQuery element to show.
	 * @param {string} effect  - The effect to use to show the element.
	 *                              Supported effects are 'appear', 'slide', and 'fade'.
	 *
	 * @private
	 */
	ConditionsJS.prototype._show = function( element, effect ) {
		const that = this;

		if ( that._init ) {
			element.show();
		} else {
			switch ( effect ) {
				case 'appear':
					element.show();

					break;
				case 'slide':
					element.slideDown();

					break;
				case 'fade':
					element.fadeIn( 300 );

					break;
			}
		}
	};

	/**
	 * Private method to hide a jQuery element.
	 *
	 * @param {jQuery} element  - The jQuery element to hide.
	 * @param {string} effect   - The effect to use to hide the element.
	 *                              Supported effects are 'appear',
	 *                            'slide', and 'fade'.
	 *
	 * @private
	 */
	ConditionsJS.prototype._hide = function( element, effect ) {
		const that = this;

		if ( that._init ) {
			element.hide();
		} else {
			switch ( effect ) {
				case 'appear':
					element.hide();

					break;
				case 'slide':
					element.slideUp();

					break;
				case 'fade':
					element.fadeOut( 300 );

					break;
			}
		}
	};
} ) );

