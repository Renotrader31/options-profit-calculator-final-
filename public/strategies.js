// Options Strategies Definitions and Calculations

class OptionsStrategies {
    constructor() {
        this.blackScholes = new BlackScholes();
        this.strategies = {
            'long-call': {
                name: 'Long Call',
                description: 'Bullish strategy. Buy a call option expecting the stock price to rise above the strike price.',
                riskLevel: 'Low',
                complexity: 'Beginner',
                legs: [
                    { action: 'Buy', type: 'Call', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            },
            'long-put': {
                name: 'Long Put',
                description: 'Bearish strategy. Buy a put option expecting the stock price to fall below the strike price.',
                riskLevel: 'Low',
                complexity: 'Beginner',
                legs: [
                    { action: 'Buy', type: 'Put', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            },
            'short-call': {
                name: 'Short Call',
                description: 'Bearish strategy. Sell a call option expecting the stock price to stay below the strike price.',
                riskLevel: 'High',
                complexity: 'Intermediate',
                legs: [
                    { action: 'Sell', type: 'Call', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            },
            'short-put': {
                name: 'Short Put',
                description: 'Bullish strategy. Sell a put option expecting the stock price to stay above the strike price.',
                riskLevel: 'High',
                complexity: 'Intermediate',
                legs: [
                    { action: 'Sell', type: 'Put', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            },
            'long-straddle': {
                name: 'Long Straddle',
                description: 'Neutral strategy expecting high volatility. Buy both call and put at the same strike price.',
                riskLevel: 'Medium',
                complexity: 'Intermediate',
                legs: [
                    { action: 'Buy', type: 'Call', defaultStrike: 0, defaultPremium: 0, quantity: 1 },
                    { action: 'Buy', type: 'Put', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            },
            'short-straddle': {
                name: 'Short Straddle',
                description: 'Neutral strategy expecting low volatility. Sell both call and put at the same strike price.',
                riskLevel: 'High',
                complexity: 'Advanced',
                legs: [
                    { action: 'Sell', type: 'Call', defaultStrike: 0, defaultPremium: 0, quantity: 1 },
                    { action: 'Sell', type: 'Put', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            },
            'long-strangle': {
                name: 'Long Strangle',
                description: 'Neutral strategy expecting high volatility. Buy call and put at different strike prices.',
                riskLevel: 'Medium',
                complexity: 'Intermediate',
                legs: [
                    { action: 'Buy', type: 'Call', defaultStrike: 0, defaultPremium: 0, quantity: 1 },
                    { action: 'Buy', type: 'Put', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            },
            'short-strangle': {
                name: 'Short Strangle',
                description: 'Neutral strategy expecting low volatility. Sell call and put at different strike prices.',
                riskLevel: 'High',
                complexity: 'Advanced',
                legs: [
                    { action: 'Sell', type: 'Call', defaultStrike: 0, defaultPremium: 0, quantity: 1 },
                    { action: 'Sell', type: 'Put', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            },
            'bull-call-spread': {
                name: 'Bull Call Spread',
                description: 'Moderately bullish strategy. Buy lower strike call, sell higher strike call.',
                riskLevel: 'Medium',
                complexity: 'Intermediate',
                legs: [
                    { action: 'Buy', type: 'Call', defaultStrike: 0, defaultPremium: 0, quantity: 1 },
                    { action: 'Sell', type: 'Call', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            },
            'bear-call-spread': {
                name: 'Bear Call Spread',
                description: 'Moderately bearish strategy. Sell lower strike call, buy higher strike call.',
                riskLevel: 'Medium',
                complexity: 'Intermediate',
                legs: [
                    { action: 'Sell', type: 'Call', defaultStrike: 0, defaultPremium: 0, quantity: 1 },
                    { action: 'Buy', type: 'Call', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            },
            'bull-put-spread': {
                name: 'Bull Put Spread',
                description: 'Moderately bullish strategy. Sell higher strike put, buy lower strike put.',
                riskLevel: 'Medium',
                complexity: 'Intermediate',
                legs: [
                    { action: 'Sell', type: 'Put', defaultStrike: 0, defaultPremium: 0, quantity: 1 },
                    { action: 'Buy', type: 'Put', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            },
            'bear-put-spread': {
                name: 'Bear Put Spread',
                description: 'Moderately bearish strategy. Buy higher strike put, sell lower strike put.',
                riskLevel: 'Medium',
                complexity: 'Intermediate',
                legs: [
                    { action: 'Buy', type: 'Put', defaultStrike: 0, defaultPremium: 0, quantity: 1 },
                    { action: 'Sell', type: 'Put', defaultStrike: 0, defaultPremium: 0, quantity: 1 }
                ]
            }
        };
    }

    getStrategy(strategyKey) {
        return this.strategies[strategyKey];
    }

    getAllStrategies() {
        return this.strategies;
    }

    // Set default strikes based on current stock price
    setDefaultStrikes(strategyKey, currentPrice) {
        const strategy = this.strategies[strategyKey];
        if (!strategy) return strategy;

        const updatedStrategy = JSON.parse(JSON.stringify(strategy)); // Deep clone

        switch (strategyKey) {
            case 'long-call':
            case 'short-call':
                updatedStrategy.legs[0].defaultStrike = Math.round(currentPrice * 1.05);
                break;
                
            case 'long-put':
            case 'short-put':
                updatedStrategy.legs[0].defaultStrike = Math.round(currentPrice * 0.95);
                break;
                
            case 'long-straddle':
            case 'short-straddle':
                updatedStrategy.legs[0].defaultStrike = Math.round(currentPrice);
                updatedStrategy.legs[1].defaultStrike = Math.round(currentPrice);
                break;
                
            case 'long-strangle':
            case 'short-strangle':
                updatedStrategy.legs[0].defaultStrike = Math.round(currentPrice * 1.05); // Call
                updatedStrategy.legs[1].defaultStrike = Math.round(currentPrice * 0.95); // Put
                break;
                
            case 'bull-call-spread':
                updatedStrategy.legs[0].defaultStrike = Math.round(currentPrice * 1.02); // Buy lower
                updatedStrategy.legs[1].defaultStrike = Math.round(currentPrice * 1.08); // Sell higher
                break;
                
            case 'bear-call-spread':
                updatedStrategy.legs[0].defaultStrike = Math.round(currentPrice * 1.02); // Sell lower
                updatedStrategy.legs[1].defaultStrike = Math.round(currentPrice * 1.08); // Buy higher
                break;
                
            case 'bull-put-spread':
                updatedStrategy.legs[0].defaultStrike = Math.round(currentPrice * 0.95); // Sell higher
                updatedStrategy.legs[1].defaultStrike = Math.round(currentPrice * 0.90); // Buy lower
                break;
                
            case 'bear-put-spread':
                updatedStrategy.legs[0].defaultStrike = Math.round(currentPrice * 0.95); // Buy higher
                updatedStrategy.legs[1].defaultStrike = Math.round(currentPrice * 0.90); // Sell lower
                break;
        }

        return updatedStrategy;
    }

    // Calculate profit/loss for a single leg
    calculateLegPL(leg, spotPrices, marketParams) {
        const { strike, premium, quantity, action, type } = leg;
        const { riskFreeRate, timeToExpiration, volatility } = marketParams;
        
        return spotPrices.map(spotPrice => {
            let optionValue;
            
            if (timeToExpiration <= 0) {
                // At expiration
                if (type === 'Call') {
                    optionValue = Math.max(spotPrice - strike, 0);
                } else {
                    optionValue = Math.max(strike - spotPrice, 0);
                }
            } else {
                // Before expiration - use Black-Scholes
                const isCall = type === 'Call';
                optionValue = isCall ? 
                    this.blackScholes.calculateCallPrice(spotPrice, strike, riskFreeRate, timeToExpiration, volatility) :
                    this.blackScholes.calculatePutPrice(spotPrice, strike, riskFreeRate, timeToExpiration, volatility);
            }
            
            let legPL;
            if (action === 'Buy') {
                legPL = (optionValue - premium) * quantity * 100; // *100 for contract multiplier
            } else { // Sell
                legPL = (premium - optionValue) * quantity * 100; // *100 for contract multiplier
            }
            
            return legPL;
        });
    }

    // Calculate total P&L for entire strategy
    calculateStrategyPL(legs, spotPrices, marketParams) {
        if (!legs || legs.length === 0) return spotPrices.map(() => 0);
        
        const totalPL = spotPrices.map(() => 0);
        
        legs.forEach(leg => {
            if (leg.strike && leg.premium !== null && leg.quantity) {
                const legPLs = this.calculateLegPL(leg, spotPrices, marketParams);
                legPLs.forEach((pl, index) => {
                    totalPL[index] += pl;
                });
            }
        });
        
        return totalPL;
    }

    // Calculate key metrics (max profit, max loss, breakevens)
    calculateKeyMetrics(legs, marketParams) {
        const currentPrice = marketParams.currentPrice;
        const priceRange = [];
        const step = currentPrice * 0.01; // 1% steps
        
        // Generate price range from 50% below to 50% above current price
        for (let price = currentPrice * 0.5; price <= currentPrice * 1.5; price += step) {
            priceRange.push(price);
        }
        
        const pls = this.calculateStrategyPL(legs, priceRange, {
            ...marketParams,
            timeToExpiration: 0 // At expiration for key metrics
        });
        
        const maxProfit = Math.max(...pls);
        const maxLoss = Math.min(...pls);
        
        // Find breakeven points (where P&L crosses zero)
        const breakevens = [];
        for (let i = 0; i < pls.length - 1; i++) {
            if ((pls[i] <= 0 && pls[i + 1] >= 0) || (pls[i] >= 0 && pls[i + 1] <= 0)) {
                // Linear interpolation to find exact breakeven
                const ratio = Math.abs(pls[i]) / (Math.abs(pls[i]) + Math.abs(pls[i + 1]));
                const breakeven = priceRange[i] + (priceRange[i + 1] - priceRange[i]) * ratio;
                breakevens.push(breakeven);
            }
        }
        
        // Calculate total cost (net premium paid/received)
        const totalCost = legs.reduce((sum, leg) => {
            if (leg.strike && leg.premium !== null && leg.quantity) {
                const cost = leg.action === 'Buy' ? 
                    leg.premium * leg.quantity * 100 : 
                    -leg.premium * leg.quantity * 100;
                return sum + cost;
            }
            return sum;
        }, 0);
        
        return {
            maxProfit: maxProfit === Infinity ? 'Unlimited' : maxProfit,
            maxLoss: maxLoss === -Infinity ? 'Unlimited' : Math.abs(maxLoss),
            breakevens: breakevens,
            totalCost: totalCost
        };
    }

    // Calculate combined Greeks for the entire strategy
    calculateStrategyGreeks(legs, marketParams) {
        let totalDelta = 0, totalGamma = 0, totalTheta = 0, totalVega = 0;
        
        legs.forEach(leg => {
            if (leg.strike && leg.premium !== null && leg.quantity) {
                const { strike, quantity, action, type } = leg;
                const { currentPrice, riskFreeRate, timeToExpiration, volatility } = marketParams;
                
                const isCall = type === 'Call';
                const multiplier = action === 'Buy' ? 1 : -1;
                
                const metrics = this.blackScholes.calculateAllMetrics(
                    currentPrice, strike, riskFreeRate, timeToExpiration, volatility, isCall
                );
                
                totalDelta += metrics.delta * multiplier * quantity;
                totalGamma += metrics.gamma * multiplier * quantity;
                totalTheta += metrics.theta * multiplier * quantity;
                totalVega += metrics.vega * multiplier * quantity;
            }
        });
        
        return {
            delta: totalDelta,
            gamma: totalGamma,
            theta: totalTheta,
            vega: totalVega
        };
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptionsStrategies;
} else {
    window.OptionsStrategies = OptionsStrategies;
}
