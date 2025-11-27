import pandas as pd
import numpy as np

def detect_candlestick_patterns(df):
    patterns = []
    
    # Get last few candles
    if len(df) < 3:
        return patterns
    
    last = df.iloc[-1]
    prev = df.iloc[-2]
    prev2 = df.iloc[-3] if len(df) >= 3 else None
    
    body = abs(last['close'] - last['open'])
    upper_shadow = last['high'] - max(last['open'], last['close'])
    lower_shadow = min(last['open'], last['close']) - last['low']
    
    # Hammer
    if lower_shadow > body * 2 and upper_shadow < body * 0.3 and last['close'] > last['open']:
        patterns.append('Hammer')
    
    # Shooting Star
    if upper_shadow > body * 2 and lower_shadow < body * 0.3 and last['close'] < last['open']:
        patterns.append('Shooting Star')
    
    # Doji
    if body < (last['high'] - last['low']) * 0.1:
        patterns.append('Doji')
    
    # Bullish Engulfing
    if (prev['close'] < prev['open'] and 
        last['close'] > last['open'] and
        last['open'] < prev['close'] and 
        last['close'] > prev['open']):
        patterns.append('Bullish Engulfing')
    
    # Bearish Engulfing
    if (prev['close'] > prev['open'] and 
        last['close'] < last['open'] and
        last['open'] > prev['close'] and 
        last['close'] < prev['open']):
        patterns.append('Bearish Engulfing')
    
    # Morning Star (3 candles)
    if prev2 is not None:
        if (prev2['close'] < prev2['open'] and
            abs(prev['close'] - prev['open']) < body * 0.3 and
            last['close'] > last['open'] and
            last['close'] > (prev2['open'] + prev2['close']) / 2):
            patterns.append('Morning Star')
    
    # Pin Bar
    total_range = last['high'] - last['low']
    if total_range > 0:
        if lower_shadow > total_range * 0.6 and body < total_range * 0.3:
            patterns.append('Bullish Pin Bar')
        elif upper_shadow > total_range * 0.6 and body < total_range * 0.3:
            patterns.append('Bearish Pin Bar')
    
    return patterns

def detect_chart_patterns(df):
    patterns = []
    
    if len(df) < 20:
        return patterns
    
    recent = df.tail(20)
    highs = recent['high'].values
    lows = recent['low'].values
    closes = recent['close'].values
    
    # Double Top
    peaks = []
    for i in range(1, len(highs) - 1):
        if highs[i] > highs[i-1] and highs[i] > highs[i+1]:
            peaks.append((i, highs[i]))
    
    if len(peaks) >= 2:
        last_two_peaks = peaks[-2:]
        if abs(last_two_peaks[0][1] - last_two_peaks[1][1]) < last_two_peaks[0][1] * 0.02:
            patterns.append('Double Top')
    
    # Double Bottom
    troughs = []
    for i in range(1, len(lows) - 1):
        if lows[i] < lows[i-1] and lows[i] < lows[i+1]:
            troughs.append((i, lows[i]))
    
    if len(troughs) >= 2:
        last_two_troughs = troughs[-2:]
        if abs(last_two_troughs[0][1] - last_two_troughs[1][1]) < last_two_troughs[0][1] * 0.02:
            patterns.append('Double Bottom')
    
    # Ascending Triangle
    if len(peaks) >= 2 and len(troughs) >= 2:
        if troughs[-1][1] > troughs[-2][1] and abs(peaks[-1][1] - peaks[-2][1]) < peaks[-1][1] * 0.01:
            patterns.append('Ascending Triangle')
    
    # Head and Shoulders (simplified)
    if len(peaks) >= 3:
        if peaks[-2][1] > peaks[-1][1] and peaks[-2][1] > peaks[-3][1]:
            if abs(peaks[-1][1] - peaks[-3][1]) < peaks[-1][1] * 0.02:
                patterns.append('Head and Shoulders')
    
    return patterns
