import { createStore, combineReducers, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import { composeWithDevTools } from 'redux-devtools-extension'

import {
  productsReducer,
  productDetailsReducer,
  newReviewReducer,
} from './reducers/productReducers'
import {
  authReducers,
  userReducer,
  forgotPasswordReducer,
} from './reducers/authReducers'
import { cartReducer } from './reducers/cartReducers'
import {
  newOrderReducer,
  myOrderReducer,
  orderDetailsReducer,
} from './reducers/orderReducers'

const reducer = combineReducers({
  products: productsReducer,
  productDetails: productDetailsReducer,
  auth: authReducers,
  user: userReducer,
  forgotPassword: forgotPasswordReducer,
  cart: cartReducer,
  order: newOrderReducer,
  myOrders: myOrderReducer,
  orderDetails: orderDetailsReducer,
  newReview: newReviewReducer,
})

let initialState = {
  cart: {
    cartItems: localStorage.getItem('cartItems')
      ? JSON.parse(localStorage.getItem('cartItems'))
      : [],
    shippingInfo: localStorage.getItem('shippingInfo')
      ? JSON.parse(localStorage.getItem('shippingInfo'))
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
