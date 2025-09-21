# Options Profit Calculator

A comprehensive, web-based options profit calculator that allows traders to analyze various options strategies with real-time P&L calculations, Black-Scholes pricing, and interactive visualizations.

## 🚀 Live Demo

Deploy to Vercel or any static hosting platform for instant access to your options calculator.

## ✨ Features

### 📊 **Comprehensive Strategy Support**
- **12 Built-in Strategies**: From basic calls/puts to advanced spreads
- **Single Legs**: Long/Short Calls and Puts
- **Volatility Plays**: Long/Short Straddles and Strangles
- **Directional Spreads**: Bull/Bear Call/Put Spreads
- **Custom Parameters**: Fully customizable strikes, premiums, and quantities

### 🧮 **Advanced Calculations**
- **Black-Scholes Pricing Model**: Professional-grade options pricing
- **Real-time P&L Analysis**: Current value vs. expiration scenarios
- **Greeks Calculations**: Delta, Gamma, Theta, Vega for risk management
- **Key Metrics**: Max profit, max loss, breakeven points, total cost
- **Theoretical Premium Calculator**: Auto-calculate fair option values

### 📈 **Interactive Visualizations**
- **Real-time P&L Charts**: Dynamic Chart.js visualizations
- **Dual View**: Compare current value vs. expiration P&L
- **Breakeven Lines**: Visual indicators for breakeven points
- **Current Price Markers**: Track position relative to market
- **Responsive Design**: Works perfectly on all devices

### 💡 **User Experience**
- **Intuitive Interface**: Clean, professional design with Tailwind CSS
- **Smart Defaults**: Auto-populated strikes based on current price
- **Real-time Updates**: Debounced calculations for smooth interaction
- **Educational Content**: Strategy descriptions and risk indicators
- **Input Validation**: Comprehensive error checking and feedback

## 🎯 **Supported Strategies**

| Strategy | Type | Risk Level | Complexity |
|----------|------|------------|------------|
| Long Call | Bullish | Low | Beginner |
| Long Put | Bearish | Low | Beginner |
| Short Call | Bearish | High | Intermediate |
| Short Put | Bullish | High | Intermediate |
| Long Straddle | Neutral/High Vol | Medium | Intermediate |
| Short Straddle | Neutral/Low Vol | High | Advanced |
| Long Strangle | Neutral/High Vol | Medium | Intermediate |
| Short Strangle | Neutral/Low Vol | High | Advanced |
| Bull Call Spread | Moderately Bullish | Medium | Intermediate |
| Bear Call Spread | Moderately Bearish | Medium | Intermediate |
| Bull Put Spread | Moderately Bullish | Medium | Intermediate |
| Bear Put Spread | Moderately Bearish | Medium | Intermediate |

## 🛠️ **How to Use**

### 1. **Select Your Strategy**
Choose from the dropdown menu of 12 pre-configured options strategies.

### 2. **Set Market Parameters**
- **Current Stock Price**: The underlying asset's current market price
- **Volatility**: Implied volatility percentage (typically 15-50%)
- **Risk-Free Rate**: Current risk-free interest rate (e.g., 5%)
- **Days to Expiration**: Time remaining until option expiration

### 3. **Configure Trade Details**
For each option leg:
- **Strike Price**: The option's strike price
- **Premium**: The option's current market price or use "Calc Premium" for theoretical value
- **Quantity**: Number of contracts (default: 1)

### 4. **Analyze Results**
- **P&L Chart**: View profit/loss across different stock price scenarios
- **Key Metrics**: Review maximum profit, maximum loss, and breakeven points
- **Greeks**: Monitor position sensitivity to various market factors

## 💻 **Technical Architecture**

### **Core Components**
- **`index.html`** - Main application interface with Tailwind CSS
- **`black-scholes.js`** - Complete Black-Scholes implementation with Greeks
- **`strategies.js`** - Strategy definitions and P&L calculations
- **`main.js`** - Application controller and UI management

### **Key Technologies**
- **Frontend**: Pure HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS via CDN
- **Charts**: Chart.js for interactive visualizations  
- **Fonts**: Inter font family from Google Fonts
- **Deployment**: Static files ready for any hosting platform

