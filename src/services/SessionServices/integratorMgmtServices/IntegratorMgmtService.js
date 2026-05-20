import {
    fetchIntegratorsThunk,
    createIntegratorThunk,
    modifyIntegratorThunk,
    fetchBusinessTypesThunk,
    fetchBanksThunk,
} from "@/store/slices/plmnSlices/integratorMgmtSlice";

import { fetchIntegratorDetailsThunk } from "@/store/slices/plmnSlices/integratorDetailsSlice";

/* =========================================
   FETCH ALL INTEGRATORS
========================================= */

export const fetchIntegratorsService = async (dispatch, networkId) => {
    return await dispatch(
        fetchIntegratorsThunk(networkId)
    );
};

/* =========================================
   FETCH INTEGRATOR DETAILS
========================================= */

export const fetchIntegratorDetailsService = async (dispatch, officeCode) => {
    return await dispatch(
        fetchIntegratorDetailsThunk(officeCode)
    );
};

/* =========================================
   CREATE INTEGRATOR
========================================= */

export const createIntegratorService = async (dispatch, payload) => {
    return await dispatch(
        createIntegratorThunk(payload)
    );
};

/* =========================================
   MODIFY INTEGRATOR
========================================= */

export const modifyIntegratorService = async (dispatch, officeCode, payload) => {
    return await dispatch(
        modifyIntegratorThunk({
            officeCode,
            ...payload,
        })
    );
};

/* =========================================
   FETCH BUSINESS TYPES
========================================= */

export const fetchBusinessTypesService = async (dispatch) => {
    return await dispatch(
        fetchBusinessTypesThunk()
    );
};

/* =========================================
   FETCH BANKS
========================================= */

export const fetchBanksService = async (dispatch) => {
    return await dispatch(
        fetchBanksThunk()
    );
};