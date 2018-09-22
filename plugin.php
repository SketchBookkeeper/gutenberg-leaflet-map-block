<?php
/**
 * Plugin Name: Gutenberg Leaflet Map Block
 * Plugin URI:
 * Description: gutenberg-leaflet-map-block — is a Gutenberg plugin created via create-guten-block.
 * Author: Paul Allen
 * Author URI: https://github.com/SketchBookkeeper
 * Version: 1.0.0
 * License: MIT
 * License URI: https://github.com/SketchBookkeeper/gutenberg-leaflet-map-block/blob/master/LICENSE
 *
 * @package GLM
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Block Initializer.
 */
require_once plugin_dir_path( __FILE__ ) . 'src/init.php';
