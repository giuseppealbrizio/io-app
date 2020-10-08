import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { GlobalState } from "../../../../../../store/reducers/types";
import {
  isError,
  isLoading,
  isReady
} from "../../../../../bonus/bpd/model/RemoteValue";
import { onboardingBancomatFoundPansSelector } from "../../store/reducers/pans";
import TMPUserAddBancomatToWallet from "../TMPUserAddBancomatToWallet";
import BancomatKoNotFound from "./BancomatKoNotFound";
import BancomatKoTimeout from "./BancomatKoTimeout";
import LoadBancomatSearch from "./LoadBancomatSearch";

export type Props = ReturnType<typeof mapDispatchToProps> &
  ReturnType<typeof mapStateToProps>;

/**
 * This screen handle the errors and loading for the user bancomat.
 * @constructor
 */
const SearchBancomatScreen: React.FunctionComponent<Props> = props => {
  const pans = props.pans;

  const noBancomatFound =
    (isError(pans) && pans.error.kind === "notFound") ||
    (isReady(pans) && pans.value.length === 0);

  if (noBancomatFound) {
    return <BancomatKoNotFound />;
  }
  if (isError(pans) && pans.error.kind === "timeout") {
    return <BancomatKoTimeout />;
  }
  if (isLoading(pans) || isError(pans)) {
    return <LoadBancomatSearch />;
  }
  // success! The user can now optionally add found bancomat to the wallet
  return <TMPUserAddBancomatToWallet />;
};

const mapDispatchToProps = (_: Dispatch) => ({});

const mapStateToProps = (state: GlobalState) => ({
  pans: onboardingBancomatFoundPansSelector(state)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchBancomatScreen);
