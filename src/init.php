<?php
/**
 * Blocks Initializer
 *
 * Enqueue CSS/JS of all the blocks.
 *
 * @since   1.0.0
 * @package CGB
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Enqueue Gutenberg block assets for both frontend + backend.
 *
 * `wp-blocks`: includes block type registration and related functions.
 *
 * @since 1.0.0
 */
function gutenberg_leaflet_map_block_block_assets() {
	// Scripts
	wp_enqueue_script(
		'gutenberg_leaflet_map_block-frontend-js', // Handle.
		plugins_url( '/dist/frontend.js', dirname( __FILE__ ) ),
		array( 'wp-blocks', 'wp-i18n', 'wp-element' ),
		filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: filemtime — Gets file modification time.
		true // Enqueue the script in the footer.
	);

	wp_localize_script(
		'gutenberg_leaflet_map_block-frontend-js',
		'gutenberg_leaflet_map_block',
		[ 'mapbox_api_key' => get_option( 'gutenberg_leafletjs_mapbox_api_key' ) ]
	);

	wp_enqueue_script(
		'leaflet',
		plugins_url( 'vendor/leaflet.js', dirname( __FILE__ ) )
	);

	// Styles.
	wp_enqueue_style(
		'gutenberg_leaflet_map_block-style-css', // Handle.
		plugins_url( 'dist/block.css', dirname( __FILE__ ) ), // Block style CSS.
		array( 'wp-blocks' ) // Dependency to include the CSS after it.
		// filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.style.build.css' ) // Version: filemtime — Gets file modification time.
	);

	wp_enqueue_style(
		'leaflet',
		plugins_url( 'vendor/leaflet.css', dirname( __FILE__ ) ),
		array( 'wp-blocks' )
	);
}

// Hook: Frontend assets.
add_action( 'enqueue_block_assets', 'gutenberg_leaflet_map_block_block_assets' );

/**
 * Enqueue Gutenberg block assets for backend editor.
 *
 * `wp-blocks`: includes block type registration and related functions.
 * `wp-element`: includes the WordPress Element abstraction for describing the structure of your blocks.
 * `wp-i18n`: To internationalize the block's text.
 *
 * @since 1.0.0
 */
function gutenberg_leaflet_map_block_editor_assets() {
	// Scripts.
	wp_enqueue_script(
		'gutenberg_leaflet_map_block-block-js', // Handle.
		plugins_url( '/dist/blocks.build.js', dirname( __FILE__ ) ), // Block.build.js: We register the block here. Built with Webpack.
		array( 'wp-blocks', 'wp-i18n', 'wp-element' ), // Dependencies, defined above.
		filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.build.js' ), // Version: filemtime — Gets file modification time.
		true // Enqueue the script in the footer.
	);

	wp_enqueue_script(
		'leaflet',
		plugins_url( 'vendor/leaflet.js', dirname( __FILE__ ) )
	);

	wp_localize_script(
		'gutenberg_leaflet_map_block-block-js',
		'gutenberg_leaflet_map_block',
		[
			'mapbox_api_key' => get_option( 'gutenberg_leafletjs_mapbox_api_key' ),
			'plugin_url'     => plugins_url( '', dirname( __FILE__ ) ),
		]
	);

	// Styles.
	wp_enqueue_style(
		'gutenberg_leaflet_map_block-block-editor-css', // Handle.
		plugins_url( 'dist/block.css', dirname( __FILE__ ) ), // Block editor CSS.
		array( 'wp-edit-blocks' ) // Dependency to include the CSS after it.
		// filemtime( plugin_dir_path( __DIR__ ) . 'dist/blocks.editor.build.css' ) // Version: filemtime — Gets file modification time.
	);

	wp_enqueue_style(
		'leaflet',
		plugins_url( 'vendor/leaflet.css', dirname( __FILE__ ) ),
		array( 'wp-edit-blocks' )
	);
}

// Hook: Editor assets.
add_action( 'enqueue_block_editor_assets', 'gutenberg_leaflet_map_block_editor_assets' );

/**
 * Create a setting for the API Key
 */
add_action( 'admin_init', 'gutenberg_leaflet_map_block_settings' );

function gutenberg_leaflet_map_block_settings() {
	add_settings_field(
		'gutenberg_leafletjs_mapbox_api_key',
		'Gutenberg Leafletjs: Mapbox API Key',
		'gutenberg_leaflet_map_block_settings_callback',
		'general',
		'default',
		[ 'gutenberg_leafletjs_mapbox_api_key' ]
	);

	register_setting( 'general', 'gutenberg_leafletjs_mapbox_api_key' );
}

function gutenberg_leaflet_map_block_settings_callback( $args ) {
	$option = get_option( $args[0] );

	$option_field  = '<input type="text"';
	$option_field .= 'id="gutenberg_leafletjs_mapbox_api_key"';
	$option_field .= 'name="gutenberg_leafletjs_mapbox_api_key"';
	$option_field .= 'style="width: 100%; max-width: 800px"';
	$option_field .= ' value="' . esc_html( $option ) . '">';

	echo $option_field; //XSS ok
}
