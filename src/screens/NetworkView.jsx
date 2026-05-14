// src/components/NetworkView.jsx

import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
// import { showError } from '../utils/toast';
import { useAppContext } from '../contexts/AppContext';

import {
  fetchNetworkDetails,
  selectNetworkDetails,
  selectNetworkDetailsLoading,
  selectNetworkDetailsError,
  clearNetworkDetails,
} from '../store/slices/networkDetailsSlice';

import styles from '../CssModules/networkview.module.css';

const NetworkView = () => {
  const { networkId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { getLabel } = useAppContext();

  const network = useSelector(selectNetworkDetails);
  const loading = useSelector(selectNetworkDetailsLoading);
  const error = useSelector(selectNetworkDetailsError);

  useEffect(() => {
    if (networkId) {
      dispatch(fetchNetworkDetails(Number(networkId)));
    }
    return () => {
      dispatch(clearNetworkDetails());
    };
  }, [dispatch, networkId]);

  useEffect(() => {
    if (error) {
      showError(error);
    }
  }, [error]);

  const handleBack = () => {
    navigate('/networkmanagementgrid');
  };

  if (loading) {
    return (
      <div className={styles.screenLayoutUser}>
        <div className={styles.screenContainerUserManagement}>
          <div className={styles.loading}>Loading network details...</div>
        </div>
      </div>
    );
  }

  if (!network) {
    return (
      <div className={styles.screenLayoutUser}>
        <div className={styles.screenContainerUserManagement}>
          <div className={styles.error}>Network details not found</div>
          <button onClick={handleBack} className={styles.backBtn}>
            Back to List
          </button>
        </div>
      </div>
    );
  }

  // Helpers
  const formatYesNo = (value) => {
    if (value === 'Y' || value === true) return 'Yes';
    if (value === 'N' || value === false) return 'No';
    return value ?? '-';
  };

  const formatNumber = (value) => (value != null ? String(value) : '-');

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const hasSimUploadEnabled =
    network.bssui === 'Y' ||
    network.hlrui === 'Y' ||
    network.hssui === 'Y' ||
    network.msgui === 'Y' ||
    network.pcrfui === 'Y';

  return (
    <div className={styles.screenLayoutUser}>
      <div className={styles.screenContainerUserManagement}>
        

        <h2 className="screen-title">
          {getLabel('networkmanagementmodify.networkviewtitle') }
        </h2>

        {/* ────────────────────────────── */}
        {/* General Information */}
        {/* ────────────────────────────── */}
        <div className={styles.section}>
         
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.networkName')}</span>
              <span className={styles.value}>{network.networkName || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.status')}</span>
              <span className={styles.value}>{network.statusCode || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.createdDate')}</span>
              <span className={styles.value}>{formatDate(network.creationDate)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.description')}</span>
              <span className={styles.value}>{network.description || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.networkAddress')}</span>
              <span className={styles.value}>{network.networkAddress || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.country')}</span>
              <span className={styles.value}>{network.countryDesc || network.country || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.state')}</span>
              <span className={styles.value}>{network.stateDesc || network.state || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.city')}</span>
              <span className={styles.value}>{network.city || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.browserDisplay')}</span>
              <span className={styles.value}>{network.browserDisplay || '-'}</span>
            </div>

            
          </div>
        </div>

        
        {/* ────────────────────────────── */}
        {/* IMSI & Login Settings */}
        {/* ────────────────────────────── */}
        <div className={styles.section}>
          
          <div className={styles.detailGrid}>
            <div className={styles.detailItemFull}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.imsiPrefix')}</span>
              <span className={styles.value}>
                {network.imsiPrefix?.length > 0
                  ? network.imsiPrefix.join(', ')
                  : '-'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.maxOperatorFailedLoginAttempts')}</span>
              <span className={styles.value}>
                {formatNumber(network.maxOperatorFailedLoginAttempts)}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.maxSubscriberLoginAttempts')}</span>
              <span className={styles.value}>
                {formatNumber(network.maxSubscriberLoginAttempts)}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.smsThresholdRm')}</span>
              <span className={styles.value}>{formatNumber(network.smsThreshold)}</span>
            </div>

             <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.voucherPrefix')}</span>
              <span className={styles.value}>{network.voucherPrefix || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.supplyCharge1')}</span>
              <span className={styles.value}>{network.supplyCharge1 || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.supplyCharge2')}</span>
              <span className={styles.value}>{network.supplyCharge2 || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.supplyCharge3')}</span>
              <span className={styles.value}>{network.supplyCharge3 || '-'}</span>
            </div>
          </div>
        </div>

        {/* ────────────────────────────── */}
        {/* Voucher & PIN */}
        {/* ────────────────────────────── */}
        <div className={styles.section}>
         
          <div className={styles.detailGrid}>
           
            
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.supplyCharge4')}</span>
              <span className={styles.value}>{network.supplyCharge4 || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.subscriberDefaultPin')}</span>
              <span className={styles.value}>
                {formatNumber(network.subscriberDefaultPin)}
              </span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.camelNodeId')}</span>
              <span className={styles.value}>{formatNumber(network.camelNodeId)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.networkCode')}</span>
              <span className={styles.value}>{formatNumber(network.networkCode)}</span>
            </div>
          </div>
        </div>

        {/* ────────────────────────────── */}
        {/* CAMEL & Emergency Settings */}
        {/* ────────────────────────────── */}
        <div className={styles.section}>
          
          <div className={styles.detailGrid}>
            
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.g2BalanceRetention')}</span>
              <span className={styles.value}>{formatYesNo(network.g2BalanceRetention)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.personalEmergencyCallFlag')}</span>
              <span className={styles.value}>
                {formatYesNo(network.personalEmergencyCallFlag)}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.personalEmergencyCallCount')}</span>
              <span className={styles.value}>
                {formatNumber(network.personalEmergencyCallCount)}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.vccMsisdnSeries')}</span>
              <span className={styles.value}>
                {formatNumber(network.vccMsisdnSeries)}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.roamingAcrossHomeCountry')}</span>
              <span className={styles.value}>
                {formatYesNo(network.roamingAcrossHomeCountry)}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.vmsNumber')}</span>
              <span className={styles.value}>{formatNumber(network.vmsNumber)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.statusTransitFlag')}</span>
              <span className={styles.value}>
                {formatYesNo(network.statusTransitFlag)}
              </span>
            </div>

             <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.domainName')}</span>
              <span className={styles.value}>{network.domainName || '-'}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.lrrGroupId')}</span>
              <span className={styles.value}>{formatNumber(network.lrrGroupId)}</span>
            </div>
          </div>
        </div>

        {/* ────────────────────────────── */}
        {/* VOIP & Ring Tones */}
        {/* ────────────────────────────── */}
        <div className={styles.section}>
         
          <div className={styles.detailGrid}>
           
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.sipGroupId')}</span>
              <span className={styles.value}>{formatNumber(network.sipGroupId)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.ringToneAlertInfoUrl')}</span>
              <span className={styles.value}>
                {network.ringToneAlertInfoUrl || '-'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.ringBackToneAlertInfoUrl')}</span>
              <span className={styles.value}>
                {network.ringBackToneAlertInfoUrl || '-'}
              </span>
            </div>
          </div>
        </div>

        {/* ────────────────────────────── */}
        {/* Low Balance Notification */}
        {/* ────────────────────────────── */}
        <div className={styles.section}>
          
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.firstThreshold')}</span>
              <span className={styles.value}>{formatNumber(network.firstThreshold)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.secondThreshold')}</span>
              <span className={styles.value}>{formatNumber(network.secondThreshold)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>{getLabel('networkmanagementmodify.msisdnLength')}</span>
              <span className={styles.value}>{formatNumber(network.msisdnLength)}</span>
            </div>
          </div>
        </div>

       

        {/* ────────────────────────────── */}
        {/* SimUpload & UI Access */}
        {/* ────────────────────────────── */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>{getLabel('networkmanagementmodify.simuploaduiaccess')}</h2>
          <div className={styles.simUploadContainer}>
            <div className={styles.simUploadMain}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={hasSimUploadEnabled}
                  readOnly
                  disabled
                />
                {getLabel('networkmanagementmodify.enablesimuploaduiaccess')}
              </label>
            </div>

            {hasSimUploadEnabled && (
              <div className={styles.uiAccessGrid}>
                <label className={styles.checkboxItem}>
                  <input type="checkbox" checked={network.bssui === 'Y'} readOnly disabled />
                 {getLabel('networkmanagementmodify.bssUiEnabled')}
                </label>
                <label className={styles.checkboxItem}>
                  <input type="checkbox" checked={network.hlrui === 'Y'} readOnly disabled />
                  {getLabel('networkmanagementmodify.hlrUiEnabled')}
                </label>
                <label className={styles.checkboxItem}>
                  <input type="checkbox" checked={network.hssui === 'Y'} readOnly disabled />
                  {getLabel('networkmanagementmodify.hssUiEnabled')}
                </label>
                <label className={styles.checkboxItem}>
                  <input type="checkbox" checked={network.msgui === 'Y'} readOnly disabled />
                  {getLabel('networkmanagementmodify.msgUiEnabled')}
                </label>
                <label className={styles.checkboxItem}>
                  <input type="checkbox" checked={network.pcrfui === 'Y'} readOnly disabled />
                  {getLabel('networkmanagementmodify.pcrfUiEnabled')}
                </label>
              </div>
            )}
          </div>
        </div>


        <div className={styles.footer}>
          <button onClick={handleBack} className={styles.backBtn}>
            Back to Network List
          </button>
        </div>
      </div>
    </div>
  );
};

export default NetworkView;