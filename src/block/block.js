/**
 * BLOCK: gutenberg-leaflet-map-block
 *
 * Registering a basic block with Gutenberg.
 *
 * Wishlist Options
 *
 * - Custom Colors
 * - Custom Markers
 * - Location, click or lookup
 * - Zoom level
 * - Map Height and Width
 * - Static?
 *
 */

//  Import CSS.
import './style.scss';
import './editor.scss';

// Geocoder
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/images/geocoder.png';
import 'leaflet-control-geocoder/dist/images/throbber.gif';
import 'leaflet-control-geocoder';

const pluginUrl = window.gutenberg_leaflet_map_block.plugin_url;
const { __ } = wp.i18n; // Import __() from wp.i18n
const { registerBlockType } = wp.blocks; // Import registerBlockType() from wp.blocks
const {
	InspectorControls,
	MediaUpload
} = wp.editor;

const {
	Component,
	Fragment,
} = wp.element;

const {
	Button,
	Dashicon,
	PanelBody,
	ColorPalette,
	Placeholder,
	RangeControl,
	SelectControl,
	Spinner,
	TextControl,
	ToggleControl,
	Notice,
	IconButton,
} = wp.components;

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
			type: 'integer',
			default: 300,
		},
		zoom: {
			type: 'integer',
			default: 12,
		},
		mapContainerBackground: {
			type: 'string',
			default: '#67B6E3',
		},
		customIconID: {
			type: 'integer',
		},
		customIconURL: {
			type: 'string',
		},
		customIconWidth: {
			type: 'integer',
		},
		customIconHeight: {
			type: 'integer',
		},
	},

	edit: function( props ) {
		return new mapBlock( props );
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

/**
 * Edit
 */
class mapBlock extends Component {
	constructor( props ) {
		super( props );

		this.mapContainer = React.createRef();
		this.mapboxApiKey = window.gutenberg_leaflet_map_block.mapbox_api_key;

		this.state = {
			iconError: false,
		};

		this.showIconError.bind( this );
		this.hideIconError.bind( this );
	}

	//
	// State Management
	//
	showIconError() {
		this.setState( { iconError: true } );
	}

	hideIconError() {
		this.setState( { iconError: false } );
	}

	//
	// Update Methods
	//
	updateAddress( value ) {
		this.props.setAttributes( {
			address: value,
		} );
	}

	updateMapLatlng( value ) {
		this.props.setAttributes( {
			mapLatLng: value,
		} );
	}

	updateMarkerLatlng( value ) {
		this.props.setAttributes( {
			markerLatLng: value,
		} );
	}

	updateLocation( latlng, address ) {
		// Update multiple at once for expected responses from the
		// forward and back buttons in the Gutenberg UI.
		this.props.setAttributes( {
			markerLatLng: latlng,
			mapLatLng: latlng,
			address: address,
		} );
	}

	updateIcon( icon ) {
		this.props.setAttributes( {
			customIconID: icon.id,
			customIconURL: icon.url,
			customIconWidth: icon.width,
			customIconHeight: icon.height,
		} );
	}

	removeIcon() {
		this.props.setAttributes( {
			customIconID: null,
			customIconURL: null,
			customIconWidth: null,
			customIconHeight: null,
		} );
	}

	validateIcon( icon ) {
		if (
			icon.mime !== 'image/png' ||
			icon.height > 100 ||
			icon.width > 100
		) {
			return false;
		}

		return true;
	}

	//
	// Map Helper Functions
	//
	createCustomIcon( iconUrl, iconWidth, iconHeight ) {
		// Center the anchor point based the on the icon width
		const iconAnchor = [ ( iconWidth / 2 ), iconHeight ];

		return L.icon( {
			iconUrl,
			iconAnchor,
			iconSize: [ iconWidth, iconHeight ],
		} );
	}

	//
	// Render
	//
	render() {
		const { attributes, setAttributes } = this.props;

		const colors = [
			{ name: 'blue', color: '#67B6E3' },
			{ name: 'white', color: '#fff' },
			{ name: 'grey', color: '#A4BAB7' },
		];

		const styles = {
			height: `${ attributes.height }px`,
			background: attributes.mapContainerBackground,
		};

		return (
			<Fragment>
				<InspectorControls>
					<PanelBody title={ __( 'Leaflet Map Settings' ) }>
						<RangeControl
							label={ __( 'Height' ) }
							value={ attributes.height }
							onChange={ ( value ) => setAttributes( { height: value } ) }
							min={ 150 }
							max={ 800 }
						/>

						<RangeControl
							label={ __( 'Default Zoom' ) }
							value={ attributes.zoom }
							onChange={ ( value ) => {
								if ( value > 18 || value < 2 ) {
									return;
								}

								setAttributes( { zoom: value } );
							} }
							min={ 2 }
							max={ 18 }
						/>

						<p>Map Background</p>
						<ColorPalette
							colors={ colors }
							value={ attributes.mapContainerBackground }
							onChange={ ( value ) => {
								setAttributes( {
									mapContainerBackground: value,
								} );
							} }
						/>

						<h2>Custom Icon</h2>
						<p>.png file, no larger than 100px by 100px</p>
						<MediaUpload
							onSelect={ ( img ) => {
								if ( ! this.validateIcon( img ) ) {
									this.showIconError();
									return;
								}

								this.updateIcon( img );
							} }
							type="image"
							value={ attributes.customIconID }
							render={ ( { open } ) => (
								<Fragment>
									{
										this.state.iconError ?
											<Notice
												className="leaflet-notice"
												status="error"
												onRemove={ () => this.hideIconError() }
											>
												<p>Invalid Icon</p>
											</Notice> : ''
									}

									<Button
										onClick={ open }
										className="components-button is-button is-default is-large"
									>
										{
											attributes.customIconID ?
												<img
													src={ attributes.customIconURL }
													alt="Icon"
												/> :
												'upload'
										}
									</Button>

									{
										attributes.customIconID ?
											<Button
												onClick={ () => {
													this.removeIcon();
												} }
												title="remove icon"
											>
												<Dashicon icon="no" />
											</Button> : ''
									}
								</Fragment>
							) }
						>
						</MediaUpload>

					</PanelBody>
				</InspectorControls>

				<div>
					<p>{ this.props.attributes.address }</p>
					<div style={ styles } ref={ this.mapContainer }></div>
				</div>
			</Fragment>
		);
	}

	//
	// Did Mount
	//
	componentDidMount() {
		this.map = L.map( this.mapContainer.current )
			.setView( this.props.attributes.mapLatLng, this.props.attributes.zoom );

		const markerOptions = {};

		// Set up custom marker icon
		if ( this.props.attributes.customIconURL ) {
			markerOptions.icon = this.createCustomIcon(
				this.props.attributes.customIconURL,
				this.props.attributes.customIconWidth,
				this.props.attributes.customIconHeight,
			);
		}

		this.marker = L.marker(
			this.props.attributes.markerLatLng,
			markerOptions
		).addTo( this.map );

		// Set Tiles
		L.tileLayer(
			'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}',
			{
				attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
				maxZoom: 18,
				minZoom: 2,
				id: 'mapbox.streets',
				accessToken: this.mapboxApiKey,
			}
		).addTo( this.map );

		// Geocoder search box
		L.Control.geocoder( {
			defaultMarkGeocode: false,
		} )
			.on( 'markgeocode', e => {
				const latlng = [ e.geocode.center.lat, e.geocode.center.lng ];

				// Set new view for user
				this.map.flyTo( latlng );

				// Save location
				this.updateLocation( latlng, e.geocode.name );
			} )
			.addTo( this.map );

		// Click to set location
		this.map.on( 'click', e => {
			const latlng = [ e.latlng.lat, e.latlng.lng ];

			// Get address name from latlng
			L.Control.Geocoder.nominatim().reverse(
				e.latlng,
				18,
				( results ) => {
					// Update the location
					if ( ! results.hasOwnProperty( 0 ) ) {
						this.updateLocation( latlng, 'unknown' );
					} else {
						this.updateLocation( latlng, results[ 0 ].name );
					}
				}
			);
		} );
	}

	//
	// Did Update
	//
	componentDidUpdate( prevProps ) {
		// Marker will update when the attribute is updated
		this.marker.setLatLng( this.props.attributes.markerLatLng );

		// Preview zoom level if changed
		if ( prevProps.attributes.zoom !== this.props.attributes.zoom ) {
			this.map.setZoom( this.props.attributes.zoom );
		}

		// Update Icon
		if ( prevProps.attributes.customIconID !== this.props.attributes.customIconID ) {
			let newIcon;

			// Get the new icon if available
			// Otherwise get the original icon
			if ( this.props.attributes.customIconID ) {
				newIcon = this.createCustomIcon(
					this.props.attributes.customIconURL,
					this.props.attributes.customIconWidth,
					this.props.attributes.customIconHeight,
				);
			} else {
				const defaultIcon = Object.assign( {}, L.Icon.Default.prototype.options );
				const mapImages = pluginUrl + '/vendor/images/';

				defaultIcon.iconUrl = mapImages + defaultIcon.iconUrl;
				defaultIcon.iconRetinaUrl = mapImages + defaultIcon.iconRetinaUrl;
				defaultIcon.shadowUrl = mapImages + defaultIcon.shadowUrl;

				newIcon = L.icon( defaultIcon );
			}

			this.marker.setIcon( newIcon );
		}
	}
}
