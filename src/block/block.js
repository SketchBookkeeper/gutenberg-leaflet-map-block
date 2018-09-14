/**
 * BLOCK: gutenberg-leaflet-map-block
 *
 * Registering a basic block with Gutenberg.
 * Simple block, renders and saves the same content without any interactivity.
 */

//  Import CSS.
import './style.scss';
import './editor.scss';

const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks
const { Component } = wp.element;

/**
 * Register: aa Gutenberg Block.
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
registerBlockType( 'cgb/block-gutenberg-leaflet-map-block', {
	// Block name. Block names must be string that contains a namespace prefix. Example: my-plugin/my-custom-block.
	title: __( 'gutenberg-leaflet-map-block' ), // Block title.
	icon: 'location', // Block icon from Dashicons → https://developer.wordpress.org/resource/dashicons/.
	category: 'embed', // Block category — Group blocks together based on common traits E.g. common, formatting, layout widgets, embed.
	keywords: [
		__( 'gutenberg-leaflet-map-block' ),
		__( 'Map' ),
		__( 'Leaflet JS' ),
	],

	edit: function() {
		return new mapBlock();
	},

	save: function( props ) {

	},
} );

/**
 * Edit
 */
class mapBlock extends Component {
	constructor( props ) {
		super( props );
		this.mapContainer = React.createRef();
		this.mapboxApiKey = window.gutenberg_leaflet_map_block.mapbox_api_key;
	}

	render() {
		const styles = {
			height: '300px',
			background: '#67B6E3',
		};

		return (
			<div style={ styles } ref={ this.mapContainer }></div>
		);
	}

	componentDidMount() {
		this.map = L.map( this.mapContainer.current ).setView( [ 51.505, -0.09 ], 13 );

		L.tileLayer(
			'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
			{
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				maxZoom: 18,
				id: 'mapbox.streets',
				accessToken: this.mapboxApiKey,
			}
		).addTo( this.map );
	}
}
