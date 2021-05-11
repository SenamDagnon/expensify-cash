import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import ONYXKEYS from '../../../ONYXKEYS';
import styles from '../../../styles/styles';
import BigNumberPad from '../../../components/BigNumberPad';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../../components/withWindowDimensions';
import TextInputAutoWidth from '../../../components/TextInputAutoWidth';

const propTypes = {
    // Callback to inform parent modal of success
    onStepComplete: PropTypes.func.isRequired,

    // Currency selection will be implemented later
    // eslint-disable-next-line react/no-unused-prop-types
    currencySelected: PropTypes.func.isRequired,

    // User's currency preference
    selectedCurrency: PropTypes.string.isRequired,

    // Previously selected amount to show if the user comes back to this screen
    selectedAmount: PropTypes.string.isRequired,

    /* Window Dimensions Props */
    ...windowDimensionsPropTypes,

    /* Onyx Props */

    // Holds data related to IOU view state, rather than the underlying IOU data.
    iou: PropTypes.shape({

        // Whether or not the IOU step is loading (retrieving users preferred currency)
        loading: PropTypes.bool,
    }),
};

const defaultProps = {
    iou: {},
};
class IOUAmountPage extends React.Component {
    constructor(props) {
        super(props);

        this.updateAmountIfValidInput = this.updateAmountIfValidInput.bind(this);
        this.state = {
            amount: props.selectedAmount || '',
        };
    }

    componentDidMount() {
        this.setupEventHandlers();
    }

    componentDidUpdate(prevProps) {
        // Component mounts before iou is finished loading, input focus doesn't work unless iou is loaded
        if (this.textInput && prevProps.iou.loading !== this.props.iou.loading) {
            this.textInput.focus();
        }
    }

    componentWillUnmount() {
        this.cleanupEventHandlers();
    }

    /**
     * Setup and attach keypress handler for navigating to the next screen
     */
    setupEventHandlers() {
        if (document) {
            this.keyDownHandler = (keyBoardEvent) => {
                // Proceeds to the next screen if the amount isn't empty
                if (keyBoardEvent.key === 'Enter' && this.state.amount !== '') {
                    this.props.onStepComplete(this.state.amount);
                }
            };
            document.addEventListener('keydown', this.keyDownHandler);
        }
    }

    /**
     * Cleanup all keydown event listeners that we've set up
     */
    cleanupEventHandlers() {
        if (document) {
            document.removeEventListener('keydown', this.keyDownHandler);
        }
    }

    /**
     * Update amount with number or Backspace pressed.
     * Validate new amount with decimal number regex up to 6 digits and 2 decimal digit to enable Next button
     *
     * @param {String} key
     */
    updateAmountIfValidInput(key) {
        // Backspace button is pressed
        if (key === '<' || key === 'Backspace') {
            if (this.state.amount.length > 0) {
                this.setState(prevState => ({
                    amount: prevState.amount.substring(0, prevState.amount.length - 1),
                }));
            }
            return;
        }

        this.setState((prevState) => {
            const newValue = `${prevState.amount}${key}`;

            // Regex to validate decimal number with up to 3 decimal numbers
            const decimalNumberRegex = new RegExp(/^\d+(\.\d{0,3})?$/, 'i');
            if (!decimalNumberRegex.test(newValue)) {
                return prevState;
            }
            return {
                amount: newValue,
            };
        });
    }

    render() {
        return (
            <View style={[styles.flex1, styles.pageWrapper]}>
                <View style={[
                    styles.flex1,
                    styles.flexRow,
                    styles.w100,
                    styles.alignItemsCenter,
                    styles.justifyContentCenter,
                ]}
                >
                    <Text style={styles.iouAmountText}>
                        {this.props.selectedCurrency}
                    </Text>
                    {this.props.isSmallScreenWidth
                        ? <Text style={styles.iouAmountText}>{this.state.amount}</Text>
                        : (
                            <TextInputAutoWidth
                                    inputStyle={styles.iouAmountTextInput}
                                    textStyle={styles.iouAmountText}
                                    onKeyPress={(event) => {
                                        this.updateAmountIfValidInput(event.key);
                                        event.preventDefault();
                                    }}
                                    ref={el => this.textInput = el}
                                    value={this.state.amount}
                            />
                        )}
                </View>
                <View style={[styles.w100, styles.justifyContentEnd]}>
                    {this.props.isSmallScreenWidth
                        ? <BigNumberPad numberPressed={this.updateAmountIfValidInput} />
                        : <View />}
                    <TouchableOpacity
                            style={[styles.button, styles.w100, styles.mt5, styles.buttonSuccess,
                                this.state.amount.length === 0 ? styles.buttonSuccessDisabled : {}]}
                            onPress={() => this.props.onStepComplete(this.state.amount)}
                            disabled={this.state.amount.length === 0}
                    >
                        <Text style={[styles.buttonText, styles.buttonSuccessText]}>
                            Next
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}
IOUAmountPage.displayName = 'IOUAmountPage';
IOUAmountPage.propTypes = propTypes;
IOUAmountPage.defaultProps = defaultProps;

export default withWindowDimensions(withOnyx({
    iou: {key: ONYXKEYS.IOU},
})(IOUAmountPage));
