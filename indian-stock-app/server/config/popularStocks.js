// Popular Indian stocks beyond Nifty 50
const POPULAR_STOCKS = [
  // Mid-cap IT
  { symbol: 'MPHASIS.NS', name: 'Mphasis', sector: 'IT' },
  { symbol: 'COFORGE.NS', name: 'Coforge', sector: 'IT' },
  { symbol: 'PERSISTENT.NS', name: 'Persistent Systems', sector: 'IT' },
  
  // Banking & Finance
  { symbol: 'FEDERALBNK.NS', name: 'Federal Bank', sector: 'Banking' },
  { symbol: 'BANDHANBNK.NS', name: 'Bandhan Bank', sector: 'Banking' },
  { symbol: 'IDFCFIRSTB.NS', name: 'IDFC First Bank', sector: 'Banking' },
  { symbol: 'YESBANK.NS', name: 'Yes Bank', sector: 'Banking' },
  { symbol: 'PNB.NS', name: 'Punjab National Bank', sector: 'Banking' },
  { symbol: 'BANKBARODA.NS', name: 'Bank of Baroda', sector: 'Banking' },
  
  // New Age Tech
  { symbol: 'ZOMATO.NS', name: 'Zomato', sector: 'Food Tech' },
  { symbol: 'PAYTM.NS', name: 'Paytm', sector: 'Fintech' },
  { symbol: 'NYKAA.NS', name: 'Nykaa', sector: 'E-commerce' },
  { symbol: 'POLICYBZR.NS', name: 'PolicyBazaar', sector: 'Insurtech' },
  
  // Infrastructure & Construction
  { symbol: 'IRCTC.NS', name: 'IRCTC', sector: 'Travel' },
  { symbol: 'IRFC.NS', name: 'IRFC', sector: 'Finance' },
  { symbol: 'RVNL.NS', name: 'Rail Vikas Nigam', sector: 'Infrastructure' },
  { symbol: 'NBCC.NS', name: 'NBCC India', sector: 'Construction' },
  
  // Adani Group
  { symbol: 'ADANIGREEN.NS', name: 'Adani Green Energy', sector: 'Renewable Energy' },
  { symbol: 'ADANITRANS.NS', name: 'Adani Transmission', sector: 'Power' },
  { symbol: 'ADANIPOWER.NS', name: 'Adani Power', sector: 'Power' },
  { symbol: 'ATGL.NS', name: 'Adani Total Gas', sector: 'Gas' },
  
  // Tata Group (Ratan Tata Legacy)
  { symbol: 'TATAPOWER.NS', name: 'Tata Power', sector: 'Power' },
  { symbol: 'TATACOMM.NS', name: 'Tata Communications', sector: 'Telecom' },
  { symbol: 'TATAELXSI.NS', name: 'Tata Elxsi', sector: 'IT' },
  { symbol: 'VOLTAS.NS', name: 'Voltas', sector: 'Consumer Durables' },
  { symbol: 'TRENT.NS', name: 'Trent (Westside)', sector: 'Retail' },
  { symbol: 'TITAN.NS', name: 'Titan Company', sector: 'Jewellery' },
  { symbol: 'TATACHEM.NS', name: 'Tata Chemicals', sector: 'Chemicals' },
  { symbol: 'TATACONSUM.NS', name: 'Tata Consumer Products', sector: 'FMCG' },
  { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', sector: 'Auto' },
  { symbol: 'TATASTEEL.NS', name: 'Tata Steel', sector: 'Steel' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', sector: 'IT' },
  
  // Metals & Mining
  { symbol: 'VEDL.NS', name: 'Vedanta', sector: 'Metals' },
  { symbol: 'SAIL.NS', name: 'SAIL', sector: 'Steel' },
  { symbol: 'NMDC.NS', name: 'NMDC', sector: 'Mining' },
  { symbol: 'JINDALSTEL.NS', name: 'Jindal Steel', sector: 'Steel' },
  
  // Pharma
  { symbol: 'AUROPHARMA.NS', name: 'Aurobindo Pharma', sector: 'Pharma' },
  { symbol: 'LUPIN.NS', name: 'Lupin', sector: 'Pharma' },
  { symbol: 'BIOCON.NS', name: 'Biocon', sector: 'Pharma' },
  { symbol: 'TORNTPHARM.NS', name: 'Torrent Pharma', sector: 'Pharma' },
  
  // Auto
  { symbol: 'BAJAJ-AUTO.NS', name: 'Bajaj Auto', sector: 'Auto' },
  { symbol: 'TVSMOTOR.NS', name: 'TVS Motor', sector: 'Auto' },
  { symbol: 'MOTHERSON.NS', name: 'Motherson Sumi', sector: 'Auto Parts' },
  { symbol: 'BOSCHLTD.NS', name: 'Bosch', sector: 'Auto Parts' },
  
  // Telecom
  { symbol: 'IDEA.NS', name: 'Vodafone Idea', sector: 'Telecom' },
  
  // Oil & Gas
  { symbol: 'IOC.NS', name: 'Indian Oil', sector: 'Oil & Gas' },
  { symbol: 'GAIL.NS', name: 'GAIL', sector: 'Gas' },
  { symbol: 'HINDPETRO.NS', name: 'Hindustan Petroleum', sector: 'Oil & Gas' },
  
  // Cement
  { symbol: 'ACC.NS', name: 'ACC Cement', sector: 'Cement' },
  { symbol: 'AMBUJACEM.NS', name: 'Ambuja Cements', sector: 'Cement' },
  
  // Consumer
  { symbol: 'DABUR.NS', name: 'Dabur India', sector: 'FMCG' },
  { symbol: 'GODREJCP.NS', name: 'Godrej Consumer', sector: 'FMCG' },
  { symbol: 'MARICO.NS', name: 'Marico', sector: 'FMCG' },
  
  // Realty
  { symbol: 'DLF.NS', name: 'DLF', sector: 'Real Estate' },
  { symbol: 'GODREJPROP.NS', name: 'Godrej Properties', sector: 'Real Estate' },
  { symbol: 'OBEROIRLTY.NS', name: 'Oberoi Realty', sector: 'Real Estate' }
];

// Stock symbol aliases for easier search
const STOCK_ALIASES = {
  'INFY': 'INFY.NS',
  'TCS': 'TCS.NS',
  'RELIANCE': 'RELIANCE.NS',
  'HDFCBANK': 'HDFCBANK.NS',
  'ICICIBANK': 'ICICIBANK.NS',
  'SBIN': 'SBIN.NS',
  'WIPRO': 'WIPRO.NS',
  'TATAMOTORS': 'TATAMOTORS.NS',
  'TATASTEEL': 'TATASTEEL.NS',
  'ITC': 'ITC.NS',
  'BHARTIARTL': 'BHARTIARTL.NS',
  'AXISBANK': 'AXISBANK.NS',
  'KOTAKBANK': 'KOTAKBANK.NS',
  'LT': 'LT.NS',
  'MARUTI': 'MARUTI.NS',
  'SUNPHARMA': 'SUNPHARMA.NS',
  'ONGC': 'ONGC.NS',
  'NTPC': 'NTPC.NS',
  'POWERGRID': 'POWERGRID.NS',
  'ULTRACEMCO': 'ULTRACEMCO.NS',
  'ASIANPAINT': 'ASIANPAINT.NS',
  'BAJFINANCE': 'BAJFINANCE.NS',
  'HINDUNILVR': 'HINDUNILVR.NS',
  'TITAN': 'TITAN.NS',
  'NESTLEIND': 'NESTLEIND.NS',
  'ADANIPORTS': 'ADANIPORTS.NS',
  'COALINDIA': 'COALINDIA.NS',
  'DRREDDY': 'DRREDDY.NS',
  'JSWSTEEL': 'JSWSTEEL.NS',
  'INDUSINDBK': 'INDUSINDBK.NS',
  'GRASIM': 'GRASIM.NS',
  'CIPLA': 'CIPLA.NS',
  'EICHERMOT': 'EICHERMOT.NS',
  'DIVISLAB': 'DIVISLAB.NS',
  'BRITANNIA': 'BRITANNIA.NS',
  'APOLLOHOSP': 'APOLLOHOSP.NS',
  'HEROMOTOCO': 'HEROMOTOCO.NS',
  'HINDALCO': 'HINDALCO.NS',
  'BPCL': 'BPCL.NS',
  'SHREECEM': 'SHREECEM.NS',
  'ADANIENT': 'ADANIENT.NS',
  'TATACONSUM': 'TATACONSUM.NS',
  'UPL': 'UPL.NS',
  'SBILIFE': 'SBILIFE.NS',
  'LTIM': 'LTIM.NS',
  'HCLTECH': 'HCLTECH.NS',
  'TECHM': 'TECHM.NS',
  'BAJAJAUTO': 'BAJAJ-AUTO.NS',
  'BAJAJ-AUTO': 'BAJAJ-AUTO.NS',
  'BAJAJAUTO.NS': 'BAJAJ-AUTO.NS',
  'BAJAJ': 'BAJAJ-AUTO.NS',
  'BAJAJFINSV': 'BAJAJFINSV.NS',
  'BAJFINANCE': 'BAJFINANCE.NS',
  'TATAPOWER': 'TATAPOWER.NS',
  'TATACOMM': 'TATACOMM.NS',
  'TATAELXSI': 'TATAELXSI.NS',
  'TRENT': 'TRENT.NS',
  'TATACHEM': 'TATACHEM.NS',
  'TATA': 'TCS.NS',
  'NIFTY': '^NSEI',
  'NIFTY50': '^NSEI',
  'NIFTY-50': '^NSEI',
  'SENSEX': '^BSESN',
  'BANKNIFTY': '^NSEBANK',
  'NIFTYBANK': '^NSEBANK'
};

module.exports = { POPULAR_STOCKS, STOCK_ALIASES };
