# 🔍 Search & Analyze ANY Stock - Complete Guide

## ✨ New Feature: Universal Stock Search

You can now search and analyze **ANY stock** listed on NSE or BSE, not just Nifty 50!

---

## 🎯 How to Use

### Method 1: Search Box (Easiest)

1. Open the app: **http://localhost:3002**
2. Look for the **"🔍 Search Any Stock"** section at the top
3. Enter stock symbol (e.g., `INFY`, `TCS`, `ZOMATO`)
4. Click **"Analyze"** button
5. Wait 2-3 seconds for the signal

### Method 2: Quick Analyze Buttons

Click on any of the popular stock buttons:
- INFY (Infosys)
- WIPRO
- TATAMOTORS
- ADANIGREEN
- ZOMATO
- PAYTM
- IRCTC
- And more...

### Method 3: Example Tags

Click on the example tags below the search box to auto-fill the search.

---

## 📝 Search Formats

### Format 1: Symbol Only (Recommended)
```
INFY
TCS
RELIANCE
TATASTEEL
ZOMATO
```
**Note:** Automatically adds `.NS` suffix for NSE

### Format 2: With NSE Suffix
```
INFY.NS
TCS.NS
RELIANCE.NS
```

### Format 3: With BSE Suffix
```
INFY.BO
TCS.BO
RELIANCE.BO
```

---

## 📊 Supported Stocks

### Nifty 50 (50 stocks)
All major blue-chip stocks

### Popular Stocks (50+ additional stocks)

**Banking & Finance:**
- Federal Bank, Bandhan Bank, IDFC First Bank
- Yes Bank, PNB, Bank of Baroda

**New Age Tech:**
- Zomato, Paytm, Nykaa, PolicyBazaar

**Infrastructure:**
- IRCTC, IRFC, RVNL, NBCC

**Adani Group:**
- Adani Green Energy, Adani Transmission
- Adani Power, Adani Total Gas

**Tata Group:**
- Tata Power, Tata Communications
- Tata Elxsi, Voltas

**Metals & Mining:**
- Vedanta, SAIL, NMDC, Jindal Steel

**Pharma:**
- Aurobindo Pharma, Lupin, Biocon, Torrent Pharma

**Auto:**
- TVS Motor, Motherson Sumi, Bosch

**Telecom:**
- Vodafone Idea

**Oil & Gas:**
- Indian Oil, GAIL, Hindustan Petroleum

**Cement:**
- ACC Cement, Ambuja Cements

**Consumer:**
- Dabur, Godrej Consumer, Marico

**Real Estate:**
- DLF, Godrej Properties, Oberoi Realty

**Total: 100+ stocks available!**

---

## 🔥 Example Searches

### Popular Stocks
```
INFY          → Infosys
TCS           → Tata Consultancy Services
RELIANCE      → Reliance Industries
TATAMOTORS    → Tata Motors
ZOMATO        → Zomato
PAYTM         → Paytm
IRCTC         → Indian Railway Catering
ADANIGREEN    → Adani Green Energy
YESBANK       → Yes Bank
VEDL          → Vedanta
```

### Banking Stocks
```
HDFCBANK      → HDFC Bank
ICICIBANK     → ICICI Bank
SBIN          → State Bank of India
AXISBANK      → Axis Bank
KOTAKBANK     → Kotak Mahindra Bank
FEDERALBNK    → Federal Bank
BANDHANBNK    → Bandhan Bank
```

### IT Stocks
```
INFY          → Infosys
TCS           → TCS
WIPRO         → Wipro
HCLTECH       → HCL Technologies
TECHM         → Tech Mahindra
LTIM          → LTIMindtree
MPHASIS       → Mphasis
COFORGE       → Coforge
```

### New Age Stocks
```
ZOMATO        → Zomato
PAYTM         → Paytm
NYKAA         → Nykaa
POLICYBZR     → PolicyBazaar
```

---

## 🎯 What You Get

For ANY stock you search, you'll get:

### 1. Trading Signal
- **BUY** or **SELL** recommendation
- Or **HOLD** if no strong signal

### 2. Entry Price
- Exact price to enter the trade
- In Indian Rupees (₹)

### 3. Stop Loss
- Risk management level
- Based on ATR (Average True Range)
- Typically 1.5% below/above entry

