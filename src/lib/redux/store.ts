import { configureStore } from '@reduxjs/toolkit'
import companySlice from './slices/companySlice'
import authSlice from './slices/authSlice'
import { paymentApi } from '@/services/paymentService'

export const store = configureStore({
  reducer: {
    company: companySlice,
    auth: authSlice,
    [paymentApi.reducerPath]: paymentApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(paymentApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch