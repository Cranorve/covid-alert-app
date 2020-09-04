import React, {useCallback} from 'react';
import {useNavigation} from '@react-navigation/native';
import {Linking} from 'react-native';
import {useI18n} from 'locale';
import {Text, Box, ButtonSingleLine, ErrorBox} from 'components';
import {useStorage} from 'services/StorageService';
import {useAccessibilityAutoFocus} from 'shared/useAccessibilityAutoFocus';
import {captureException} from 'shared/log';
import {isRegionActive} from 'shared/RegionLogic';
import {useRegionalI18n} from 'locale/regional';

import {BaseHomeView} from '../components/BaseHomeView';

export const ExposureView = ({isBottomSheetExpanded}: {isBottomSheetExpanded: boolean}) => {
  const {region} = useStorage();
  const i18n = useI18n();
  const regionalI18n = useRegionalI18n();
  const navigation = useNavigation();
  const regionActive = isRegionActive(region, regionalI18n.activeRegions);
  const getGuidanceURL = useCallback(() => {
    if (region !== undefined && region !== 'None') {
      return regionActive
        ? regionalI18n.translate(`RegionContent.ExposureView.Active.${region}.URL`)
        : regionalI18n.translate(`RegionContent.ExposureView.Inactive.${region}.URL`);
    }
    return i18n.translate(`RegionContent.ExposureView.Inactive.CA.URL`);
  }, [i18n, region, regionActive, regionalI18n]);

  const getGuidanceCTA = useCallback(() => {
    if (region !== undefined && region !== 'None') {
      return regionActive
        ? regionalI18n.translate(`RegionContent.ExposureView.Active.${region}.CTA`)
        : regionalI18n.translate(`RegionContent.ExposureView.Inactive.${region}.CTA`);
    }
    return regionalI18n.translate(`RegionContent.ExposureView.Inactive.CA.CTA`);
  }, [region, regionActive, regionalI18n]);

  const regionalGuidanceCTA = getGuidanceCTA();

  const onActionGuidance = useCallback(() => {
    Linking.openURL(getGuidanceURL()).catch(error => captureException('An error occurred', error));
  }, [getGuidanceURL]);
  const onHowToIsolate = useCallback(() => navigation.navigate('HowToIsolate'), [navigation]);
  const autoFocusRef = useAccessibilityAutoFocus(!isBottomSheetExpanded);

  return (
    <BaseHomeView iconName="hand-caution" testID="exposure">
      <Text focusRef={autoFocusRef} variant="bodyTitle" marginBottom="m" accessibilityRole="header">
        {i18n.translate('Home.ExposureDetected.Title')}
      </Text>
      <Text marginBottom="m">{i18n.translate('Home.ExposureDetected.Body1')}</Text>
      <Text variant="bodyTitle" marginBottom="m" accessibilityRole="header">
        {i18n.translate(`Home.ExposureDetected.Title2`)}
      </Text>
      <Text>
        {regionActive ? (
          <Text>{regionalI18n.translate(`RegionContent.ExposureView.Active.${region}.Body`)}</Text>
        ) : (
          <>
            <Text>{i18n.translate('Home.ExposureDetected.RegionNotCovered.Body2')}</Text>
            <Text fontWeight="bold">{i18n.translate('Home.ExposureDetected.RegionNotCovered.Body3')}</Text>
          </>
        )}
      </Text>

      {regionalGuidanceCTA === '' ? (
        <ErrorBox marginTop="m" />
      ) : (
        <Box alignSelf="stretch" marginTop="l" marginBottom={regionActive ? 'xxl' : 'm'}>
          <ButtonSingleLine
            text={regionalGuidanceCTA}
            variant="bigFlatPurple"
            externalLink
            onPress={onActionGuidance}
          />
        </Box>
      )}

      {!regionActive && (
        <Box alignSelf="stretch" marginBottom="m">
          <ButtonSingleLine
            text={i18n.translate(`Home.ExposureDetected.RegionNotCovered.HowToIsolateCTA`)}
            variant="bigFlatDarkGrey"
            onPress={onHowToIsolate}
            internalLink
          />
        </Box>
      )}
    </BaseHomeView>
  );
};
