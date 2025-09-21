// Real-Time Data Manager for Options Calculator

class RealTimeDataManager {
    constructor() {
        this.lastFetchTime = null;
        this.currentSymbol = null;
        this.isLoading = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Fetch data button
        document.getElementById('fetch-data-btn').addEventListener('click', () => {
            this.fetchRealTimeData();
        });

        // Auto-fetch when ticker symbol is entered and user presses Enter
        document.getElementById('tickerSymbol').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.fetchRealTimeData();
            }
        });

        // Auto-fetch when ticker symbol changes (with debounce)
        document.getElementById('tickerSymbol').addEventListener('input', () => {
            this.debounce(() => {
                const symbol = document.getElementById('tickerSymbol').value.trim();
                if (symbol && symbol.length >= 2) {
                    this.fetchRealTimeData();
                }
            }, 1000);
        });
    }

    async fetchRealTimeData() {
        const symbol = document.getElementById('tickerSymbol').value.trim().toUpperCase();
        
        if (!symbol) {
            this.showStatus('Please enter a ticker symbol', 'error');
            return;
        }

        if (this.isLoading) {
            return;
        }

        this.isLoading = true;
        this.currentSymbol = symbol;
        
        try {
            this.showStatus('Fetching real-time data...', 'loading');
            this.setButtonLoading(true);

            // Try Twelve Data first, fallback to Alpha Vantage
            let data;
            try {
                data = await this.fetchFromAPI(symbol, 'twelve');
            } catch (error) {
                console.warn('Twelve Data failed, trying Alpha Vantage:', error.message);
                data = await this.fetchFromAPI(symbol, 'alpha');
            }

            this.updateUI(data);
            this.showStatus(`✅ Data updated for ${symbol}`, 'success');
            
        } catch (error) {
            console.error('Failed to fetch data:', error);
            this.showStatus(`❌ Failed to fetch data for ${symbol}: ${error.message}`, 'error');
        } finally {
            this.isLoading = false;
            this.setButtonLoading(false);
        }
    }

    async fetchFromAPI(symbol, provider) {
        const response = await fetch(`/api/stock-price?symbol=${symbol}&provider=${provider}`);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
    }

    updateUI(data) {
        // Update stock price
        if (data.price) {
            document.getElementById('stockPrice').value = data.price.toFixed(2);
            this.showIndicator('price-status', true);
        }

        // Update volatility if available
        if (data.volatility) {
            document.getElementById('volatility').value = data.volatility.toFixed(1);
            this.showIndicator('vol-status', true);
        }

        // Update last updated timestamp
        this.lastFetchTime = new Date();
        this.updateTimestamp();

        // Trigger recalculation
        if (window.optionsCalculator && typeof window.optionsCalculator.calculateAndUpdate === 'function') {
            window.optionsCalculator.calculateAndUpdate();
        }
    }

    showStatus(message, type = 'info') {
        const statusDiv = document.getElementById('data-status');
        statusDiv.className = `text-sm p-3 rounded-lg ${this.getStatusClasses(type)}`;
        statusDiv.textContent = message;
        statusDiv.classList.remove('hidden');

        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                statusDiv.classList.add('hidden');
            }, 3000);
        }
    }

    getStatusClasses(type) {
        switch (type) {
            case 'success':
                return 'text-green-700 bg-green-50 border border-green-200';
            case 'error':
                return 'text-red-700 bg-red-50 border border-red-200';
            case 'loading':
                return 'text-blue-700 bg-blue-50 border border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border border-gray-200';
        }
    }

    setButtonLoading(isLoading) {
        const button = document.getElementById('fetch-data-btn');
        const buttonText = button.querySelector('span');
        
        if (isLoading) {
            buttonText.innerHTML = `
                <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
            `;
            button.disabled = true;
            button.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            buttonText.innerHTML = `
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
                Fetch Data
            `;
            button.disabled = false;
            button.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    showIndicator(elementId, show) {
        const indicator = document.getElementById(elementId);
        if (show) {
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
        }
    }

    updateTimestamp() {
        const timestampSpan = document.getElementById('last-updated');
        const timeSpan = timestampSpan.querySelector('span');
        
        if (this.lastFetchTime) {
            timeSpan.textContent = this.lastFetchTime.toLocaleTimeString();
            timestampSpan.classList.remove('hidden');
        }
    }

    // Utility function for debouncing
    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }

    // Public method to get options chain data
    async fetchOptionsChain(expiration = null) {
        if (!this.currentSymbol) {
            throw new Error('No symbol selected');
        }

        const params = new URLSearchParams({
            symbol: this.currentSymbol,
            provider: 'twelve'
        });

        if (expiration) {
            params.append('expiration', expiration);
        }

        const response = await fetch(`/api/options-chain?${params}`);
        
        if (!response.ok) {
            throw new Error(`Options API request failed: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        return data;
    }

    // Get current symbol
    getCurrentSymbol() {
        return this.currentSymbol;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.realTimeData = new RealTimeDataManager();
});
