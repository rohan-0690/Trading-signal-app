from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
from analyzers.pattern_detector import detect_candlestick_patterns, detect_chart_patterns
from analyzers.technical_indicators import calculate_indicators
from analyzers.ai_engine import generate_trading_decision
from analyzers.risk_calculator import calculate_risk_management

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'AI Engine'})

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        symbol = data['symbol']
        timeframe = data['timeframe']
        candles = data['candles']
        
        # Convert to DataFrame
        df = pd.DataFrame(candles)
        df['time'] = pd.to_datetime(df['time'], unit='ms')
        df.set_index('time', inplace=True)
        
        # Detect patterns
        candlestick_patterns = detect_candlestick_patterns(df)
        chart_patterns = detect_chart_patterns(df)
        
        # Calculate indicators
        indicators = calculate_indicators(df)
        
        # Generate AI decision
        decision = generate_trading_decision(df, candlestick_patterns, chart_patterns, indicators)
        
        # Calculate risk management
        risk_mgmt = calculate_risk_management(df, decision)
        
        # Combine results
        result = {
            'symbol': symbol,
            'timeframe': timeframe,
            'signal': decision['signal'],
            'entry': decision['entry'],
            'stopLoss': risk_mgmt['stopLoss'],
            'targets': risk_mgmt['targets'],
            'confidence': decision['confidence'],
            'trend': decision['trend'],
            'reason': decision['reason'],
            'patterns': candlestick_patterns + chart_patterns,
            'indicators': indicators,
            'riskReward': risk_mgmt['riskReward']
        }
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
