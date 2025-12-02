export const ROLES_ALLOWED_TO_CHANGE_LANGUAGE = ['USER'];

export const LOCAL_STORAGE_KEYS = {
  SIDEBAR_OPEN: 'sidebarOpen',
  LANGUAGE_CONSTANTS: 'languageConstants',
};

export const DRAWER_WIDTH = 260;
export const MINI_DRAWER_WIDTH = 70;

export const COUNTRIES_LIST = [
  {
    value: 'US',
    label: 'United States',
    states: [
      { value: 'AL', label: 'Alabama', timeZone: 'America/Chicago' },
      { value: 'AK', label: 'Alaska', timeZone: 'America/Anchorage' },
      { value: 'AZ', label: 'Arizona', timeZone: 'America/Phoenix' },
      { value: 'AR', label: 'Arkansas', timeZone: 'America/Chicago' },
      { value: 'CA', label: 'California', timeZone: 'America/Los_Angeles' },
      { value: 'CO', label: 'Colorado', timeZone: 'America/Denver' },
      { value: 'CT', label: 'Connecticut', timeZone: 'America/New_York' },
      { value: 'DE', label: 'Delaware', timeZone: 'America/New_York' },
      {
        value: 'DC',
        label: 'District of Columbia',
        timeZone: 'America/New_York',
      },
      { value: 'FL', label: 'Florida', timeZone: 'America/New_York' },
      { value: 'GA', label: 'Georgia', timeZone: 'America/New_York' },
      { value: 'HI', label: 'Hawaii', timeZone: 'Pacific/Honolulu' },
      { value: 'ID', label: 'Idaho', timeZone: 'America/Denver' },
      { value: 'IL', label: 'Illinois', timeZone: 'America/Chicago' },
      {
        value: 'IN',
        label: 'Indiana',
        timeZone: 'America/Indiana/Indianapolis',
      },
      { value: 'IA', label: 'Iowa', timeZone: 'America/Chicago' },
      { value: 'KS', label: 'Kansas', timeZone: 'America/Chicago' },
      { value: 'KY', label: 'Kentucky', timeZone: 'America/New_York' },
      { value: 'LA', label: 'Louisiana', timeZone: 'America/Chicago' },
      { value: 'ME', label: 'Maine', timeZone: 'America/New_York' },
      { value: 'MD', label: 'Maryland', timeZone: 'America/New_York' },
      { value: 'MA', label: 'Massachusetts', timeZone: 'America/New_York' },
      { value: 'MI', label: 'Michigan', timeZone: 'America/Detroit' },
      { value: 'MN', label: 'Minnesota', timeZone: 'America/Chicago' },
      { value: 'MS', label: 'Mississippi', timeZone: 'America/Chicago' },
      { value: 'MO', label: 'Missouri', timeZone: 'America/Chicago' },
      { value: 'MT', label: 'Montana', timeZone: 'America/Denver' },
      { value: 'NE', label: 'Nebraska', timeZone: 'America/Chicago' },
      { value: 'NV', label: 'Nevada', timeZone: 'America/Los_Angeles' },
      { value: 'NH', label: 'New Hampshire', timeZone: 'America/New_York' },
      { value: 'NJ', label: 'New Jersey', timeZone: 'America/New_York' },
      { value: 'NM', label: 'New Mexico', timeZone: 'America/Denver' },
      { value: 'NY', label: 'New York', timeZone: 'America/New_York' },
      { value: 'NC', label: 'North Carolina', timeZone: 'America/New_York' },
      { value: 'ND', label: 'North Dakota', timeZone: 'America/Chicago' },
      { value: 'OH', label: 'Ohio', timeZone: 'America/New_York' },
      { value: 'OK', label: 'Oklahoma', timeZone: 'America/Chicago' },
      { value: 'OR', label: 'Oregon', timeZone: 'America/Los_Angeles' },
      { value: 'PA', label: 'Pennsylvania', timeZone: 'America/New_York' },
      { value: 'RI', label: 'Rhode Island', timeZone: 'America/New_York' },
      { value: 'SC', label: 'South Carolina', timeZone: 'America/New_York' },
      { value: 'SD', label: 'South Dakota', timeZone: 'America/Chicago' },
      { value: 'TN', label: 'Tennessee', timeZone: 'America/Chicago' },
      { value: 'TX', label: 'Texas', timeZone: 'America/Chicago' },
      { value: 'UT', label: 'Utah', timeZone: 'America/Denver' },
      { value: 'VT', label: 'Vermont', timeZone: 'America/New_York' },
      { value: 'VA', label: 'Virginia', timeZone: 'America/New_York' },
      { value: 'WA', label: 'Washington', timeZone: 'America/Los_Angeles' },
      { value: 'WV', label: 'West Virginia', timeZone: 'America/New_York' },
      { value: 'WI', label: 'Wisconsin', timeZone: 'America/Chicago' },
      { value: 'WY', label: 'Wyoming', timeZone: 'America/Denver' },
    ],
  },
  {
    value: 'CA',
    label: 'Canada',
    states: [
      { value: 'AB', label: 'Alberta', timeZone: 'America/Edmonton' },
      { value: 'BC', label: 'British Columbia', timeZone: 'America/Vancouver' },
      { value: 'MB', label: 'Manitoba', timeZone: 'America/Winnipeg' },
      { value: 'NB', label: 'New Brunswick', timeZone: 'America/Moncton' },
      {
        value: 'NL',
        label: 'Newfoundland and Labrador',
        timeZone: 'America/St_Johns',
      },
      { value: 'NS', label: 'Nova Scotia', timeZone: 'America/Halifax' },
      {
        value: 'NT',
        label: 'Northwest Territories',
        timeZone: 'America/Yellowknife',
      },
      { value: 'NU', label: 'Nunavut', timeZone: 'America/Iqaluit' },
      { value: 'ON', label: 'Ontario', timeZone: 'America/Toronto' },
      {
        value: 'PE',
        label: 'Prince Edward Island',
        timeZone: 'America/Halifax',
      },
      { value: 'QC', label: 'Quebec', timeZone: 'America/Montreal' },
      { value: 'SK', label: 'Saskatchewan', timeZone: 'America/Regina' },
      { value: 'YT', label: 'Yukon', timeZone: 'America/Whitehorse' },
    ],
  },
  {
    value: 'GB',
    label: 'United Kingdom',
    states: [
      { value: 'ENG', label: 'England', timeZone: 'Europe/London' },
      { value: 'SCT', label: 'Scotland', timeZone: 'Europe/London' },
      { value: 'WLS', label: 'Wales', timeZone: 'Europe/London' },
      { value: 'NIR', label: 'Northern Ireland', timeZone: 'Europe/London' },
    ],
  },
  {
    value: 'AU',
    label: 'Australia',
    states: [
      { value: 'NSW', label: 'New South Wales', timeZone: 'Australia/Sydney' },
      { value: 'VIC', label: 'Victoria', timeZone: 'Australia/Melbourne' },
      { value: 'QLD', label: 'Queensland', timeZone: 'Australia/Brisbane' },
      { value: 'SA', label: 'South Australia', timeZone: 'Australia/Adelaide' },
      { value: 'WA', label: 'Western Australia', timeZone: 'Australia/Perth' },
      { value: 'TAS', label: 'Tasmania', timeZone: 'Australia/Hobart' },
      {
        value: 'NT',
        label: 'Northern Territory',
        timeZone: 'Australia/Darwin',
      },
      {
        value: 'ACT',
        label: 'Australian Capital Territory',
        timeZone: 'Australia/Sydney',
      },
    ],
  },
  {
    value: 'IN',
    label: 'India',
    states: [
      { value: 'AP', label: 'Andhra Pradesh', timeZone: 'Asia/Kolkata' },
      { value: 'AR', label: 'Arunachal Pradesh', timeZone: 'Asia/Kolkata' },
      { value: 'AS', label: 'Assam', timeZone: 'Asia/Kolkata' },
      { value: 'BR', label: 'Bihar', timeZone: 'Asia/Kolkata' },
      { value: 'CT', label: 'Chhattisgarh', timeZone: 'Asia/Kolkata' },
      { value: 'GA', label: 'Goa', timeZone: 'Asia/Kolkata' },
      { value: 'GJ', label: 'Gujarat', timeZone: 'Asia/Kolkata' },
      { value: 'HR', label: 'Haryana', timeZone: 'Asia/Kolkata' },
      { value: 'HP', label: 'Himachal Pradesh', timeZone: 'Asia/Kolkata' },
      { value: 'JH', label: 'Jharkhand', timeZone: 'Asia/Kolkata' },
      { value: 'KA', label: 'Karnataka', timeZone: 'Asia/Kolkata' },
      { value: 'KL', label: 'Kerala', timeZone: 'Asia/Kolkata' },
      { value: 'MP', label: 'Madhya Pradesh', timeZone: 'Asia/Kolkata' },
      { value: 'MH', label: 'Maharashtra', timeZone: 'Asia/Kolkata' },
      { value: 'MN', label: 'Manipur', timeZone: 'Asia/Kolkata' },
      { value: 'ML', label: 'Meghalaya', timeZone: 'Asia/Kolkata' },
      { value: 'MZ', label: 'Mizoram', timeZone: 'Asia/Kolkata' },
      { value: 'NL', label: 'Nagaland', timeZone: 'Asia/Kolkata' },
      { value: 'OD', label: 'Odisha', timeZone: 'Asia/Kolkata' },
      { value: 'PB', label: 'Punjab', timeZone: 'Asia/Kolkata' },
      { value: 'RJ', label: 'Rajasthan', timeZone: 'Asia/Kolkata' },
      { value: 'SK', label: 'Sikkim', timeZone: 'Asia/Kolkata' },
      { value: 'TN', label: 'Tamil Nadu', timeZone: 'Asia/Kolkata' },
      { value: 'TG', label: 'Telangana', timeZone: 'Asia/Kolkata' },
      { value: 'TR', label: 'Tripura', timeZone: 'Asia/Kolkata' },
      { value: 'UP', label: 'Uttar Pradesh', timeZone: 'Asia/Kolkata' },
      { value: 'UK', label: 'Uttarakhand', timeZone: 'Asia/Kolkata' },
      { value: 'WB', label: 'West Bengal', timeZone: 'Asia/Kolkata' },
      {
        value: 'AN',
        label: 'Andaman and Nicobar Islands',
        timeZone: 'Asia/Kolkata',
      },
      { value: 'CH', label: 'Chandigarh', timeZone: 'Asia/Kolkata' },
      {
        value: 'DN',
        label: 'Dadra and Nagar Haveli and Daman and Diu',
        timeZone: 'Asia/Kolkata',
      },
      { value: 'DL', label: 'Delhi', timeZone: 'Asia/Kolkata' },
      { value: 'JK', label: 'Jammu and Kashmir', timeZone: 'Asia/Kolkata' },
      { value: 'LA', label: 'Ladakh', timeZone: 'Asia/Kolkata' },
      { value: 'LD', label: 'Lakshadweep', timeZone: 'Asia/Kolkata' },
      { value: 'PY', label: 'Puducherry', timeZone: 'Asia/Kolkata' },
    ],
  },
  {
    value: 'CN',
    label: 'China',
    states: [
      { value: 'BJ', label: 'Beijing', timeZone: 'Asia/Shanghai' },
      { value: 'SH', label: 'Shanghai', timeZone: 'Asia/Shanghai' },
      { value: 'TJ', label: 'Tianjin', timeZone: 'Asia/Shanghai' },
      { value: 'CQ', label: 'Chongqing', timeZone: 'Asia/Shanghai' },
      { value: 'HE', label: 'Hebei', timeZone: 'Asia/Shanghai' },
      { value: 'SX', label: 'Shanxi', timeZone: 'Asia/Shanghai' },
      { value: 'LN', label: 'Liaoning', timeZone: 'Asia/Shanghai' },
      { value: 'JL', label: 'Jilin', timeZone: 'Asia/Shanghai' },
      { value: 'HL', label: 'Heilongjiang', timeZone: 'Asia/Shanghai' },
      { value: 'JS', label: 'Jiangsu', timeZone: 'Asia/Shanghai' },
      { value: 'ZJ', label: 'Zhejiang', timeZone: 'Asia/Shanghai' },
      { value: 'AH', label: 'Anhui', timeZone: 'Asia/Shanghai' },
      { value: 'FJ', label: 'Fujian', timeZone: 'Asia/Shanghai' },
      { value: 'JX', label: 'Jiangxi', timeZone: 'Asia/Shanghai' },
      { value: 'SD', label: 'Shandong', timeZone: 'Asia/Shanghai' },
      { value: 'HA', label: 'Henan', timeZone: 'Asia/Shanghai' },
      { value: 'HB', label: 'Hubei', timeZone: 'Asia/Shanghai' },
      { value: 'HN', label: 'Hunan', timeZone: 'Asia/Shanghai' },
      { value: 'GD', label: 'Guangdong', timeZone: 'Asia/Shanghai' },
      { value: 'HI', label: 'Hainan', timeZone: 'Asia/Shanghai' },
      { value: 'SC', label: 'Sichuan', timeZone: 'Asia/Shanghai' },
      { value: 'GZ', label: 'Guizhou', timeZone: 'Asia/Shanghai' },
      { value: 'YN', label: 'Yunnan', timeZone: 'Asia/Shanghai' },
      { value: 'SN', label: 'Shaanxi', timeZone: 'Asia/Shanghai' },
      { value: 'GS', label: 'Gansu', timeZone: 'Asia/Shanghai' },
      { value: 'QH', label: 'Qinghai', timeZone: 'Asia/Shanghai' },
      { value: 'TW', label: 'Taiwan', timeZone: 'Asia/Taipei' },
      { value: 'NM', label: 'Inner Mongolia', timeZone: 'Asia/Shanghai' },
      { value: 'GX', label: 'Guangxi', timeZone: 'Asia/Shanghai' },
      { value: 'XZ', label: 'Tibet', timeZone: 'Asia/Shanghai' },
      { value: 'NX', label: 'Ningxia', timeZone: 'Asia/Shanghai' },
      { value: 'XJ', label: 'Xinjiang', timeZone: 'Asia/Urumqi' },
      { value: 'HK', label: 'Hong Kong', timeZone: 'Asia/Hong_Kong' },
      { value: 'MO', label: 'Macau', timeZone: 'Asia/Macau' },
    ],
  },
  {
    value: 'JP',
    label: 'Japan',
    states: [
      { value: '01', label: 'Hokkaido', timeZone: 'Asia/Tokyo' },
      { value: '02', label: 'Aomori', timeZone: 'Asia/Tokyo' },
      { value: '03', label: 'Iwate', timeZone: 'Asia/Tokyo' },
      { value: '04', label: 'Miyagi', timeZone: 'Asia/Tokyo' },
      { value: '05', label: 'Akita', timeZone: 'Asia/Tokyo' },
      { value: '06', label: 'Yamagata', timeZone: 'Asia/Tokyo' },
      { value: '07', label: 'Fukushima', timeZone: 'Asia/Tokyo' },
      { value: '08', label: 'Ibaraki', timeZone: 'Asia/Tokyo' },
      { value: '09', label: 'Tochigi', timeZone: 'Asia/Tokyo' },
      { value: '10', label: 'Gunma', timeZone: 'Asia/Tokyo' },
      { value: '11', label: 'Saitama', timeZone: 'Asia/Tokyo' },
      { value: '12', label: 'Chiba', timeZone: 'Asia/Tokyo' },
      { value: '13', label: 'Tokyo', timeZone: 'Asia/Tokyo' },
      { value: '14', label: 'Kanagawa', timeZone: 'Asia/Tokyo' },
      { value: '15', label: 'Niigata', timeZone: 'Asia/Tokyo' },
      { value: '16', label: 'Toyama', timeZone: 'Asia/Tokyo' },
      { value: '17', label: 'Ishikawa', timeZone: 'Asia/Tokyo' },
      { value: '18', label: 'Fukui', timeZone: 'Asia/Tokyo' },
      { value: '19', label: 'Yamanashi', timeZone: 'Asia/Tokyo' },
      { value: '20', label: 'Nagano', timeZone: 'Asia/Tokyo' },
      { value: '21', label: 'Gifu', timeZone: 'Asia/Tokyo' },
      { value: '22', label: 'Shizuoka', timeZone: 'Asia/Tokyo' },
      { value: '23', label: 'Aichi', timeZone: 'Asia/Tokyo' },
      { value: '24', label: 'Mie', timeZone: 'Asia/Tokyo' },
      { value: '25', label: 'Shiga', timeZone: 'Asia/Tokyo' },
      { value: '26', label: 'Kyoto', timeZone: 'Asia/Tokyo' },
      { value: '27', label: 'Osaka', timeZone: 'Asia/Tokyo' },
      { value: '28', label: 'Hyogo', timeZone: 'Asia/Tokyo' },
      { value: '29', label: 'Nara', timeZone: 'Asia/Tokyo' },
      { value: '30', label: 'Wakayama', timeZone: 'Asia/Tokyo' },
      { value: '31', label: 'Tottori', timeZone: 'Asia/Tokyo' },
      { value: '32', label: 'Shimane', timeZone: 'Asia/Tokyo' },
      { value: '33', label: 'Okayama', timeZone: 'Asia/Tokyo' },
      { value: '34', label: 'Hiroshima', timeZone: 'Asia/Tokyo' },
      { value: '35', label: 'Yamaguchi', timeZone: 'Asia/Tokyo' },
      { value: '36', label: 'Tokushima', timeZone: 'Asia/Tokyo' },
      { value: '37', label: 'Kagawa', timeZone: 'Asia/Tokyo' },
      { value: '38', label: 'Ehime', timeZone: 'Asia/Tokyo' },
      { value: '39', label: 'Kochi', timeZone: 'Asia/Tokyo' },
      { value: '40', label: 'Fukuoka', timeZone: 'Asia/Tokyo' },
      { value: '41', label: 'Saga', timeZone: 'Asia/Tokyo' },
      { value: '42', label: 'Nagasaki', timeZone: 'Asia/Tokyo' },
      { value: '43', label: 'Kumamoto', timeZone: 'Asia/Tokyo' },
      { value: '44', label: 'Oita', timeZone: 'Asia/Tokyo' },
      { value: '45', label: 'Miyazaki', timeZone: 'Asia/Tokyo' },
      { value: '46', label: 'Kagoshima', timeZone: 'Asia/Tokyo' },
      { value: '47', label: 'Okinawa', timeZone: 'Asia/Tokyo' },
    ],
  },
  {
    value: 'DE',
    label: 'Germany',
    states: [
      { value: 'BW', label: 'Baden-Württemberg', timeZone: 'Europe/Berlin' },
      { value: 'BY', label: 'Bavaria', timeZone: 'Europe/Berlin' },
      { value: 'BE', label: 'Berlin', timeZone: 'Europe/Berlin' },
      { value: 'BB', label: 'Brandenburg', timeZone: 'Europe/Berlin' },
      { value: 'HB', label: 'Bremen', timeZone: 'Europe/Berlin' },
      { value: 'HH', label: 'Hamburg', timeZone: 'Europe/Berlin' },
      { value: 'HE', label: 'Hesse', timeZone: 'Europe/Berlin' },
      {
        value: 'MV',
        label: 'Mecklenburg-Vorpommern',
        timeZone: 'Europe/Berlin',
      },
      { value: 'NI', label: 'Lower Saxony', timeZone: 'Europe/Berlin' },
      {
        value: 'NW',
        label: 'North Rhine-Westphalia',
        timeZone: 'Europe/Berlin',
      },
      { value: 'RP', label: 'Rhineland-Palatinate', timeZone: 'Europe/Berlin' },
      { value: 'SL', label: 'Saarland', timeZone: 'Europe/Berlin' },
      { value: 'SN', label: 'Saxony', timeZone: 'Europe/Berlin' },
      { value: 'ST', label: 'Saxony-Anhalt', timeZone: 'Europe/Berlin' },
      { value: 'SH', label: 'Schleswig-Holstein', timeZone: 'Europe/Berlin' },
      { value: 'TH', label: 'Thuringia', timeZone: 'Europe/Berlin' },
    ],
  },
  {
    value: 'FR',
    label: 'France',
    states: [
      { value: 'ARA', label: 'Auvergne-Rhône-Alpes', timeZone: 'Europe/Paris' },
      {
        value: 'BFC',
        label: 'Bourgogne-Franche-Comté',
        timeZone: 'Europe/Paris',
      },
      { value: 'BRE', label: 'Brittany', timeZone: 'Europe/Paris' },
      { value: 'CVL', label: 'Centre-Val de Loire', timeZone: 'Europe/Paris' },
      { value: 'COR', label: 'Corsica', timeZone: 'Europe/Paris' },
      { value: 'GES', label: 'Grand Est', timeZone: 'Europe/Paris' },
      { value: 'HDF', label: 'Hauts-de-France', timeZone: 'Europe/Paris' },
      { value: 'IDF', label: 'Île-de-France', timeZone: 'Europe/Paris' },
      { value: 'NOR', label: 'Normandy', timeZone: 'Europe/Paris' },
      { value: 'NAQ', label: 'Nouvelle-Aquitaine', timeZone: 'Europe/Paris' },
      { value: 'OCC', label: 'Occitanie', timeZone: 'Europe/Paris' },
      { value: 'PDL', label: 'Pays de la Loire', timeZone: 'Europe/Paris' },
      {
        value: 'PAC',
        label: "Provence-Alpes-Côte d'Azur",
        timeZone: 'Europe/Paris',
      },
    ],
  },
  {
    value: 'BR',
    label: 'Brazil',
    states: [
      { value: 'AC', label: 'Acre', timeZone: 'America/Rio_Branco' },
      { value: 'AL', label: 'Alagoas', timeZone: 'America/Maceio' },
      { value: 'AP', label: 'Amapá', timeZone: 'America/Belem' },
      { value: 'AM', label: 'Amazonas', timeZone: 'America/Manaus' },
      { value: 'BA', label: 'Bahia', timeZone: 'America/Bahia' },
      { value: 'CE', label: 'Ceará', timeZone: 'America/Fortaleza' },
      { value: 'DF', label: 'Distrito Federal', timeZone: 'America/Sao_Paulo' },
      { value: 'ES', label: 'Espírito Santo', timeZone: 'America/Sao_Paulo' },
      { value: 'GO', label: 'Goiás', timeZone: 'America/Sao_Paulo' },
      { value: 'MA', label: 'Maranhão', timeZone: 'America/Fortaleza' },
      { value: 'MT', label: 'Mato Grosso', timeZone: 'America/Cuiaba' },
      {
        value: 'MS',
        label: 'Mato Grosso do Sul',
        timeZone: 'America/Campo_Grande',
      },
      { value: 'MG', label: 'Minas Gerais', timeZone: 'America/Sao_Paulo' },
      { value: 'PA', label: 'Pará', timeZone: 'America/Belem' },
      { value: 'PB', label: 'Paraíba', timeZone: 'America/Fortaleza' },
      { value: 'PR', label: 'Paraná', timeZone: 'America/Sao_Paulo' },
      { value: 'PE', label: 'Pernambuco', timeZone: 'America/Recife' },
      { value: 'PI', label: 'Piauí', timeZone: 'America/Fortaleza' },
      { value: 'RJ', label: 'Rio de Janeiro', timeZone: 'America/Sao_Paulo' },
      {
        value: 'RN',
        label: 'Rio Grande do Norte',
        timeZone: 'America/Fortaleza',
      },
      {
        value: 'RS',
        label: 'Rio Grande do Sul',
        timeZone: 'America/Sao_Paulo',
      },
      { value: 'RO', label: 'Rondônia', timeZone: 'America/Porto_Velho' },
      { value: 'RR', label: 'Roraima', timeZone: 'America/Boa_Vista' },
      { value: 'SC', label: 'Santa Catarina', timeZone: 'America/Sao_Paulo' },
      { value: 'SP', label: 'São Paulo', timeZone: 'America/Sao_Paulo' },
      { value: 'SE', label: 'Sergipe', timeZone: 'America/Maceio' },
      { value: 'TO', label: 'Tocantins', timeZone: 'America/Araguaina' },
    ],
  },
  {
    value: 'RU',
    label: 'Russian Federation',
    states: [
      { value: 'MOW', label: 'Moscow', timeZone: 'Europe/Moscow' },
      { value: 'SPE', label: 'Saint Petersburg', timeZone: 'Europe/Moscow' },
      {
        value: 'NVS',
        label: 'Novosibirsk Oblast',
        timeZone: 'Asia/Novosibirsk',
      },
      {
        value: 'SVE',
        label: 'Sverdlovsk Oblast',
        timeZone: 'Asia/Yekaterinburg',
      },
      {
        value: 'NIZ',
        label: 'Nizhny Novgorod Oblast',
        timeZone: 'Europe/Moscow',
      },
      { value: 'SAM', label: 'Samara Oblast', timeZone: 'Europe/Samara' },
      { value: 'OMS', label: 'Omsk Oblast', timeZone: 'Asia/Omsk' },
      { value: 'KAZ', label: 'Tatarstan', timeZone: 'Europe/Moscow' },
      {
        value: 'CHE',
        label: 'Chelyabinsk Oblast',
        timeZone: 'Asia/Yekaterinburg',
      },
      { value: 'ROS', label: 'Rostov Oblast', timeZone: 'Europe/Moscow' },
      { value: 'UFA', label: 'Bashkortostan', timeZone: 'Asia/Yekaterinburg' },
      { value: 'VGG', label: 'Volgograd Oblast', timeZone: 'Europe/Volgograd' },
      { value: 'PER', label: 'Perm Krai', timeZone: 'Asia/Yekaterinburg' },
      { value: 'KRA', label: 'Krasnoyarsk Krai', timeZone: 'Asia/Krasnoyarsk' },
      { value: 'VOR', label: 'Voronezh Oblast', timeZone: 'Europe/Moscow' },
      { value: 'SAR', label: 'Saratov Oblast', timeZone: 'Europe/Saratov' },
      { value: 'KDA', label: 'Krasnodar Krai', timeZone: 'Europe/Moscow' },
      { value: 'TYU', label: 'Tyumen Oblast', timeZone: 'Asia/Yekaterinburg' },
      { value: 'IZH', label: 'Udmurtia', timeZone: 'Europe/Samara' },
      { value: 'BAR', label: 'Altai Krai', timeZone: 'Asia/Barnaul' },
      { value: 'ULY', label: 'Ulyanovsk Oblast', timeZone: 'Europe/Ulyanovsk' },
      { value: 'IRK', label: 'Irkutsk Oblast', timeZone: 'Asia/Irkutsk' },
      { value: 'KHA', label: 'Khabarovsk Krai', timeZone: 'Asia/Vladivostok' },
      { value: 'YAR', label: 'Yaroslavl Oblast', timeZone: 'Europe/Moscow' },
      {
        value: 'VLA',
        label: 'Vladivostok (Primorsky Krai)',
        timeZone: 'Asia/Vladivostok',
      },
      { value: 'KAM', label: 'Kamchatka Krai', timeZone: 'Asia/Kamchatka' },
      { value: 'SAK', label: 'Sakha Republic', timeZone: 'Asia/Yakutsk' },
      {
        value: 'KGD',
        label: 'Kaliningrad Oblast',
        timeZone: 'Europe/Kaliningrad',
      },
    ],
  },
  {
    value: 'ZA',
    label: 'South Africa',
    states: [
      { value: 'EC', label: 'Eastern Cape', timeZone: 'Africa/Johannesburg' },
      { value: 'FS', label: 'Free State', timeZone: 'Africa/Johannesburg' },
      { value: 'GT', label: 'Gauteng', timeZone: 'Africa/Johannesburg' },
      { value: 'KZN', label: 'KwaZulu-Natal', timeZone: 'Africa/Johannesburg' },
      { value: 'LP', label: 'Limpopo', timeZone: 'Africa/Johannesburg' },
      { value: 'MP', label: 'Mpumalanga', timeZone: 'Africa/Johannesburg' },
      { value: 'NC', label: 'Northern Cape', timeZone: 'Africa/Johannesburg' },
      { value: 'NW', label: 'North West', timeZone: 'Africa/Johannesburg' },
      { value: 'WC', label: 'Western Cape', timeZone: 'Africa/Johannesburg' },
    ],
  },
  {
    value: 'AE',
    label: 'United Arab Emirates',
    states: [
      { value: 'AZ', label: 'Abu Dhabi', timeZone: 'Asia/Dubai' },
      { value: 'AJ', label: 'Ajman', timeZone: 'Asia/Dubai' },
      { value: 'DU', label: 'Dubai', timeZone: 'Asia/Dubai' },
      { value: 'FU', label: 'Fujairah', timeZone: 'Asia/Dubai' },
      { value: 'RK', label: 'Ras Al Khaimah', timeZone: 'Asia/Dubai' },
      { value: 'SH', label: 'Sharjah', timeZone: 'Asia/Dubai' },
      { value: 'UQ', label: 'Umm Al Quwain', timeZone: 'Asia/Dubai' },
    ],
  },
  {
    value: 'AF',
    label: 'Afghanistan',
    states: [{ value: 'AF-ALL', label: 'All Regions', timeZone: 'Asia/Kabul' }],
  },
  {
    value: 'AL',
    label: 'Albania',
    states: [
      { value: 'AL-ALL', label: 'All Regions', timeZone: 'Europe/Tirane' },
    ],
  },
  {
    value: 'DZ',
    label: 'Algeria',
    states: [
      { value: 'DZ-ALL', label: 'All Regions', timeZone: 'Africa/Algiers' },
    ],
  },
  {
    value: 'AD',
    label: 'Andorra',
    states: [
      { value: 'AD-ALL', label: 'All Regions', timeZone: 'Europe/Andorra' },
    ],
  },
  {
    value: 'AO',
    label: 'Angola',
    states: [
      { value: 'AO-ALL', label: 'All Regions', timeZone: 'Africa/Luanda' },
    ],
  },
  {
    value: 'AG',
    label: 'Antigua and Barbuda',
    states: [
      { value: 'AG-ALL', label: 'All Regions', timeZone: 'America/Antigua' },
    ],
  },
  {
    value: 'AR',
    label: 'Argentina',
    states: [
      {
        value: 'AR-ALL',
        label: 'All Regions',
        timeZone: 'America/Argentina/Buenos_Aires',
      },
    ],
  },
  {
    value: 'AM',
    label: 'Armenia',
    states: [
      { value: 'AM-ALL', label: 'All Regions', timeZone: 'Asia/Yerevan' },
    ],
  },
  {
    value: 'AT',
    label: 'Austria',
    states: [
      { value: 'AT-ALL', label: 'All Regions', timeZone: 'Europe/Vienna' },
    ],
  },
  {
    value: 'AZ',
    label: 'Azerbaijan',
    states: [{ value: 'AZ-ALL', label: 'All Regions', timeZone: 'Asia/Baku' }],
  },
  {
    value: 'BS',
    label: 'Bahamas',
    states: [
      { value: 'BS-ALL', label: 'All Regions', timeZone: 'America/Nassau' },
    ],
  },
  {
    value: 'BH',
    label: 'Bahrain',
    states: [
      { value: 'BH-ALL', label: 'All Regions', timeZone: 'Asia/Bahrain' },
    ],
  },
  {
    value: 'BD',
    label: 'Bangladesh',
    states: [{ value: 'BD-ALL', label: 'All Regions', timeZone: 'Asia/Dhaka' }],
  },
  {
    value: 'BB',
    label: 'Barbados',
    states: [
      { value: 'BB-ALL', label: 'All Regions', timeZone: 'America/Barbados' },
    ],
  },
  {
    value: 'BY',
    label: 'Belarus',
    states: [
      { value: 'BY-ALL', label: 'All Regions', timeZone: 'Europe/Minsk' },
    ],
  },
  {
    value: 'BE',
    label: 'Belgium',
    states: [
      { value: 'BE-ALL', label: 'All Regions', timeZone: 'Europe/Brussels' },
    ],
  },
  {
    value: 'BZ',
    label: 'Belize',
    states: [
      { value: 'BZ-ALL', label: 'All Regions', timeZone: 'America/Belize' },
    ],
  },
  {
    value: 'BJ',
    label: 'Benin',
    states: [
      { value: 'BJ-ALL', label: 'All Regions', timeZone: 'Africa/Porto-Novo' },
    ],
  },
  {
    value: 'BT',
    label: 'Bhutan',
    states: [
      { value: 'BT-ALL', label: 'All Regions', timeZone: 'Asia/Thimphu' },
    ],
  },
  {
    value: 'BO',
    label: 'Bolivia',
    states: [
      { value: 'BO-ALL', label: 'All Regions', timeZone: 'America/La_Paz' },
    ],
  },
  {
    value: 'BA',
    label: 'Bosnia and Herzegovina',
    states: [
      { value: 'BA-ALL', label: 'All Regions', timeZone: 'Europe/Sarajevo' },
    ],
  },
  {
    value: 'BW',
    label: 'Botswana',
    states: [
      { value: 'BW-ALL', label: 'All Regions', timeZone: 'Africa/Gaborone' },
    ],
  },
  {
    value: 'BN',
    label: 'Brunei Darussalam',
    states: [
      { value: 'BN-ALL', label: 'All Regions', timeZone: 'Asia/Brunei' },
    ],
  },
  {
    value: 'BG',
    label: 'Bulgaria',
    states: [
      { value: 'BG-ALL', label: 'All Regions', timeZone: 'Europe/Sofia' },
    ],
  },
  {
    value: 'BF',
    label: 'Burkina Faso',
    states: [
      { value: 'BF-ALL', label: 'All Regions', timeZone: 'Africa/Ouagadougou' },
    ],
  },
  {
    value: 'BI',
    label: 'Burundi',
    states: [
      { value: 'BI-ALL', label: 'All Regions', timeZone: 'Africa/Bujumbura' },
    ],
  },
  {
    value: 'KH',
    label: 'Cambodia',
    states: [
      { value: 'KH-ALL', label: 'All Regions', timeZone: 'Asia/Phnom_Penh' },
    ],
  },
  {
    value: 'CM',
    label: 'Cameroon',
    states: [
      { value: 'CM-ALL', label: 'All Regions', timeZone: 'Africa/Douala' },
    ],
  },
  {
    value: 'CV',
    label: 'Cape Verde',
    states: [
      {
        value: 'CV-ALL',
        label: 'All Regions',
        timeZone: 'Atlantic/Cape_Verde',
      },
    ],
  },
  {
    value: 'CF',
    label: 'Central African Republic',
    states: [
      { value: 'CF-ALL', label: 'All Regions', timeZone: 'Africa/Bangui' },
    ],
  },
  {
    value: 'TD',
    label: 'Chad',
    states: [
      { value: 'TD-ALL', label: 'All Regions', timeZone: 'Africa/Ndjamena' },
    ],
  },
  {
    value: 'CL',
    label: 'Chile',
    states: [
      { value: 'CL-ALL', label: 'All Regions', timeZone: 'America/Santiago' },
    ],
  },
  {
    value: 'CO',
    label: 'Colombia',
    states: [
      { value: 'CO-ALL', label: 'All Regions', timeZone: 'America/Bogota' },
    ],
  },
  {
    value: 'KM',
    label: 'Comoros',
    states: [
      { value: 'KM-ALL', label: 'All Regions', timeZone: 'Indian/Comoro' },
    ],
  },
  {
    value: 'CG',
    label: 'Congo',
    states: [
      { value: 'CG-ALL', label: 'All Regions', timeZone: 'Africa/Brazzaville' },
    ],
  },
  {
    value: 'CD',
    label: 'Congo, Democratic Republic of the',
    states: [
      { value: 'CD-ALL', label: 'All Regions', timeZone: 'Africa/Kinshasa' },
    ],
  },
  {
    value: 'CR',
    label: 'Costa Rica',
    states: [
      { value: 'CR-ALL', label: 'All Regions', timeZone: 'America/Costa_Rica' },
    ],
  },
  {
    value: 'HR',
    label: 'Croatia',
    states: [
      { value: 'HR-ALL', label: 'All Regions', timeZone: 'Europe/Zagreb' },
    ],
  },
  {
    value: 'CU',
    label: 'Cuba',
    states: [
      { value: 'CU-ALL', label: 'All Regions', timeZone: 'America/Havana' },
    ],
  },
  {
    value: 'CY',
    label: 'Cyprus',
    states: [
      { value: 'CY-ALL', label: 'All Regions', timeZone: 'Asia/Nicosia' },
    ],
  },
  {
    value: 'CZ',
    label: 'Czech Republic',
    states: [
      { value: 'CZ-ALL', label: 'All Regions', timeZone: 'Europe/Prague' },
    ],
  },
  {
    value: 'DK',
    label: 'Denmark',
    states: [
      { value: 'DK-ALL', label: 'All Regions', timeZone: 'Europe/Copenhagen' },
    ],
  },
  {
    value: 'DJ',
    label: 'Djibouti',
    states: [
      { value: 'DJ-ALL', label: 'All Regions', timeZone: 'Africa/Djibouti' },
    ],
  },
  {
    value: 'DM',
    label: 'Dominica',
    states: [
      { value: 'DM-ALL', label: 'All Regions', timeZone: 'America/Dominica' },
    ],
  },
  {
    value: 'DO',
    label: 'Dominican Republic',
    states: [
      {
        value: 'DO-ALL',
        label: 'All Regions',
        timeZone: 'America/Santo_Domingo',
      },
    ],
  },
  {
    value: 'EC',
    label: 'Ecuador',
    states: [
      { value: 'EC-ALL', label: 'All Regions', timeZone: 'America/Guayaquil' },
    ],
  },
  {
    value: 'EG',
    label: 'Egypt',
    states: [
      { value: 'EG-ALL', label: 'All Regions', timeZone: 'Africa/Cairo' },
    ],
  },
  {
    value: 'SV',
    label: 'El Salvador',
    states: [
      {
        value: 'SV-ALL',
        label: 'All Regions',
        timeZone: 'America/El_Salvador',
      },
    ],
  },
  {
    value: 'GQ',
    label: 'Equatorial Guinea',
    states: [
      { value: 'GQ-ALL', label: 'All Regions', timeZone: 'Africa/Malabo' },
    ],
  },
  {
    value: 'ER',
    label: 'Eritrea',
    states: [
      { value: 'ER-ALL', label: 'All Regions', timeZone: 'Africa/Asmara' },
    ],
  },
  {
    value: 'EE',
    label: 'Estonia',
    states: [
      { value: 'EE-ALL', label: 'All Regions', timeZone: 'Europe/Tallinn' },
    ],
  },
  {
    value: 'ET',
    label: 'Ethiopia',
    states: [
      { value: 'ET-ALL', label: 'All Regions', timeZone: 'Africa/Addis_Ababa' },
    ],
  },
  {
    value: 'FJ',
    label: 'Fiji',
    states: [
      { value: 'FJ-ALL', label: 'All Regions', timeZone: 'Pacific/Fiji' },
    ],
  },
  {
    value: 'FI',
    label: 'Finland',
    states: [
      { value: 'FI-ALL', label: 'All Regions', timeZone: 'Europe/Helsinki' },
    ],
  },
  {
    value: 'GA',
    label: 'Gabon',
    states: [
      { value: 'GA-ALL', label: 'All Regions', timeZone: 'Africa/Libreville' },
    ],
  },
  {
    value: 'GM',
    label: 'Gambia',
    states: [
      { value: 'GM-ALL', label: 'All Regions', timeZone: 'Africa/Banjul' },
    ],
  },
  {
    value: 'GE',
    label: 'Georgia',
    states: [
      { value: 'GE-ALL', label: 'All Regions', timeZone: 'Asia/Tbilisi' },
    ],
  },
  {
    value: 'GH',
    label: 'Ghana',
    states: [
      { value: 'GH-ALL', label: 'All Regions', timeZone: 'Africa/Accra' },
    ],
  },
  {
    value: 'GR',
    label: 'Greece',
    states: [
      { value: 'GR-ALL', label: 'All Regions', timeZone: 'Europe/Athens' },
    ],
  },
  {
    value: 'GD',
    label: 'Grenada',
    states: [
      { value: 'GD-ALL', label: 'All Regions', timeZone: 'America/Grenada' },
    ],
  },
  {
    value: 'GT',
    label: 'Guatemala',
    states: [
      { value: 'GT-ALL', label: 'All Regions', timeZone: 'America/Guatemala' },
    ],
  },
  {
    value: 'GN',
    label: 'Guinea',
    states: [
      { value: 'GN-ALL', label: 'All Regions', timeZone: 'Africa/Conakry' },
    ],
  },
  {
    value: 'GW',
    label: 'Guinea-Bissau',
    states: [
      { value: 'GW-ALL', label: 'All Regions', timeZone: 'Africa/Bissau' },
    ],
  },
  {
    value: 'GY',
    label: 'Guyana',
    states: [
      { value: 'GY-ALL', label: 'All Regions', timeZone: 'America/Guyana' },
    ],
  },
  {
    value: 'HT',
    label: 'Haiti',
    states: [
      {
        value: 'HT-ALL',
        label: 'All Regions',
        timeZone: 'America/Port-au-Prince',
      },
    ],
  },
  {
    value: 'HN',
    label: 'Honduras',
    states: [
      {
        value: 'HN-ALL',
        label: 'All Regions',
        timeZone: 'America/Tegucigalpa',
      },
    ],
  },
  {
    value: 'HU',
    label: 'Hungary',
    states: [
      { value: 'HU-ALL', label: 'All Regions', timeZone: 'Europe/Budapest' },
    ],
  },
  {
    value: 'IS',
    label: 'Iceland',
    states: [
      { value: 'IS-ALL', label: 'All Regions', timeZone: 'Atlantic/Reykjavik' },
    ],
  },
  {
    value: 'ID',
    label: 'Indonesia',
    states: [
      { value: 'ID-ALL', label: 'All Regions', timeZone: 'Asia/Jakarta' },
    ],
  },
  {
    value: 'IR',
    label: 'Iran',
    states: [
      { value: 'IR-ALL', label: 'All Regions', timeZone: 'Asia/Tehran' },
    ],
  },
  {
    value: 'IQ',
    label: 'Iraq',
    states: [
      { value: 'IQ-ALL', label: 'All Regions', timeZone: 'Asia/Baghdad' },
    ],
  },
  {
    value: 'IE',
    label: 'Ireland',
    states: [
      { value: 'IE-ALL', label: 'All Regions', timeZone: 'Europe/Dublin' },
    ],
  },
  {
    value: 'IL',
    label: 'Israel',
    states: [
      { value: 'IL-ALL', label: 'All Regions', timeZone: 'Asia/Jerusalem' },
    ],
  },
  {
    value: 'IT',
    label: 'Italy',
    states: [
      { value: 'IT-ALL', label: 'All Regions', timeZone: 'Europe/Rome' },
    ],
  },
  {
    value: 'JM',
    label: 'Jamaica',
    states: [
      { value: 'JM-ALL', label: 'All Regions', timeZone: 'America/Jamaica' },
    ],
  },
  {
    value: 'JO',
    label: 'Jordan',
    states: [{ value: 'JO-ALL', label: 'All Regions', timeZone: 'Asia/Amman' }],
  },
  {
    value: 'KZ',
    label: 'Kazakhstan',
    states: [
      { value: 'KZ-ALL', label: 'All Regions', timeZone: 'Asia/Almaty' },
    ],
  },
  {
    value: 'KE',
    label: 'Kenya',
    states: [
      { value: 'KE-ALL', label: 'All Regions', timeZone: 'Africa/Nairobi' },
    ],
  },
  {
    value: 'KI',
    label: 'Kiribati',
    states: [
      { value: 'KI-ALL', label: 'All Regions', timeZone: 'Pacific/Tarawa' },
    ],
  },
  {
    value: 'KP',
    label: 'Korea, Democratic People’s Republic of',
    states: [
      { value: 'KP-ALL', label: 'All Regions', timeZone: 'Asia/Pyongyang' },
    ],
  },
  {
    value: 'KR',
    label: 'Korea, Republic of',
    states: [{ value: 'KR-ALL', label: 'All Regions', timeZone: 'Asia/Seoul' }],
  },
  {
    value: 'KW',
    label: 'Kuwait',
    states: [
      { value: 'KW-ALL', label: 'All Regions', timeZone: 'Asia/Kuwait' },
    ],
  },
  {
    value: 'KG',
    label: 'Kyrgyzstan',
    states: [
      { value: 'KG-ALL', label: 'All Regions', timeZone: 'Asia/Bishkek' },
    ],
  },
  {
    value: 'LA',
    label: 'Lao People’s Democratic Republic',
    states: [
      { value: 'LA-ALL', label: 'All Regions', timeZone: 'Asia/Vientiane' },
    ],
  },
  {
    value: 'LV',
    label: 'Latvia',
    states: [
      { value: 'LV-ALL', label: 'All Regions', timeZone: 'Europe/Riga' },
    ],
  },
  {
    value: 'LB',
    label: 'Lebanon',
    states: [
      { value: 'LB-ALL', label: 'All Regions', timeZone: 'Asia/Beirut' },
    ],
  },
  {
    value: 'LS',
    label: 'Lesotho',
    states: [
      { value: 'LS-ALL', label: 'All Regions', timeZone: 'Africa/Maseru' },
    ],
  },
  {
    value: 'LR',
    label: 'Liberia',
    states: [
      { value: 'LR-ALL', label: 'All Regions', timeZone: 'Africa/Monrovia' },
    ],
  },
  {
    value: 'LY',
    label: 'Libya',
    states: [
      { value: 'LY-ALL', label: 'All Regions', timeZone: 'Africa/Tripoli' },
    ],
  },
  {
    value: 'LI',
    label: 'Liechtenstein',
    states: [
      { value: 'LI-ALL', label: 'All Regions', timeZone: 'Europe/Vaduz' },
    ],
  },
  {
    value: 'LT',
    label: 'Lithuania',
    states: [
      { value: 'LT-ALL', label: 'All Regions', timeZone: 'Europe/Vilnius' },
    ],
  },
  {
    value: 'LU',
    label: 'Luxembourg',
    states: [
      { value: 'LU-ALL', label: 'All Regions', timeZone: 'Europe/Luxembourg' },
    ],
  },
  {
    value: 'MG',
    label: 'Madagascar',
    states: [
      {
        value: 'MG-ALL',
        label: 'All Regions',
        timeZone: 'Indian/Antananarivo',
      },
    ],
  },
  {
    value: 'MW',
    label: 'Malawi',
    states: [
      { value: 'MW-ALL', label: 'All Regions', timeZone: 'Africa/Blantyre' },
    ],
  },
  {
    value: 'MY',
    label: 'Malaysia',
    states: [
      { value: 'MY-ALL', label: 'All Regions', timeZone: 'Asia/Kuala_Lumpur' },
    ],
  },
  {
    value: 'MV',
    label: 'Maldives',
    states: [
      { value: 'MV-ALL', label: 'All Regions', timeZone: 'Indian/Maldives' },
    ],
  },
  {
    value: 'ML',
    label: 'Mali',
    states: [
      { value: 'ML-ALL', label: 'All Regions', timeZone: 'Africa/Bamako' },
    ],
  },
  {
    value: 'MT',
    label: 'Malta',
    states: [
      { value: 'MT-ALL', label: 'All Regions', timeZone: 'Europe/Malta' },
    ],
  },
  {
    value: 'MH',
    label: 'Marshall Islands',
    states: [
      { value: 'MH-ALL', label: 'All Regions', timeZone: 'Pacific/Majuro' },
    ],
  },
  {
    value: 'MR',
    label: 'Mauritania',
    states: [
      { value: 'MR-ALL', label: 'All Regions', timeZone: 'Africa/Nouakchott' },
    ],
  },
  {
    value: 'MU',
    label: 'Mauritius',
    states: [
      { value: 'MU-ALL', label: 'All Regions', timeZone: 'Indian/Mauritius' },
    ],
  },
  {
    value: 'MX',
    label: 'Mexico',
    states: [
      {
        value: 'MX-ALL',
        label: 'All Regions',
        timeZone: 'America/Mexico_City',
      },
    ],
  },
  {
    value: 'FM',
    label: 'Micronesia (Federated States of)',
    states: [
      { value: 'FM-ALL', label: 'All Regions', timeZone: 'Pacific/Pohnpei' },
    ],
  },
  {
    value: 'MD',
    label: 'Moldova',
    states: [
      { value: 'MD-ALL', label: 'All Regions', timeZone: 'Europe/Chisinau' },
    ],
  },
  {
    value: 'MC',
    label: 'Monaco',
    states: [
      { value: 'MC-ALL', label: 'All Regions', timeZone: 'Europe/Monaco' },
    ],
  },
  {
    value: 'MN',
    label: 'Mongolia',
    states: [
      { value: 'MN-ALL', label: 'All Regions', timeZone: 'Asia/Ulaanbaatar' },
    ],
  },
  {
    value: 'ME',
    label: 'Montenegro',
    states: [
      { value: 'ME-ALL', label: 'All Regions', timeZone: 'Europe/Podgorica' },
    ],
  },
  {
    value: 'MA',
    label: 'Morocco',
    states: [
      { value: 'MA-ALL', label: 'All Regions', timeZone: 'Africa/Casablanca' },
    ],
  },
  {
    value: 'MZ',
    label: 'Mozambique',
    states: [
      { value: 'MZ-ALL', label: 'All Regions', timeZone: 'Africa/Maputo' },
    ],
  },
  {
    value: 'MM',
    label: 'Myanmar',
    states: [
      { value: 'MM-ALL', label: 'All Regions', timeZone: 'Asia/Yangon' },
    ],
  },
  {
    value: 'NA',
    label: 'Namibia',
    states: [
      { value: 'NA-ALL', label: 'All Regions', timeZone: 'Africa/Windhoek' },
    ],
  },
  {
    value: 'NR',
    label: 'Nauru',
    states: [
      { value: 'NR-ALL', label: 'All Regions', timeZone: 'Pacific/Nauru' },
    ],
  },
  {
    value: 'NP',
    label: 'Nepal',
    states: [
      { value: 'NP-ALL', label: 'All Regions', timeZone: 'Asia/Kathmandu' },
    ],
  },
  {
    value: 'NL',
    label: 'Netherlands',
    states: [
      { value: 'NL-ALL', label: 'All Regions', timeZone: 'Europe/Amsterdam' },
    ],
  },
  {
    value: 'NZ',
    label: 'New Zealand',
    states: [
      { value: 'NZ-ALL', label: 'All Regions', timeZone: 'Pacific/Auckland' },
    ],
  },
  {
    value: 'NI',
    label: 'Nicaragua',
    states: [
      { value: 'NI-ALL', label: 'All Regions', timeZone: 'America/Managua' },
    ],
  },
  {
    value: 'NE',
    label: 'Niger',
    states: [
      { value: 'NE-ALL', label: 'All Regions', timeZone: 'Africa/Niamey' },
    ],
  },
  {
    value: 'NG',
    label: 'Nigeria',
    states: [
      { value: 'NG-ALL', label: 'All Regions', timeZone: 'Africa/Lagos' },
    ],
  },
  {
    value: 'NO',
    label: 'Norway',
    states: [
      { value: 'NO-ALL', label: 'All Regions', timeZone: 'Europe/Oslo' },
    ],
  },
  {
    value: 'OM',
    label: 'Oman',
    states: [
      { value: 'OM-ALL', label: 'All Regions', timeZone: 'Asia/Muscat' },
    ],
  },
  {
    value: 'PK',
    label: 'Pakistan',
    states: [
      { value: 'PK-ALL', label: 'All Regions', timeZone: 'Asia/Karachi' },
    ],
  },
  {
    value: 'PW',
    label: 'Palau',
    states: [
      { value: 'PW-ALL', label: 'All Regions', timeZone: 'Pacific/Palau' },
    ],
  },
  {
    value: 'PA',
    label: 'Panama',
    states: [
      { value: 'PA-ALL', label: 'All Regions', timeZone: 'America/Panama' },
    ],
  },
  {
    value: 'PG',
    label: 'Papua New Guinea',
    states: [
      {
        value: 'PG-ALL',
        label: 'All Regions',
        timeZone: 'Pacific/Port_Moresby',
      },
    ],
  },
  {
    value: 'PY',
    label: 'Paraguay',
    states: [
      { value: 'PY-ALL', label: 'All Regions', timeZone: 'America/Asuncion' },
    ],
  },
  {
    value: 'PE',
    label: 'Peru',
    states: [
      { value: 'PE-ALL', label: 'All Regions', timeZone: 'America/Lima' },
    ],
  },
  {
    value: 'PH',
    label: 'Philippines',
    states: [
      { value: 'PH-ALL', label: 'All Regions', timeZone: 'Asia/Manila' },
    ],
  },
  {
    value: 'PL',
    label: 'Poland',
    states: [
      { value: 'PL-ALL', label: 'All Regions', timeZone: 'Europe/Warsaw' },
    ],
  },
  {
    value: 'PT',
    label: 'Portugal',
    states: [
      { value: 'PT-ALL', label: 'All Regions', timeZone: 'Europe/Lisbon' },
    ],
  },
  {
    value: 'QA',
    label: 'Qatar',
    states: [{ value: 'QA-ALL', label: 'All Regions', timeZone: 'Asia/Qatar' }],
  },
  {
    value: 'RO',
    label: 'Romania',
    states: [
      { value: 'RO-ALL', label: 'All Regions', timeZone: 'Europe/Bucharest' },
    ],
  },
  {
    value: 'RW',
    label: 'Rwanda',
    states: [
      { value: 'RW-ALL', label: 'All Regions', timeZone: 'Africa/Kigali' },
    ],
  },
  {
    value: 'KN',
    label: 'Saint Kitts and Nevis',
    states: [
      { value: 'KN-ALL', label: 'All Regions', timeZone: 'America/St_Kitts' },
    ],
  },
  {
    value: 'LC',
    label: 'Saint Lucia',
    states: [
      { value: 'LC-ALL', label: 'All Regions', timeZone: 'America/St_Lucia' },
    ],
  },
  {
    value: 'VC',
    label: 'Saint Vincent and the Grenadines',
    states: [
      { value: 'VC-ALL', label: 'All Regions', timeZone: 'America/St_Vincent' },
    ],
  },
  {
    value: 'WS',
    label: 'Samoa',
    states: [
      { value: 'WS-ALL', label: 'All Regions', timeZone: 'Pacific/Apia' },
    ],
  },
  {
    value: 'SM',
    label: 'San Marino',
    states: [
      { value: 'SM-ALL', label: 'All Regions', timeZone: 'Europe/San_Marino' },
    ],
  },
  {
    value: 'ST',
    label: 'Sao Tome and Principe',
    states: [
      { value: 'ST-ALL', label: 'All Regions', timeZone: 'Africa/Sao_Tome' },
    ],
  },
  {
    value: 'SA',
    label: 'Saudi Arabia',
    states: [
      { value: 'SA-ALL', label: 'All Regions', timeZone: 'Asia/Riyadh' },
    ],
  },
  {
    value: 'SN',
    label: 'Senegal',
    states: [
      { value: 'SN-ALL', label: 'All Regions', timeZone: 'Africa/Dakar' },
    ],
  },
  {
    value: 'RS',
    label: 'Serbia',
    states: [
      { value: 'RS-ALL', label: 'All Regions', timeZone: 'Europe/Belgrade' },
    ],
  },
  {
    value: 'SC',
    label: 'Seychelles',
    states: [
      { value: 'SC-ALL', label: 'All Regions', timeZone: 'Indian/Mahe' },
    ],
  },
  {
    value: 'SL',
    label: 'Sierra Leone',
    states: [
      { value: 'SL-ALL', label: 'All Regions', timeZone: 'Africa/Freetown' },
    ],
  },
  {
    value: 'SG',
    label: 'Singapore',
    states: [
      { value: 'SG-ALL', label: 'All Regions', timeZone: 'Asia/Singapore' },
    ],
  },
  {
    value: 'SK',
    label: 'Slovakia',
    states: [
      { value: 'SK-ALL', label: 'All Regions', timeZone: 'Europe/Bratislava' },
    ],
  },
  {
    value: 'SI',
    label: 'Slovenia',
    states: [
      { value: 'SI-ALL', label: 'All Regions', timeZone: 'Europe/Ljubljana' },
    ],
  },
  {
    value: 'SB',
    label: 'Solomon Islands',
    states: [
      {
        value: 'SB-ALL',
        label: 'All Regions',
        timeZone: 'Pacific/Guadalcanal',
      },
    ],
  },
  {
    value: 'SO',
    label: 'Somalia',
    states: [
      { value: 'SO-ALL', label: 'All Regions', timeZone: 'Africa/Mogadishu' },
    ],
  },
  {
    value: 'SS',
    label: 'South Sudan',
    states: [
      { value: 'SS-ALL', label: 'All Regions', timeZone: 'Africa/Juba' },
    ],
  },
  {
    value: 'ES',
    label: 'Spain',
    states: [
      { value: 'ES-ALL', label: 'All Regions', timeZone: 'Europe/Madrid' },
    ],
  },
  {
    value: 'LK',
    label: 'Sri Lanka',
    states: [
      { value: 'LK-ALL', label: 'All Regions', timeZone: 'Asia/Colombo' },
    ],
  },
  {
    value: 'SD',
    label: 'Sudan',
    states: [
      { value: 'SD-ALL', label: 'All Regions', timeZone: 'Africa/Khartoum' },
    ],
  },
  {
    value: 'SR',
    label: 'Suriname',
    states: [
      { value: 'SR-ALL', label: 'All Regions', timeZone: 'America/Paramaribo' },
    ],
  },
  {
    value: 'SE',
    label: 'Sweden',
    states: [
      { value: 'SE-ALL', label: 'All Regions', timeZone: 'Europe/Stockholm' },
    ],
  },
  {
    value: 'CH',
    label: 'Switzerland',
    states: [
      { value: 'CH-ALL', label: 'All Regions', timeZone: 'Europe/Zurich' },
    ],
  },
  {
    value: 'SY',
    label: 'Syrian Arab Republic',
    states: [
      { value: 'SY-ALL', label: 'All Regions', timeZone: 'Asia/Damascus' },
    ],
  },
  {
    value: 'TJ',
    label: 'Tajikistan',
    states: [
      { value: 'TJ-ALL', label: 'All Regions', timeZone: 'Asia/Dushanbe' },
    ],
  },
  {
    value: 'TZ',
    label: 'Tanzania, United Republic of',
    states: [
      {
        value: 'TZ-ALL',
        label: 'All Regions',
        timeZone: 'Africa/Dar_es_Salaam',
      },
    ],
  },
  {
    value: 'TH',
    label: 'Thailand',
    states: [
      { value: 'TH-ALL', label: 'All Regions', timeZone: 'Asia/Bangkok' },
    ],
  },
  {
    value: 'TL',
    label: 'Timor-Leste',
    states: [{ value: 'TL-ALL', label: 'All Regions', timeZone: 'Asia/Dili' }],
  },
  {
    value: 'TG',
    label: 'Togo',
    states: [
      { value: 'TG-ALL', label: 'All Regions', timeZone: 'Africa/Lome' },
    ],
  },
  {
    value: 'TO',
    label: 'Tonga',
    states: [
      { value: 'TO-ALL', label: 'All Regions', timeZone: 'Pacific/Tongatapu' },
    ],
  },
  {
    value: 'TT',
    label: 'Trinidad and Tobago',
    states: [
      {
        value: 'TT-ALL',
        label: 'All Regions',
        timeZone: 'America/Port_of_Spain',
      },
    ],
  },
  {
    value: 'TN',
    label: 'Tunisia',
    states: [
      { value: 'TN-ALL', label: 'All Regions', timeZone: 'Africa/Tunis' },
    ],
  },
  {
    value: 'TR',
    label: 'Turkey',
    states: [
      { value: 'TR-ALL', label: 'All Regions', timeZone: 'Europe/Istanbul' },
    ],
  },
  {
    value: 'TM',
    label: 'Turkmenistan',
    states: [
      { value: 'TM-ALL', label: 'All Regions', timeZone: 'Asia/Ashgabat' },
    ],
  },
  {
    value: 'TV',
    label: 'Tuvalu',
    states: [
      { value: 'TV-ALL', label: 'All Regions', timeZone: 'Pacific/Funafuti' },
    ],
  },
  {
    value: 'UG',
    label: 'Uganda',
    states: [
      { value: 'UG-ALL', label: 'All Regions', timeZone: 'Africa/Kampala' },
    ],
  },
  {
    value: 'UA',
    label: 'Ukraine',
    states: [
      { value: 'UA-ALL', label: 'All Regions', timeZone: 'Europe/Kiev' },
    ],
  },
  {
    value: 'UY',
    label: 'Uruguay',
    states: [
      { value: 'UY-ALL', label: 'All Regions', timeZone: 'America/Montevideo' },
    ],
  },
  {
    value: 'UZ',
    label: 'Uzbekistan',
    states: [
      { value: 'UZ-ALL', label: 'All Regions', timeZone: 'Asia/Tashkent' },
    ],
  },
  {
    value: 'VU',
    label: 'Vanuatu',
    states: [
      { value: 'VU-ALL', label: 'All Regions', timeZone: 'Pacific/Efate' },
    ],
  },
  {
    value: 'VE',
    label: 'Venezuela',
    states: [
      { value: 'VE-ALL', label: 'All Regions', timeZone: 'America/Caracas' },
    ],
  },
  {
    value: 'VN',
    label: 'Viet Nam',
    states: [
      { value: 'VN-ALL', label: 'All Regions', timeZone: 'Asia/Ho_Chi_Minh' },
    ],
  },
  {
    value: 'YE',
    label: 'Yemen',
    states: [{ value: 'YE-ALL', label: 'All Regions', timeZone: 'Asia/Aden' }],
  },
  {
    value: 'ZM',
    label: 'Zambia',
    states: [
      { value: 'ZM-ALL', label: 'All Regions', timeZone: 'Africa/Lusaka' },
    ],
  },
  {
    value: 'ZW',
    label: 'Zimbabwe',
    states: [
      { value: 'ZW-ALL', label: 'All Regions', timeZone: 'Africa/Harare' },
    ],
  },
];
