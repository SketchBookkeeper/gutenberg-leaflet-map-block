<?php
/**
 * Plugin Name: Gutenberg Leaflet Map Block
 * Plugin URI:
 * Description: Add beautiful custom maps to your Gutenberg editor. Supports Custom Icons, Popups and a selection of map themes.
 * Author: Paul Allen
 * Author URI: https://github.com/SketchBookkeeper
 * Version: 1.0.0
 * License: MIT
 * License URI: https://github.com/SketchBookkeeper/gutenberg-leaflet-map-block/blob/master/LICENSE
 *
 * @package GLM
 */

/**
 * TODOs
 * Guide on getting mapbox api key
 * Notice if not using own
 * Frontend rendering
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block Initializer.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/init.php';
