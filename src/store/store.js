import { configureStore } from "@reduxjs/toolkit";

import {
    persistReducer,
    persistStore,
} from "redux-persist";

// SESSION STORAGE
import storageSession from "redux-persist/lib/storage/session";

import rootReducer from "./rootReducer";

const persistConfig = {
    key: "root",

    // SESSION STORAGE
    storage: storageSession,

    whitelist: ["auth"],
};

const persistedReducer = persistReducer(
    persistConfig,
    rootReducer
);

const store = configureStore({

    reducer: persistedReducer,

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({

            serializableCheck: {

                ignoredActions: [
                    "persist/PERSIST",
                    "persist/REHYDRATE",
                    "persist/PAUSE",
                    "persist/FLUSH",
                    "persist/PURGE",
                    "persist/REGISTER",
                ],
            },
        }),
});

export const persistor =
    persistStore(store);

export default store;