import _ from 'underscore';
import React, {forwardRef, Component} from 'react';
import {View, SectionList, Text} from 'react-native';
import PropTypes from 'prop-types';
import styles from '../styles/styles';
import OptionRow from '../pages/home/sidebar/OptionRow';
import optionPropTypes from './optionPropTypes';

const propTypes = {
    // Extra styles for the section list container
    contentContainerStyles: PropTypes.arrayOf(PropTypes.object),

    // Sections for the section list
    sections: PropTypes.arrayOf(PropTypes.shape({
        // Title of the section
        title: PropTypes.string,

        // The initial index of this section given the total number of options in each section's data array
        indexOffset: PropTypes.number,

        // Array of options
        data: PropTypes.arrayOf(optionPropTypes),

        // Whether this section should show or not
        shouldShow: PropTypes.bool,
    })),

    // Index for option to focus on
    focusedIndex: PropTypes.number,

    // Array of already selected options
    selectedOptions: PropTypes.arrayOf(optionPropTypes),

    // Whether we can select multiple options or not
    canSelectMultipleOptions: PropTypes.bool,

    // Whether to show headers above each section or not
    hideSectionHeaders: PropTypes.bool,

    // Whether to allow option focus or not
    disableFocusOptions: PropTypes.bool,

    // A flag to indicate wheter to show additional optional states, such as pin icon or different read/unread styles
    hideAdditionalOptionStates: PropTypes.bool,

    // Callback to fire when a row is selected
    onSelectRow: PropTypes.func,

    // Optional header title
    headerTitle: PropTypes.string,

    // Optional header message
    headerMessage: PropTypes.string,

    // Passed via forwardRef so we can access the SectionList ref
    innerRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.instanceOf(SectionList)}),
    ]),
};

const defaultProps = {
    contentContainerStyles: [],
    sections: [],
    focusedIndex: 0,
    selectedOptions: [],
    canSelectMultipleOptions: false,
    hideSectionHeaders: false,
    disableFocusOptions: false,
    hideAdditionalOptionStates: false,
    onSelectRow: () => {},
    headerMessage: '',
    headerTitle: '',
    innerRef: null,
};

class OptionsList extends Component {
    constructor(props) {
        super(props);

        this.renderSectionHeader = this.renderSectionHeader.bind(this);
        this.renderItem = this.renderItem.bind(this);
        this.extractKey = this.extractKey.bind(this);
        this.onScrollToIndexFailed = this.onScrollToIndexFailed.bind(this);
    }

    shouldComponentUpdate(nextProps) {
        if (nextProps.focusedIndex !== this.props.focusedIndex) {
            return true;
        }

        if (nextProps.selectedOptions.length !== this.props.selectedOptions.length) {
            return true;
        }

        if (nextProps.headerTitle !== this.props.headerTitle) {
            return true;
        }

        if (nextProps.headerMessage !== this.props.headerMessage) {
            return true;
        }

        if (!_.isEqual(nextProps.sections, this.props.sections)) {
            return true;
        }

        return false;
    }

    onScrollToIndexFailed(error) {
        console.debug(error);
    }

    extractKey(option) {
        return option.keyForList;
    }

    renderSectionHeader({section: {title, shouldShow}}) {
        if (title && shouldShow && !this.props.hideSectionHeaders) {
            return (
                <View>
                    <Text style={[styles.p5, styles.textMicroBold, styles.colorHeading]}>
                        {title}
                    </Text>
                </View>
            );
        }

        return <View />;
    }

    renderItem({item, index, section}) {
        return (
            <OptionRow
                option={item}
                optionIsFocused={
                    !this.props.disableFocusOptions
                        && this.props.focusedIndex === (index + section.indexOffset)
                }
                onSelectRow={this.props.onSelectRow}
                isSelected={Boolean(_.find(this.props.selectedOptions, option => option.login === item.login))}
                showSelectedState={this.props.canSelectMultipleOptions}
                hideAdditionalOptionStates={this.props.hideAdditionalOptionStates}
            />
        );
    }

    render() {
        return (
            <View style={[styles.flex1]}>
                {this.props.headerMessage ? (
                    <View style={[styles.ph5, styles.pb5]}>
                        {this.props.headerTitle ? (
                            <Text style={[styles.h4, styles.mb1]}>
                                {this.props.headerTitle}
                            </Text>
                        ) : null}

                        <Text style={[styles.textLabel, styles.colorMuted]}>
                            {this.props.headerMessage}
                        </Text>
                    </View>
                ) : null}
                <SectionList
                    ref={this.props.innerRef}
                    bounces={false}
                    indicatorStyle="white"
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={[...this.props.contentContainerStyles]}
                    showsVerticalScrollIndicator={false}
                    sections={this.props.sections}
                    keyExtractor={this.extractKey}
                    initialNumToRender={500}
                    onScrollToIndexFailed={this.onScrollToIndexFailed}
                    stickySectionHeadersEnabled={false}
                    renderItem={this.renderItem}
                    renderSectionHeader={this.renderSectionHeader}
                    extraData={this.props.focusedIndex}
                />
            </View>
        );
    }
}

OptionsList.displayName = 'OptionsList';
OptionsList.propTypes = propTypes;
OptionsList.defaultProps = defaultProps;

export default forwardRef((props, ref) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <OptionsList {...props} innerRef={ref} />
));
