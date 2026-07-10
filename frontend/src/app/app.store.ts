import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../feature/auth/state/auth.slice'
import { baseApi } from '../shared/state/baseApi'
import { rtkQueryErrorMiddleware } from '../shared/state/rtkQueryErrorMiddleware'
import '../feature/auth/api/auth.api'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware, rtkQueryErrorMiddleware),
  devTools: true,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
