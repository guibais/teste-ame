import { actions as searchActions } from "./SearchContacts";
import { actions as contactDetailsActions } from "./ContactDetails";

export const updateSearchPhrase = newPhrase =>
  async (dispatch, getState, { httpApi, debounce }) => {
    const dispatchUpdate = debounce(
      httpApi.getFirst5MatchingContacts,
    300,
    );
    dispatch(
      searchActions.updateSearchPhraseStart({ newPhrase }),
    )
    dispatchUpdate({ namePart: newPhrase })
      .then(({ data }) => {
        const matchingContacts = data.map(contact => ({
          id: contact.id,
          value: contact.name,
        }));
        // FIXEDTODO something is wrong here
        dispatch(
          searchActions.updateSearchPhraseSuccess({ matchingContacts }),
        );
      })
      .catch(() => {
        // FIXEDTODO something is missing here
        dispatch(
          searchActions.updateSearchPhraseFailure({ newPhrase }),
        );
      });

    
  };

export const selectMatchingContact = selectedMatchingContact =>
  (dispatch, getState, { httpApi, dataCache, }) => {

    // FIXEDTODO something is missing here
    const getContactDetails = ({ id }) => {
      const cachedContact = dataCache.load({ key: selectedMatchingContact.id })
      if(cachedContact) {
        return Promise.resolve(cachedContact);
      }
      return httpApi
          .getContact({ contactId: id })
          .then(({ data }) => {
            return {
            id: data.id,
            name: data.name,
            phone: data.phone,
            addressLines: data.addressLines,
          }
          });
    };

    dispatch(
      searchActions.selectMatchingContact({ selectedMatchingContact }),
    );
    dispatch(
      contactDetailsActions.fetchContactDetailsStart(),
    );


    getContactDetails({ id: selectedMatchingContact.id })
      .then((contactDetails) => {
        // FIXEDTODO something is missing here
        dataCache.store({
          key: contactDetails.id,
          value: contactDetails

        });
        // FIXEDTODO something is wrong here
        dispatch(
          contactDetailsActions.fetchContactDetailsSuccess({contactDetails: dataCache.load({ key: contactDetails.id })}),
        );
      })
      .catch(() => {
        dispatch(
          contactDetailsActions.fetchContactDetailsFailure(),
        );
      });
  };
