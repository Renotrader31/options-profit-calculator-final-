// Black-Scholes Options Pricing Model and Greeks Calculations

class BlackScholes {
    constructor() {
        this.SQRT_2PI = Math.sqrt(2 * Math.PI);
    }

    // Standard normal probability density function
    normalPDF(x) {
        return Math.exp(-0.5 * x * x) / this.SQRT_2PI;
    }

    // Cumulative standard normal distribution
    normalCDF(x) {
        // Approximation using error function
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;

        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x) / Math.sqrt(2.0);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return 0.5 * (1.0 + sign * y);
    }

    // Calculate d1 parameter
    calculateD1(S, K, r, T, sigma) {
        return (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
    }

    // Calculate d2 parameter
    calculateD2(d1, sigma, T) {
        return d1 - sigma * Math.sqrt(T);
    }

    // Calculate Call Option Price
    calculateCallPrice(S, K, r, T, sigma) {
        if (T <= 0) {
            return Math.max(S - K, 0);
        }

        const d1 = this.calculateD1(S, K, r, T, sigma);
        const d2 = this.calculateD2(d1, sigma, T);

        const callPrice = S * this.normalCDF(d1) - K * Math.exp(-r * T) * this.normalCDF(d2);
        return Math.max(callPrice, 0);
    }

    // Calculate Put Option Price
    calculatePutPrice(S, K, r, T, sigma) {
        if (T <= 0) {
            return Math.max(K - S, 0);
        }

        const d1 = this.calculateD1(S, K, r, T, sigma);
        const d2 = this.calculateD2(d1, sigma, T);

        const putPrice = K * Math.exp(-r * T) * this.normalCDF(-d2) - S * this.normalCDF(-d1);
        return Math.max(putPrice, 0);
    }

    // Calculate Delta (price sensitivity to underlying)
    calculateDelta(S, K, r, T, sigma, isCall = true) {
        if (T <= 0) {
            if (isCall) {
                return S > K ? 1 : 0;
            } else {
                return S < K ? -1 : 0;
            }
        }

        const d1 = this.calculateD1(S, K, r, T, sigma);
        
        if (isCall) {
            return this.normalCDF(d1);
        } else {
            return this.normalCDF(d1) - 1;
        }
    }

    // Calculate Gamma (delta sensitivity to underlying)
    calculateGamma(S, K, r, T, sigma) {
        if (T <= 0) return 0;

        const d1 = this.calculateD1(S, K, r, T, sigma);
        return this.normalPDF(d1) / (S * sigma * Math.sqrt(T));
    }

    // Calculate Theta (time decay)
    calculateTheta(S, K, r, T, sigma, isCall = true) {
        if (T <= 0) return 0;

        const d1 = this.calculateD1(S, K, r, T, sigma);
        const d2 = this.calculateD2(d1, sigma, T);

        const term1 = -S * this.normalPDF(d1) * sigma / (2 * Math.sqrt(T));
        
        if (isCall) {
            const term2 = -r * K * Math.exp(-r * T) * this.normalCDF(d2);
            return (term1 + term2) / 365; // Convert to daily theta
        } else {
            const term2 = r * K * Math.exp(-r * T) * this.normalCDF(-d2);
            return (term1 + term2) / 365; // Convert to daily theta
        }
    }

    // Calculate Vega (volatility sensitivity)
    calculateVega(S, K, r, T, sigma) {
        if (T <= 0) return 0;

        const d1 = this.calculateD1(S, K, r, T, sigma);
        return S * this.normalPDF(d1) * Math.sqrt(T) / 100; // Divide by 100 for percentage change
    }

    // Calculate Rho (interest rate sensitivity)
    calculateRho(S, K, r, T, sigma, isCall = true) {
        if (T <= 0) return 0;

        const d1 = this.calculateD1(S, K, r, T, sigma);
        const d2 = this.calculateD2(d1, sigma, T);

        if (isCall) {
            return K * T * Math.exp(-r * T) * this.normalCDF(d2) / 100;
        } else {
            return -K * T * Math.exp(-r * T) * this.normalCDF(-d2) / 100;
        }
    }

    // Calculate all option metrics at once
    calculateAllMetrics(S, K, r, T, sigma, isCall = true) {
        const price = isCall ? 
            this.calculateCallPrice(S, K, r, T, sigma) : 
            this.calculatePutPrice(S, K, r, T, sigma);

        return {
            price: price,
            delta: this.calculateDelta(S, K, r, T, sigma, isCall),
            gamma: this.calculateGamma(S, K, r, T, sigma),
            theta: this.calculateTheta(S, K, r, T, sigma, isCall),
            vega: this.calculateVega(S, K, r, T, sigma),
            rho: this.calculateRho(S, K, r, T, sigma, isCall)
        };
    }

    // Calculate intrinsic value
    calculateIntrinsicValue(S, K, isCall = true) {
        if (isCall) {
            return Math.max(S - K, 0);
        } else {
            return Math.max(K - S, 0);
        }
    }

    // Calculate time value
    calculateTimeValue(S, K, r, T, sigma, isCall = true) {
        const theoreticalPrice = isCall ? 
            this.calculateCallPrice(S, K, r, T, sigma) : 
            this.calculatePutPrice(S, K, r, T, sigma);
        
        const intrinsicValue = this.calculateIntrinsicValue(S, K, isCall);
        
        return Math.max(theoreticalPrice - intrinsicValue, 0);
    }

    // Calculate implied volatility using Newton-Raphson method
    calculateImpliedVolatility(S, K, r, T, marketPrice, isCall = true, maxIterations = 100, tolerance = 0.0001) {
        if (T <= 0) return 0;

        let sigma = 0.3; // Initial guess: 30% volatility
        
        for (let i = 0; i < maxIterations; i++) {
            const theoreticalPrice = isCall ? 
                this.calculateCallPrice(S, K, r, T, sigma) : 
                this.calculatePutPrice(S, K, r, T, sigma);
            
            const vega = this.calculateVega(S, K, r, T, sigma) * 100; // Convert back for calculation
            
            if (Math.abs(vega) < tolerance) break;
            
            const priceDiff = theoreticalPrice - marketPrice;
            
            if (Math.abs(priceDiff) < tolerance) break;
            
            sigma = sigma - priceDiff / vega;
            
            // Keep sigma within reasonable bounds
            sigma = Math.max(0.001, Math.min(sigma, 5));
        }
        
        return sigma;
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlackScholes;
} else {
    window.BlackScholes = BlackScholes;
}
