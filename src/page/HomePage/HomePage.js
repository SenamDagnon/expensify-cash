import React from 'react';
import {
    SafeAreaView,
    StatusBar,
    View,
} from 'react-native';
import {Route} from '../../lib/Router';
import styles from '../../style/StyleSheet';
import Header from './HeaderView';
import Sidebar from './SidebarView';
import Main from './MainView';
import Ion from '../../lib/Ion';
import IONKEYS from '../../IONKEYS';
import {initPusher} from '../../lib/actions/ActionsReport';
import * as pusher from '../../lib/Pusher/pusher';

export default class App extends React.Component {
    componentDidMount() {
        Ion.get(IONKEYS.SESSION, 'authToken').then((authToken) => {
            if (authToken) {
                // Initialize the pusher connection
                pusher.init(null, {
                    authToken,
                });

                // Setup the report action handler to subscribe to pusher
                initPusher();
            }
        });
    }

    render() {
        return (
            <>
                <StatusBar barStyle="dark-content" />
                <SafeAreaView style={[styles.flex1, styles.h100p]}>
                    <View style={[styles.appContentWrapper, styles.flexRow, styles.h100p]}>
                        <Route path="/:reportID?">
                            <View style={{width: 300}}>
                                <Sidebar />
                            </View>
                            <View style={[styles.appContent, styles.flex1, styles.flexColumn]}>
                                <Header />
                                <Main />
                            </View>
                        </Route>
                    </View>
                </SafeAreaView>
            </>
        );
    }
}
App.displayName = 'App';
