import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import {
  productsReducer,
  productDetailsReducer,
} from './reducers/productReducers'
import {
  authReducers,
  userReducer,
  forgotPasswordReducer,
} from './reducers/authReducers'
import { cartReducer } from './reducers/cartReducers'

const reducer = combineReducers({
  products: productsReducer,
  productDetails: productDetailsReducer,
  auth: authReducers,
  user: userReducer,
  forgotPassword: forgotPasswordReducer,
  cart: cartReducer,
})

let initialState = {
  cart: {
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
  },
}

const middleware = [thunk]
const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
)

export default store
