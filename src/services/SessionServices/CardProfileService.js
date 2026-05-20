// src/services/CardProfilesService.js

import {
    fetchCardProfilesThunk,
} from "@/store/slices/plmnSlices/CardProfilesSlice.js";
import {fetchCardProfileDetailsThunk} from "@/store/slices/plmnSlices/CardProfileDetailsSlice.js";
import {fetchCardProfileDropDownThunk} from "@/store/slices/plmnSlices/CardProfileDropDownSlice.js";

/* FETCH CARD PROFILES */

export const fetchCardProfilesService = async (dispatch, networkId) => {
    return await dispatch(
        fetchCardProfilesThunk(networkId)
    );
};

export const fetchCardProfileDetailsService = async (dispatch, networkId, profileId) => {
    return await dispatch(
        fetchCardProfileDetailsThunk({networkId, profileId})
    );
};

export const fetchCardProfileDropDownService = async (dispatch, networkId) => {
    return await dispatch(
        fetchCardProfileDropDownThunk({networkId})
    );
};