import * as redux from 'redux';
import thunk from 'redux-thunk';

import {navReducer, invoiceReducer, scrollReducer} from './reducers';

export const store = (initialState = {}) => {
  let reducer = redux.combineReducers({
    nav: navReducer,
    invoice: invoiceReducer,
    scrollPosition: scrollReducer
  });

  let createStore = redux.createStore(reducer, initialState, redux.compose(
    redux.applyMiddleware(thunk),
    window.devToolsExtension ? window.devToolsExtension() : f => f
  ));

  return createStore;
};

export default store();