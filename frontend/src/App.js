import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import axios from 'axios'

import './App.css'
import Header from './components/layouts/Header'
import Footer from './components/layouts/Footer'
import Home from './components/Home'
import ProductDetails from './components/product/ProductDetails'

import Cart from './components/cart/Cart'
import Shipping from './components/cart/Shipping'
import ConfirmOrder from './components/cart/ConfirmOrder'
import Payment from './components/cart/Payment'
import OrderSuccess from './components/cart/OrderSuccess'
import ListOrders from './components/order/ListOrders'
import OrderDetails from './components/order/OrderDetails'

import Login from './components/user/Login'
import Register from './components/user/Register'
import { loadUser } from './actions/userActions'
import store from './store'
import Profile from './components/user/Profile'
import UpdateProfile from './components/user/UpdateProfile'
import UpdatePassword from './components/user/UpdatePassword'
import ForgotPassword from './components/user/ForgotPassword'
import NewPassword from './components/user/NewPassword'
import ProtectedRoute from './components/route/ProtectedRoute'

//payment
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

function App() {
  const [stripeApiKey, setStripeApiKey] = useState('')

  useEffect(() => {
    store.dispatch(loadUser())

    async function getStripeApiKey() {
      const { data } = await axios.get('/api/v1/stripeapi')
      setStripeApiKey(data.stripeApiKey)
    }

    getStripeApiKey()
  }, [])

  console.log(stripeApiKey)
  return (
    <Router>
      <div className="App">
        <Header />
        <div className="container container-fluid">
          <Route path="/" component={Home} exact />
          <Route path="/search/:keyword" component={Home} />
          <Route path="/product/:id" component={ProductDetails} exact />

          <Route path="/cart" component={Cart} />
          <ProtectedRoute path="/shipping" component={Shipping} />
          <ProtectedRoute path="/confirm" component={ConfirmOrder} />
          <ProtectedRoute path="/success" component={OrderSuccess} />
          {stripeApiKey && (
            <Elements stripe={loadStripe(stripeApiKey)}>
              <ProtectedRoute path="/payment" component={Payment} />
            </Elements>
          )}

          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/password/forgot" component={ForgotPassword} />
          <Route path="/password/reset/:token" component={NewPassword} />
          <ProtectedRoute path="/me" component={Profile} exact />
          <ProtectedRoute path="/me/update" component={UpdateProfile} />
          <ProtectedRoute path="/orders/me" component={ListOrders} />
          <ProtectedRoute path="/order/:id" component={OrderDetails} />
          <ProtectedRoute
            path="/me/password/update"
            component={UpdatePassword}
          />
        </div>
        <Footer />
      </div>
    </Router>
  )
}

export default App