### **Performance Features**
- **Client-side Only**: No server required, runs entirely in browser
- **Debounced Calculations**: Smooth real-time updates without lag
- **Optimized Rendering**: Efficient chart updates and DOM manipulation
- **CDN Assets**: Fast loading from reliable content delivery networks

## 🚀 **Deployment**

### **Quick Deploy to Vercel**
1. Push code to GitHub repository
2. Connect repository to Vercel
3. Deploy automatically (zero configuration needed)

### **Alternative Hosting**
Works on any static hosting platform:
- GitHub Pages
- Netlify
- AWS S3
- Firebase Hosting
- Surge.sh

### **Local Development**
```bash
# Clone repository
git clone your-repo-url
cd options-profit-calculator

# Serve locally (optional)
npx http-server . -p 3000
```

## 📊 **Calculation Methods**

### **Black-Scholes Model**
The calculator uses the complete Black-Scholes formula for European options pricing:

**Call Option**: C = S₀N(d₁) - Ke^(-rT)N(d₂)  
**Put Option**: P = Ke^(-rT)N(-d₂) - S₀N(-d₁)

Where:
- **d₁** = [ln(S₀/K) + (r + σ²/2)T] / (σ√T)
- **d₂** = d₁ - σ√T
- **S₀** = Current stock price
- **K** = Strike price  
- **r** = Risk-free rate
- **T** = Time to expiration
- **σ** = Volatility
- **N()** = Cumulative standard normal distribution

### **Greeks Calculations**
- **Delta**: ∂V/∂S (price sensitivity)
- **Gamma**: ∂²V/∂S² (delta sensitivity)
- **Theta**: ∂V/∂T (time decay)
- **Vega**: ∂V/∂σ (volatility sensitivity)
- **Rho**: ∂V/∂r (interest rate sensitivity)

## 🎓 **Educational Value**

### **Learning Features**
- **Strategy Descriptions**: Understand when and why to use each strategy
- **Risk Indicators**: Clear labeling of complexity and risk levels
- **Visual P&L Analysis**: See exactly how strategies perform
- **Breakeven Visualization**: Understand profit zones and risk areas
- **Greeks Education**: Learn position sensitivities and risk management

### **Use Cases**
- **Options Education**: Learn how different strategies work
- **Trade Planning**: Analyze potential trades before execution
- **Risk Management**: Understand maximum loss scenarios
- **Strategy Comparison**: Compare different approaches to market views
- **Academic Research**: Professional-grade calculations for analysis

## 🔧 **Configuration Options**

### **Customizable Parameters**
- Market parameters (price, volatility, rates, time)
- Option parameters (strikes, premiums, quantities)
- Chart display options (current vs. expiration P&L)
- Strategy selection and leg configuration

### **Advanced Features**
- Theoretical premium calculation using Black-Scholes
- Multi-leg strategy support with unlimited combinations
- Real-time Greek calculations for risk management
- Dynamic chart updates with breakeven and current price markers

## 📱 **Browser Compatibility**

- **Chrome**: 80+ ✅
- **Firefox**: 75+ ✅  
- **Safari**: 13+ ✅
- **Edge**: 80+ ✅
- **Mobile**: iOS Safari, Chrome Mobile ✅

## 🤝 **Contributing**

This is a complete, production-ready options calculator. Potential enhancements:

- **Additional Strategies**: Iron Condor, Butterfly, Calendar Spreads
- **Advanced Greeks**: Second-order Greeks like Charm, Color, Speed
- **Historical Data**: Integration with market data APIs
- **Portfolio Analysis**: Multi-position portfolio Greeks
- **Risk Metrics**: VaR, Expected Shortfall calculations
- **Export Features**: PDF reports, CSV data export

## 📄 **License**

MIT License - Free for commercial and personal use.

## ⚠️ **Disclaimer**

This calculator is for educational and informational purposes only. Options trading involves substantial risk of loss and is not suitable for all investors. Past performance does not guarantee future results. Always consult with a qualified financial advisor before making investment decisions.

---

**Built with ❤️ for options traders and educators**
