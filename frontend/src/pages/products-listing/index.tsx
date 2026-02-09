import AppAppBar from '../../features/landing-page/components/AppBar';
import AppFooter from '../../features/landing-page/components/AppFooter';
import PricingComparision from '../../features/landing-page/components/PricingComparision';
import { useEffect, useMemo, useState } from 'react';
import { Box, Typography } from '@mui/material';
import GenericModal from '../../components/modal';
import ModernSelect, { type IOption } from '../../components/select';
import MorenButton from '../../components/button';
import { COUNTRIES_LIST } from '../../utils/constants';

const ProductsListingPageComponent = () => {
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<IOption | null>(null);

  const countryOptions: IOption[] = useMemo(
    () =>
      (COUNTRIES_LIST || []).map(c => ({
        value: String((c as { value?: string }).value || ''),
        label: String((c as { label?: string }).label || ''),
      })),
    []
  );

  const defaultCountry = useMemo(
    () => countryOptions.find(c => c.value === 'US') || null,
    [countryOptions]
  );

  useEffect(() => {
    if (!selectedCountry && defaultCountry) {
      setSelectedCountry(defaultCountry);
    }
  }, [defaultCountry, selectedCountry]);

  return (
    <>
      <AppAppBar />
      <GenericModal
        isOpen={isCountryModalOpen}
        onClose={() => {
          // keep it open until a country is selected
          if (selectedCountry) setIsCountryModalOpen(false);
        }}
        title="Choose your country"
        hideCancelButton
        hideSubmitButton
      >
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="body2" color="textSecondary">
            Prices will be shown based on your selected country (if a country
            price is set); otherwise USD price will be used.
          </Typography>

          <ModernSelect
            label="Country"
            id="public-products-country"
            options={countryOptions}
            value={selectedCountry}
            onChange={setSelectedCountry}
            placeholder="Select country"
            searchable
            fullWidth
          />

          <MorenButton
            variant="contained"
            onClick={() => setIsCountryModalOpen(false)}
            disabled={!selectedCountry}
            sx={{ alignSelf: 'flex-end', minWidth: '120px' }}
          >
            Continue
          </MorenButton>
        </Box>
      </GenericModal>

      <PricingComparision selectedCountryCode={selectedCountry?.value} />
      <AppFooter />
    </>
  );
};

export default ProductsListingPageComponent;
