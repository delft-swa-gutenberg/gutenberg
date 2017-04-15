/**
 * External dependencies
 */
import { connect } from 'react-redux';
import { reduce } from 'lodash';

/**
 * Internal dependencies
 */
import './style.scss';
import IconButton from 'components/icon-button';

class BlockSwitcher extends wp.element.Component {
	constructor() {
		super( ...arguments );
		this.toggleMenu = this.toggleMenu.bind( this );
		this.state = {
			open: false
		};
	}

	toggleMenu() {
		this.setState( {
			open: ! this.state.open
		} );
	}

	switchBlockType( blockType ) {
		return () => {
			this.setState( {
				open: false
			} );
			this.props.onTransform( this.props.block, blockType );
		};
	}

	render() {
		const blockSettings = wp.blocks.getBlockSettings( this.props.block.blockType );
		const allowedBlocks = reduce( wp.blocks.getBlocks(), ( memo, block ) => {
			const transformation = block.transformations &&
				block.transformations.find( t => t.blocks.indexOf( this.props.block.blockType ) !== -1 );
			return transformation ? memo.concat( [ block ] ) : memo;
		}, [] );
		if ( ! allowedBlocks.length ) {
			return null;
		}

		return (
			<div className="editor-block-switcher">
				<IconButton
					className="editor-block-switcher__toggle"
					icon={ blockSettings.icon }
					onClick={ this.toggleMenu }
				>
					<div className="editor-block-switcher__arrow" />
				</IconButton>
				{ this.state.open &&
					<div className="editor-block-switcher__menu">
						<div className="editor-block-switcher__menu-arrow" />
						{ allowedBlocks.map( ( { slug, title, icon } ) => (
							<IconButton
								key={ slug }
								onClick={ this.switchBlockType( slug ) }
								className="editor-block-switcher__menu-item"
								icon={ icon }
							>
								{ title }
							</IconButton>
						) ) }
					</div>
				}
			</div>
		);
	}
}

export default connect(
	( state, ownProps ) => ( {
		block: state.blocks.byUid[ ownProps.uid ]
	} ),
	( dispatch, ownProps ) => ( {
		onTransform( block, blockType ) {
			dispatch( {
				type: 'SWITCH_BLOCK_TYPE',
				uid: ownProps.uid,
				block: wp.blocks.switchToBlockType( block, blockType )
			} );
		}
	} )
)( BlockSwitcher );
