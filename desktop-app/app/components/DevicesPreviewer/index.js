// @flow
import React, {Fragment, useState, useEffect} from 'react';
import cx from 'classnames';
import {Tab, Tabs, TabList} from 'react-tabs';
import Renderer from '../Renderer';

import styles from './style.module.css';
import {
  HORIZONTAL_LAYOUT,
  FLEXIGRID_LAYOUT,
  INDIVIDUAL_LAYOUT,
  DEVTOOLS_MODES,
} from '../../constants/previewerLayouts';
import {isDeviceEligible} from '../../utils/filterUtils';
import {getDeviceIcon} from '../../utils/iconUtils';

export default function DevicesPreviewer(props) {
  const {
    browser: {
      devices,
      address,
      zoomLevel,
      previewer: {layout},
    },
  } = props;
  const [activeTab, changeTab] = useState(0);

  let newActiveTab = activeTab;
  const devicesAfterFiltering = devices
    .map((device, index) => {
      if (isDeviceEligible(device, props.browser.filters)) {
        return device;
      }
    })
    .filter(Boolean);

  let focusedDeviceIndex = 0;
  let focusedDeviceId = props.browser.previewer.focusedDeviceId;
  if (layout === INDIVIDUAL_LAYOUT) {
    if (props.browser.previewer.focusedDeviceId) {
      focusedDeviceIndex = (devicesAfterFiltering || []).findIndex(
        device => device.id === focusedDeviceId
      );

      if (focusedDeviceIndex === -1) {
        focusedDeviceIndex = 0;
        if (devicesAfterFiltering.length > 0) {
          focusedDeviceId = devicesAfterFiltering[0].id;
        }
      }

      if (focusedDeviceIndex != activeTab) {
        changeTab(focusedDeviceIndex);
      }
    }
  }

  const onTabClick = function(newTabIndex) {
    changeTab(newTabIndex);
    props.setFocusedDevice(devicesAfterFiltering[newTabIndex].id);
  };

  return (
    <div className={cx(styles.container)}>
      {layout === INDIVIDUAL_LAYOUT && (
        <Tabs onSelect={onTabClick} selectedIndex={focusedDeviceIndex}>
          <TabList>
            {devicesAfterFiltering.map(device => {
              return (
                <Tab tabId={device.id} key={device.id}>
                  {getDeviceIcon(device.type)}
                  {device.name}
                </Tab>
              );
            })}
          </TabList>
        </Tabs>
      )}
      <div
        className={cx(styles.devicesContainer, {
          [styles.flexigrid]: layout === FLEXIGRID_LAYOUT,
          [styles.horizontal]: layout === HORIZONTAL_LAYOUT,
        })}
      >
        {devices.map((device, index) => (
          <div
            key={device.id}
            className={cx({
              [styles.tab]: layout === INDIVIDUAL_LAYOUT,
              [styles.activeTab]:
                layout === INDIVIDUAL_LAYOUT && focusedDeviceId === device.id,
            })}
          >
            <Renderer
              hidden={!isDeviceEligible(device, props.browser.filters)}
              device={device}
              src={address}
              zoomLevel={zoomLevel}
              transmitNavigatorStatus={index === 0}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
