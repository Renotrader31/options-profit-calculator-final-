// Main Application Logic

class OptionsCalculator {
    constructor() {
        this.strategies = new OptionsStrategies();
        this.chart = null;
        this.currentLegs = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateStrategyDisplay();
        this.updateLegsDisplay();
        this.setupChart();
    }

    setupEventListeners() {
        // Strategy selection change
        document.getElementById('strategy').addEventListener('change', () => {
            this.updateStrategyDisplay();
            this.updateLegsDisplay();
            this.calculateAndUpdate();
        });

        // Market parameter changes
        ['stockPrice', 'volatility', 'riskFreeRate', 'daysToExpiration'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.debounce(() => {
                    this.updateLegsDisplay(); // Update default strikes when stock price changes
                    this.calculateAndUpdate();
                }, 300);
            });
        });

        // Calculate button
        document.getElementById('calculate-btn').addEventListener('click', () => {
            this.calculateAndUpdate();
        });
    }

    updateStrategyDisplay() {
        const strategyKey = document.getElementById('strategy').value;
        const strategy = this.strategies.getStrategy(strategyKey);
        
        if (strategy) {
            const descriptionDiv = document.getElementById('strategy-description');
            descriptionDiv.innerHTML = `
                <div class="mb-2">
                    <span class="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mr-2">
                        ${strategy.complexity}
                    </span>
                    <span class="inline-block px-2 py-1 bg-${this.getRiskColor(strategy.riskLevel)}-100 text-${this.getRiskColor(strategy.riskLevel)}-800 text-xs font-semibold rounded-full">
                        ${strategy.riskLevel} Risk
                    </span>
                </div>
                <p>${strategy.description}</p>
            `;
        }
    }

    getRiskColor(riskLevel) {
        switch (riskLevel.toLowerCase()) {
            case 'low': return 'green';
            case 'medium': return 'yellow';
            case 'high': return 'red';
            default: return 'gray';
        }
    }

    updateLegsDisplay() {
        const strategyKey = document.getElementById('strategy').value;
        const currentPrice = parseFloat(document.getElementById('stockPrice').value) || 100;
        const strategy = this.strategies.setDefaultStrikes(strategyKey, currentPrice);
        
        const container = document.getElementById('legs-container');
        container.innerHTML = '';

        if (!strategy) return;

        strategy.legs.forEach((leg, index) => {
            const legDiv = document.createElement('div');
            legDiv.className = 'mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50';
            
            legDiv.innerHTML = `
                <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Leg ${index + 1}</label>
                        <div class="text-sm text-gray-600">${leg.action} ${leg.type}</div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Strike ($)</label>
                        <input type="number" class="leg-strike w-full p-2 border border-gray-300 rounded input-focus" 
                               value="${leg.defaultStrike}" step="0.01" data-leg="${index}">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Premium ($)</label>
                        <input type="number" class="leg-premium w-full p-2 border border-gray-300 rounded input-focus" 
                               value="${leg.defaultPremium}" step="0.01" data-leg="${index}" placeholder="Enter premium">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input type="number" class="leg-quantity w-full p-2 border border-gray-300 rounded input-focus" 
                               value="${leg.quantity}" min="1" data-leg="${index}">
                    </div>
                    <div class="flex items-end">
                        <button class="calc-premium-btn w-full bg-gray-600 hover:bg-gray-700 text-white text-sm py-2 px-3 rounded transition-colors" 
                                data-leg="${index}">
                            Calc Premium
                        </button>
                    </div>
                </div>
            `;
            
            container.appendChild(legDiv);
        });

        // Add event listeners for leg inputs
        this.setupLegEventListeners();
        this.updateCurrentLegs();
    }

    setupLegEventListeners() {
        // Strike, premium, and quantity inputs
        document.querySelectorAll('.leg-strike, .leg-premium, .leg-quantity').forEach(input => {
            input.addEventListener('input', () => {
                this.debounce(() => {
                    this.updateCurrentLegs();
                    this.calculateAndUpdate();
                }, 300);
            });
        });

        // Calculate premium buttons
        document.querySelectorAll('.calc-premium-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const legIndex = parseInt(e.target.dataset.leg);
                this.calculateTheoreticalPremium(legIndex);
            });
        });
    }

    updateCurrentLegs() {
        const strategyKey = document.getElementById('strategy').value;
        const strategy = this.strategies.getStrategy(strategyKey);
        
        if (!strategy) return;

        this.currentLegs = strategy.legs.map((leg, index) => {
            const strikeInput = document.querySelector(`.leg-strike[data-leg="${index}"]`);
            const premiumInput = document.querySelector(`.leg-premium[data-leg="${index}"]`);
            const quantityInput = document.querySelector(`.leg-quantity[data-leg="${index}"]`);
            
            return {
                action: leg.action,
                type: leg.type,
                strike: parseFloat(strikeInput?.value) || 0,
                premium: parseFloat(premiumInput?.value) || 0,
                quantity: parseInt(quantityInput?.value) || 1
            };
        });
    }

    calculateTheoreticalPremium(legIndex) {
        const leg = this.currentLegs[legIndex];
        if (!leg || !leg.strike) return;

        const marketParams = this.getMarketParams();
        const isCall = leg.type === 'Call';
        
        let theoreticalPrice;
        if (isCall) {
            theoreticalPrice = this.strategies.blackScholes.calculateCallPrice(
                marketParams.currentPrice,
                leg.strike,
                marketParams.riskFreeRate,
                marketParams.timeToExpiration,
                marketParams.volatility
            );
        } else {
            theoreticalPrice = this.strategies.blackScholes.calculatePutPrice(
                marketParams.currentPrice,
                leg.strike,
                marketParams.riskFreeRate,
                marketParams.timeToExpiration,
                marketParams.volatility
            );
        }

        // Update the premium input
        const premiumInput = document.querySelector(`.leg-premium[data-leg="${legIndex}"]`);
        if (premiumInput) {
            premiumInput.value = theoreticalPrice.toFixed(2);
            this.updateCurrentLegs();
            this.calculateAndUpdate();
        }
    }

    getMarketParams() {
        const stockPrice = parseFloat(document.getElementById('stockPrice').value) || 100;
        const volatility = (parseFloat(document.getElementById('volatility').value) || 25) / 100;
        const riskFreeRate = (parseFloat(document.getElementById('riskFreeRate').value) || 5) / 100;
        const daysToExpiration = parseInt(document.getElementById('daysToExpiration').value) || 30;
        const timeToExpiration = daysToExpiration / 365;

        return {
            currentPrice: stockPrice,
            volatility: volatility,
            riskFreeRate: riskFreeRate,
            timeToExpiration: timeToExpiration,
            daysToExpiration: daysToExpiration
        };
    }

    calculateAndUpdate() {
        if (this.currentLegs.length === 0) return;

        const marketParams = this.getMarketParams();
        
        // Generate price range for chart
        const priceRange = [];
        const step = marketParams.currentPrice * 0.02; // 2% steps
        for (let price = marketParams.currentPrice * 0.7; price <= marketParams.currentPrice * 1.3; price += step) {
            priceRange.push(price);
        }

        // Calculate P&L at expiration
        const plAtExpiration = this.strategies.calculateStrategyPL(this.currentLegs, priceRange, {
            ...marketParams,
            timeToExpiration: 0
        });

        // Calculate current P&L (before expiration)
        const plCurrent = this.strategies.calculateStrategyPL(this.currentLegs, priceRange, marketParams);

        // Update chart
        this.updateChart(priceRange, plAtExpiration, plCurrent, marketParams.currentPrice);

        // Calculate and display key metrics
        const keyMetrics = this.strategies.calculateKeyMetrics(this.currentLegs, marketParams);
        this.updateKeyMetrics(keyMetrics);

        // Calculate and display Greeks
        const greeks = this.strategies.calculateStrategyGreeks(this.currentLegs, marketParams);
        this.updateGreeks(greeks);
    }

    setupChart() {
        const ctx = document.getElementById('plChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'P&L at Expiration',
                        data: [],
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 3,
                        fill: false,
                        tension: 0.1
                    },
                    {
                        label: 'Current P&L',
                        data: [],
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderWidth: 2,
                        borderDash: [5, 5],
                        fill: false,
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.dataset.label + ': $' + context.parsed.y.toFixed(2);
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Stock Price ($)'
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Profit/Loss ($)'
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    }
                },
                elements: {
                    point: {
                        radius: 0,
                        hoverRadius: 6
                    }
                }
            }
        });
    }

    updateChart(priceRange, plAtExpiration, plCurrent, currentPrice) {
        if (!this.chart) return;

        const labels = priceRange.map(price => price.toFixed(0));
        
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = plAtExpiration;
        this.chart.data.datasets[1].data = plCurrent;
        
        // Add breakeven line (y=0)
        this.chart.options.plugins.annotation = {
            annotations: {
                breakeven: {
                    type: 'line',
                    yMin: 0,
                    yMax: 0,
                    borderColor: 'rgb(239, 68, 68)',
                    borderWidth: 1,
                    borderDash: [10, 5],
                    label: {
                        content: 'Breakeven',
                        enabled: true,
                        position: 'end'
                    }
                },
                currentPrice: {
                    type: 'line',
                    xMin: currentPrice.toFixed(0),
                    xMax: currentPrice.toFixed(0),
                    borderColor: 'rgb(168, 85, 247)',
                    borderWidth: 2,
                    label: {
                        content: 'Current Price',
                        enabled: true,
                        position: 'start'
                    }
                }
            }
        };
        
        this.chart.update();
    }

    updateKeyMetrics(metrics) {
        document.getElementById('max-profit').textContent = 
            typeof metrics.maxProfit === 'number' ? `$${metrics.maxProfit.toFixed(2)}` : metrics.maxProfit;
            
        document.getElementById('max-loss').textContent = 
            typeof metrics.maxLoss === 'number' ? `$${metrics.maxLoss.toFixed(2)}` : metrics.maxLoss;
            
        document.getElementById('breakeven').textContent = 
            metrics.breakevens.length > 0 ? 
                metrics.breakevens.map(be => `$${be.toFixed(2)}`).join(', ') : 'None';
                
        document.getElementById('total-cost').textContent = `$${metrics.totalCost.toFixed(2)}`;
    }

    updateGreeks(greeks) {
        document.getElementById('delta').textContent = greeks.delta.toFixed(3);
        document.getElementById('gamma').textContent = greeks.gamma.toFixed(4);
        document.getElementById('theta').textContent = greeks.theta.toFixed(3);
        document.getElementById('vega').textContent = greeks.vega.toFixed(3);
    }

    // Debounce function for performance
    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OptionsCalculator();
});
