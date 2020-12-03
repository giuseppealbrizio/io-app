/**
 * A screen to invite the user to update the app because current version is not supported yet
 *
 */

import { Millisecond } from "italia-ts-commons/lib/units";
import { Button, Container, H2, Text, View } from "native-base";
import * as React from "react";
import {
  BackHandler,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import BaseScreenComponent from "../../components/screens/BaseScreenComponent";
import FooterWithButtons from "../../components/ui/FooterWithButtons";
import I18n from "../../i18n";
import customVariables from "../../theme/variables";
import { storeUrl, webStoreURL } from "../../utils/appVersion";

const timeoutErrorMsg: Millisecond = 5000 as Millisecond;

const styles = StyleSheet.create({
  text: {
    marginTop: customVariables.contentPadding,
    fontSize: 18
  },
  textDanger: {
    marginTop: customVariables.contentPadding,
    fontSize: 18,
    textAlign: "center",
    color: customVariables.brandDanger
  },
  container: {
    margin: customVariables.contentPadding,
    flex: 1,
    alignItems: "flex-start"
  },
  img: {
    marginTop: customVariables.contentPaddingLarge,
    alignSelf: "center"
  }
});

type State = { hasError: boolean };

class UpdateAppModal extends React.PureComponent<never, State> {
  constructor(props: never) {
    super(props);
    this.state = {
      hasError: false
    };
  }
  private idTimeout?: number;
  // No Event on back button android
  private handleBackPress = () => true;

  public componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
  }

  public componentWillUnmount() {
    if (this.idTimeout) {
      clearTimeout(this.idTimeout);
    }
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
  }

  private setError = () =>
    new Promise(resolve => {
      this.setState(
        {
          hasError: true
        },
        resolve
      );
    });

  private openAppStore = () => {
    if (this.state.hasError) {
      return;
    }

    // Play/App store native URL
    Linking.openURL(storeUrl)
      // Try to fallback to the web URL
      .catch(() => Linking.openURL(webStoreURL))
      // No URL could be opened, show an error message
      .catch(() => this.setError())
      // Hide the error after 5 seconds
      .then(() => {
        this.idTimeout = setTimeout(
          () =>
            this.setState({
              hasError: false
            }),
          timeoutErrorMsg
        );
      });
  };

  /**
   * Footer iOS button
   */
  private renderIosFooter() {
    return (
      <View footer={true}>
        <React.Fragment>
          <Button block={true} primary={true} onPress={this.openAppStore}>
            <Text>{I18n.t("btnUpdateApp")}</Text>
          </Button>
          <View spacer={true} />
        </React.Fragment>
      </View>
    );
  }

  /**
   * Footer Android buttons
   */
  private renderAndroidFooter() {
    const cancelButtonProps = {
      cancel: true,
      block: true,
      onPress: () => BackHandler.exitApp(),
      title: I18n.t("global.buttons.close")
    };
    const updateButtonProps = {
      block: true,
      primary: true,
      onPress: this.openAppStore,
      title: I18n.t("btnUpdateApp")
    };

    return (
      <FooterWithButtons
        type="TwoButtonsInlineThird"
        leftButton={cancelButtonProps}
        rightButton={updateButtonProps}
      />
    );
  }

  // Different footer according to OS
  get footer() {
    return Platform.select({
      ios: this.renderIosFooter(),
      android: this.renderAndroidFooter()
    });
  }

  public render() {
    // Current version not supported
    return (
      <Modal>
        <BaseScreenComponent
          appLogo={true}
          goBack={false}
          accessibilityEvents={{ avoidNavigationEventsUsage: true }}
        >
          <Container>
            <View style={styles.container}>
              <H2>{I18n.t("titleUpdateApp")}</H2>
              <Text style={styles.text}>{I18n.t("messageUpdateApp")}</Text>
              <Image
                style={styles.img}
                source={require("../../../img/icons/update-icon.png")}
              />
              {this.state.hasError && (
                <Text style={styles.textDanger}>
                  {I18n.t("msgErrorUpdateApp")}
                </Text>
              )}
            </View>
          </Container>
        </BaseScreenComponent>
        {this.footer}
      </Modal>
    );
  }
}

export default connect()(UpdateAppModal);