### 4. Three Targets
- **T1:** First target (book 30% profit)
- **T2:** Second target (book 40% profit)
- **T3:** Third target (book 30% profit)

### 5. Confidence Score
- 0-100% confidence level
- Only shows signals above 65%
- Recommended: Trade only 75%+ signals

### 6. Analysis Reason
- Why the signal was generated
- Patterns detected
- Indicators used

### 7. Risk:Reward Ratio
- How much you can gain vs lose
- Minimum 1.2:1 for signals
- Higher is better

---

## 💡 Pro Tips

### Search Tips:
1. **Use uppercase** for better results (e.g., `INFY` not `infy`)
2. **No spaces** in symbol (e.g., `TATAMOTORS` not `TATA MOTORS`)
3. **Try without suffix** first (app adds .NS automatically)
4. **Check spelling** - exact symbol required

### Trading Tips:
1. **Verify the stock** - Make sure it's the right company
2. **Check confidence** - Only trade 75%+ signals
3. **Use stop loss** - Always, no exceptions
4. **Book profits** - Don't be greedy, follow targets
5. **Position sizing** - Never risk more than 2% per trade

---

## 🧪 Test the Search API

### Search for stocks
```bash
curl "http://localhost:5001/api/stocks/search?q=tata"
```

### Get all available stocks
```bash
curl http://localhost:5001/api/stocks/all
```

### Resolve a symbol
```bash
curl http://localhost:5001/api/stocks/resolve/INFY
```

---

## 📈 Example Output

### Search: ZOMATO

```
Stock: Zomato
Symbol: ZOMATO.NS
Sector: Food Tech

Action: BUY
Entry: ₹145.50
Stop Loss: ₹142.80

Targets:
  T1: ₹148.20
  T2: ₹151.00
  T3: ₹155.50

Confidence: 78% Bullish
Risk:Reward: 1.65:1

Analysis: Bullish Engulfing + High Volume + 
          EMA Crossover + Near Support

Patterns Detected:
- Bullish Engulfing
- Ascending Triangle
```

---

## 🚀 Advanced Features

### 1. Auto-Complete (Coming Soon)
Type and get suggestions as you search

### 2. Watchlist (Coming Soon)
Save your favorite stocks for quick access

### 3. Alerts (Coming Soon)
Get notified when a stock meets your criteria

### 4. Historical Signals (Coming Soon)
See past signals and their accuracy

---

## ⚠️ Important Notes

### Data Source:
- **Yahoo Finance API** (free, no key required)
- Real-time data for NSE/BSE
- May have 15-minute delay

### Market Hours:
- **NSE/BSE:** 9:15 AM - 3:30 PM IST
- **Pre-market:** 9:00 AM - 9:15 AM
- **After-market:** 3:40 PM - 4:00 PM

### Limitations:
- Only NSE/BSE listed stocks
- Requires internet connection
- Some stocks may not have enough data
- Penny stocks may not work well

### Disclaimer:
- **Educational purposes only**
- **Not financial advice**
- **Do your own research**
- **Trade at your own risk**

---

## 🐛 Troubleshooting

### "Stock not found"
- Check spelling of symbol
- Try with .NS or .BO suffix
- Verify stock is listed on NSE/BSE
- Some stocks may not be available

### "No strong signal detected"
- Stock doesn't meet criteria
- Try again later
- Market conditions not favorable
- HOLD is recommended

### "Error analyzing stock"
- Check internet connection
- Verify backend is running
- Stock may not have enough data
- Try a different stock

---

## 📚 Stock Symbol Resources

### Find Stock Symbols:
1. **NSE India:** https://www.nseindia.com/
2. **BSE India:** https://www.bseindia.com/
3. **Yahoo Finance:** https://in.finance.yahoo.com/
4. **Moneycontrol:** https://www.moneycontrol.com/

### Symbol Format:
- NSE stocks end with `.NS`
- BSE stocks end with `.BO`
- Example: `INFY.NS` or `INFY.BO`

---

## 🎉 Summary

You can now:
- ✅ Search ANY NSE/BSE stock
- ✅ Get instant Buy/Sell signals
- ✅ See entry, stop loss, targets
- ✅ View confidence scores
- ✅ Analyze 100+ popular stocks
- ✅ Use quick analyze buttons
- ✅ Get detailed pattern analysis

**Start searching and analyzing stocks now!** 🚀📈

---

**Made with ❤️ for Indian traders**
