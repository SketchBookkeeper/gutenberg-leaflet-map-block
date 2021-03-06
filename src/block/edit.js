/**
 * Edit
 */
const { __ } = wp.i18n;

const {
	InspectorControls,
	MediaUpload,
} = wp.editor;

const {
	Component,
	Fragment,
} = wp.element;

const {
	Button,
	ColorPalette,
	Dashicon,
	Notice,
	PanelBody,
	RangeControl,
	SelectControl,
	TextareaControl,
	ToggleControl,
	Spinner,
} = wp.components;

// Path to plugin assets
const pluginUrl = window.gutenberg_leaflet_map_block.plugin_url;

// Array of Mapbox styles
// @see https://www.mapbox.com/api-documentation/#styles
import { mapStyles } from './map-styles';

// Mapbox
import 'mapbox.js';
import 'mapbox.js/theme/style.css';
import 'mapbox.js/theme/images/icons.svg';

// Geocoder
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder/dist/images/geocoder.png';
import 'leaflet-control-geocoder/dist/images/throbber.gif';
import 'leaflet-control-geocoder';

// Setup default icon
// Copy the default Icon Class' Icon Object
const defaultIcon = Object.assign( {}, L.Icon.Default.prototype.options );
const mapImages = pluginUrl + '/vendor/images/';

// Point default Object to assets
defaultIcon.iconUrl = mapImages + defaultIcon.iconUrl;
defaultIcon.iconRetinaUrl = mapImages + defaultIcon.iconRetinaUrl;
defaultIcon.shadowUrl = mapImages + defaultIcon.shadowUrl;

/**
 * MapContainer
 * Dynamically render inner components based on API key validation.
 */
export class MapContainer extends Component {
	constructor( props ) {
		super( props );

		props.apiKeyWarning = false;

		this.state = {
			component: MapLoader,
		};

		// Get API Key
		if ( window.gutenberg_leaflet_map_block.mapbox_api_key ) {
			this.mapboxApiKey = window.gutenberg_leaflet_map_block.mapbox_api_key;
		} else {
			props.apiKeyWarning = true;
			this.mapboxApiKey = process.env.MAPBOXAPIKEY;
		}

		// Check if the mapbox api key is valid before continuing.
		// Otherwise we'll show an error to the user
		checkMapboxApiKey( this.mapboxApiKey )
			.then( response => {
				if ( response.code === 'TokenValid' ) {
					this.props.mapboxApiKey = this.mapboxApiKey;
					this.setState( { component: MapBlock } );
				} else {
					this.props.code = response.code;
					this.setState( { component: MapNotice } );
				}
			} );
	}

	render() {
		return React.createElement( this.state.component, Object.assign( {}, this.props ) );
	}
}

/**
 * MapLoader
 */
export class MapLoader extends Component {
	render() {
		return (
			<p className="glm-flex glm-align-center glm-gray">
				<Spinner />
				{ __( 'Loading Map' ) }
			</p>
		);
	}
}

/**
 * MapNotice
 * Something is wrong with the provided API Key,
 * show a notice rather than the map.
 */
export class MapNotice extends Component {
	render() {
		return (
			<Notice
				className="glm-notice"
				status="warning"
				isDismissible={ false }
			>
				<p>{ __( 'Leaflet Map' ) }</p>
				<p>{ __( 'Opps, something went wrong. Check your Mapbox access token in general settings' ) }</p>
				<code>{ this.props.code }</code>
			</Notice>
		);
	}
}

/**
 * MapBlock
 */
