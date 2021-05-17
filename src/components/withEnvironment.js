import React, {Component} from 'react';
import PropTypes from 'prop-types';
import getComponentDisplayName from '../libs/getComponentDisplayName';
import Environment from '../libs/Environment';
import CONST from '../CONST';

const environmentPropTypes = {
    /** The string value representing the current environment */
    environment: PropTypes.string.isRequired,
};

export default function (WrappedComponent) {
    class WithEnvironment extends Component {
        constructor(props) {
            super(props);

            this.state = {
                environment: CONST.ENVIRONMENT.PRODUCTION,
            };
        }

        componentDidMount() {
            Environment.getEnvironment()
                .then((environment) => {
                    this.setState({environment});
                });
        }

        render() {
            return (
                <WrappedComponent
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...this.props}
                    environment={this.state.environment}
                />
            );
        }
    }

    WithEnvironment.displayName = `withEnvironment(${getComponentDisplayName(WrappedComponent)})`;
    return WithEnvironment;
}

export {
    environmentPropTypes,
};
