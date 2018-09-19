/**
 * BLOCK: gutenberg-leaflet-map-block
 *
 * Registering a basic block with Gutenberg.
 *
 */

//  Import CSS.
import './style.scss';
import './editor.scss';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks

import { MapBlock } from './edit';

/**
 * Register: a Gutenberg Block.
 *
 * Registers a new block provided a unique name and an object defining its
 * behavior. Once registered, the block is made editor as an option to any
 * editor interface where blocks are implemented.
 *
 * @link https://wordpress.org/gutenberg/handbook/block-api/
 * @param  {string}   name     Block name.
 * @param  {Object}   settings Block settings.
 * @return {?WPBlock}          The block, if it has been successfully
 *                             registered; otherwise `undefined`.
 */
registerBlockType( 'gutenberg-leaflet-map-block/block-gutenberg-leaflet-map-block', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'Leaflet Map' ), // Block title.
	icon: 'location', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'embed', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__( 'Map' ),
		__( 'Leaflet JS' ),
	],

	attributes: {
		mapLatLng: {
			type: 'array',
			default: [ 51.505, -0.09 ],
		},
		markerLatLng: {
			type: 'array',
			default: [ 51.505, -0.09 ],
		},
		address: {
			type: 'string',
			default: 'London, Greater London, England, United Kingdom',
		},
		height: {
			type: 'number',
			default: 300,
		},
		zoom: {
			type: 'number',
			default: 12,
		},
		showControls: {
			type: 'boolean',
			default: true,
		},
		mapContainerBackground: {
			type: 'string',
			default: 'transparent',
		},
		customIconID: {
			type: 'number',
			default: 0,
		},
		customIconURL: {
			type: 'string',
		},
		customIconWidth: {
			type: 'number',
		},
		customIconHeight: {
			type: 'number',
		},
		mapStyle: {
			type: 'string',
			default: 'mapbox://styles/mapbox/outdoors-v10',
		},
		showPopup: {
			type: 'boolean',
			default: true,
		},
		popupContent: {
			type: 'string',
		},
	},

	edit: function( props ) {
		return new MapBlock( props );
	},

	save: function( props ) {
		return (
			<div data-gutenberg-leaflet-map-block='{
				"maxZoom": 18,
				"id": "mapbox.streets"
			}' ></div>
		);
	},
} );