export class MapBlock extends Component {
	constructor( props ) {
		super( props );

		this.state = {
			iconError: false,
			apiKeyWarning: false,
		};

		this.mapContainer = React.createRef();
		this.mapboxApiKey = props.mapboxApiKey;

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

	updateMapStyle( style ) {
		this.props.setAttributes( {
			mapStyle: style,
		} );
	}

	toggleShowControls() {
		this.props.setAttributes( {
			showControls: ! this.props.attributes.showControls,
		} );
	}

	toggleShowPopup() {
		this.props.setAttributes( {
			showPopup: ! this.props.attributes.showPopup,
		} );
	}

	updatePopupContent( content ) {
		this.props.setAttributes( {
			popupContent: content,
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
			customIconID: 0,
			customIconURL: false,
			customIconWidth: false,
			customIconHeight: false,
		} );
	}

	// Validate the icon in formatted correctly
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
						<p>{ __( 'Set the marker\'s location by clicking on the map or use the magnifying glass to find a location.' ) }</p>

						<h2 className="glm-flex glm-align-center"><Dashicon icon="location-alt" /> { __( 'Marker\'s Location' ) }</h2>

						<p>{ this.props.attributes.address }</p>

						<h2 className="glm-flex glm-align-center"><Dashicon icon="admin-appearance" /> { __( 'Appearance' ) }</h2>

						<SelectControl
							label="Map Theme"
							value={ attributes.mapStyle }
							options={ mapStyles }
							onChange={ ( style ) => {
								this.updateMapStyle( style );
							} }
						/>

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

						<ToggleControl
							label="Zoom Controls"
							help={ attributes.showControls ? 'Show Controls on frontend' : 'Hide Controls on frontend' }
							checked={ attributes.showControls }
							onChange={ () => {
								this.toggleShowControls();
							} }
						/>

						<p>{ __( 'Map Container Background' ) }</p>
						<ColorPalette
							colors={ colors }
							value={ attributes.mapContainerBackground }
							onChange={ ( value ) => {
								setAttributes( {
									mapContainerBackground: value,
								} );
							} }
						/>

						<h2 className="glm-flex glm-align-center"><Dashicon icon="location" /> { __( 'Marker Icon' ) }</h2>
						<p>{ __( '.png file, no larger than 100px by 100px' ) }</p>
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
												className="glm-notice"
												status="error"
												onRemove={ () => this.hideIconError() }
											>
												<p>Invalid Icon</p>
											</Notice> : ''
									}

									<Button
										onClick={ open }
										className="components-button is-button is-default is-large glm-upload-button"
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

						<p>{ __( 'By default, a popup with the address will appear when the marker is clicked.' ) }</p>
						<ToggleControl
							label="Show Popup"
							checked={ attributes.showPopup }
							onChange={ () => {
								this.toggleShowPopup();
							} }
						/>

						{ attributes.showPopup ?
							<TextareaControl
								label="Popup Text"
								value={ attributes.popupContent }
								placeholder={ attributes.address }
								onChange={ ( text ) => this.updatePopupContent( text ) }
							/> : ''
						}

					</PanelBody>
				</InspectorControls>

				<div className={ attributes.showControls ? 'glm-show-controls' : 'glm-hide-controls' }>
					<div style={ styles } ref={ this.mapContainer }></div>
				</div>
			</Fragment>
		);
	}

	//
	// Did Mount
	//
	componentDidMount() {
		// Set Mapbox access token
		L.mapbox.accessToken = this.mapboxApiKey;

		// Setup map
		this.map = L.mapbox.map( this.mapContainer.current );
		this.map.setView( this.props.attributes.mapLatLng, this.props.attributes.zoom );
		this.map.setMinZoom( 2 );
		this.mapStyleLayer = L.mapbox.styleLayer( this.props.attributes.mapStyle ).addTo( this.map );

		const markerOptions = {};

		// Set up custom marker icon or default
		if ( this.props.attributes.customIconID !== 0 ) {
			markerOptions.icon = this.createCustomIcon(
				this.props.attributes.customIconURL,
				this.props.attributes.customIconWidth,
				this.props.attributes.customIconHeight,
			);
		} else {
			markerOptions.icon = L.icon( defaultIcon );
		}

		// Add Marker
		this.marker = L.marker(
			this.props.attributes.markerLatLng,
			markerOptions
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
			if ( ! e.hasOwnProperty( 'latlng' ) ) {
				return;
			}

			const latlng = [ e.latlng.lat, e.latlng.lng ];

			// Get address name from latlng
			// Reverse lookup
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
				newIcon = L.icon( defaultIcon );
			}

			this.marker.setIcon( newIcon );
		}

		// Update Styles
		if ( prevProps.attributes.mapStyle !== this.props.attributes.mapStyle ) {
			this.mapStyleLayer.remove();

			this.mapStyleLayer = L.mapbox.styleLayer( this.props.attributes.mapStyle ).addTo( this.map );
		}
	}
}

/**
 * checkMapboxApiKey
 * Check provided api key against the Mapbox Api.
 *
 * @param {string } apiKey Mapbox api key/access token.
 * @returns {object} Mapbox response.
 */
function checkMapboxApiKey( apiKey ) {
	return new Promise( ( resolve, reject ) => {
		$.get(
			`https://api.mapbox.com/tokens/v2?access_token=${ apiKey }`,
			( response ) => {
				resolve( response );
			}
		);
	} );
}
