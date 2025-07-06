package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

type Query struct {
	Country string `json:"country"`
	Query   string `json:"query"`
}

type Product struct {
	ProductName string `json:"productName"`
	Price       string `json:"price"`
	Currency    string `json:"currency"`
	Link        string `json:"link"`
}

// Country to currency mapping
var countryToCurrency = map[string]string{
	"US": "USD",
	"IN": "INR",
	"UK": "GBP",
	"CA": "CAD",
	"AU": "AUD",
}

// Domain to currency mapping for retailer-specific detection
var domainToCurrency = map[string]string{
	// US retailers
	"amazon.com":    "USD",
	"walmart.com":   "USD",
	"target.com":    "USD",
	"bestbuy.com":   "USD",
	"ebay.com":      "USD",
	"newegg.com":    "USD",
	"costco.com":    "USD",
	"homedepot.com": "USD",
	"lowes.com":     "USD",
	"macys.com":     "USD",

	// Indian retailers
	"amazon.in":     "INR",
	"flipkart.com":  "INR",
	"myntra.com":    "INR",
	"snapdeal.com":  "INR",
	"paytmmall.com": "INR",
	"tatacliq.com":  "INR",
	"shopclues.com": "INR",
	"croma.com":     "INR",
	"reliance.com":  "INR",

	// UK retailers
	"amazon.co.uk":  "GBP",
	"argos.co.uk":   "GBP",
	"currys.co.uk":  "GBP",
	"johnlewis.com": "GBP",
	"tesco.com":     "GBP",
	"asda.com":      "GBP",
	"very.co.uk":    "GBP",
	"ao.com":        "GBP",
	"screwfix.com":  "GBP",

	// Canadian retailers
	"amazon.ca":       "CAD",
	"walmart.ca":      "CAD",
	"bestbuy.ca":      "CAD",
	"canadiantire.ca": "CAD",
	"thebay.com":      "CAD",
	"costco.ca":       "CAD",
	"homedepot.ca":    "CAD",
	"loblaws.ca":      "CAD",

	// Australian retailers
	"amazon.com.au":       "AUD",
	"ebay.com.au":         "AUD",
	"jbhifi.com.au":       "AUD",
	"harveynorman.com.au": "AUD",
	"bunnings.com.au":     "AUD",
	"woolworths.com.au":   "AUD",
	"coles.com.au":        "AUD",
	"kmart.com.au":        "AUD",
	"target.com.au":       "AUD",
}

// Function to detect currency based on country and domain
func detectCurrency(country, link string) string {
	// First try to detect from domain
	for domain, currency := range domainToCurrency {
		if strings.Contains(link, domain) {
			return currency
		}
	}

	// Fallback to country mapping
	if currency, exists := countryToCurrency[country]; exists {
		return currency
	}

	// Default fallback
	return "USD"
}

// Currency symbols mapping
var currencySymbols = map[string][]string{
	"USD": {"$"},
	"INR": {"₹", "Rs", "Rs.", "INR"},
	"GBP": {"£"},
	"CAD": {"C$", "$", "CAD"},
	"AUD": {"A$", "$", "AUD"},
}

// Function to extract price with multiple currency support
func extractPrice(text, expectedCurrency string) string {
	text = strings.TrimSpace(text)
	if len(text) > 50 { // Skip very long text
		return ""
	}

	// Get possible symbols for this currency
	symbols := currencySymbols[expectedCurrency]

	// Try each symbol for the expected currency first
	for _, symbol := range symbols {
		if strings.Contains(text, symbol) {
			// Handle prefix symbols (like $, £, ₹)
			if strings.HasPrefix(text, symbol) {
				// Extract price after symbol
				priceText := strings.Split(text, " ")[0] // Take first word
				if len(priceText) > len(symbol) {
					return priceText
				}
			} else if strings.Contains(text, symbol) {
				// Handle suffix or embedded symbols
				parts := strings.Split(text, symbol)
				if len(parts) >= 2 {
					// Try to find numeric part
					for _, part := range parts {
						part = strings.TrimSpace(part)
						if matched, _ := regexp.MatchString(`\d+`, part); matched && len(part) < 20 {
							return symbol + part
						}
					}
				}
			}
		}
	}

	// Only return prices from other currencies if we can't find expected currency
	// This prevents showing USD prices when searching in India, etc.
	return ""
}

// Google Custom Search API structures
type GoogleSearchResponse struct {
	Items []GoogleSearchItem `json:"items"`
}

type GoogleSearchItem struct {
	Title   string `json:"title"`
	Link    string `json:"link"`
	Snippet string `json:"snippet"`
}

const (
	GOOGLE_API_KEY_ENV = "AIzaSyBcy8PhvTW2CYXaO2p8NauME3qNuCAvhF4"
	GOOGLE_CSE_ID_ENV  = "e53d05aedf58e457c"
)

func main() {
	// This is now a dedicated API service
	startHTTPServer()
}

// FetchGoogleLinksAPI uses the Google Custom Search JSON API to find product links
func FetchGoogleLinksAPI(query string, country string) []string {

	apiKey := GOOGLE_API_KEY_ENV
	cseID := GOOGLE_CSE_ID_ENV

	if apiKey == "" || cseID == "" {
		fmt.Println("Google API credentials not configured. Using hardcoded credentials for now.")
		return nil
	}

	// Build the search query with retailer sites focus based on country
	var searchQuery string
	var gl string // Google geolocation parameter

	switch country {
	case "IN":
		searchQuery = query + " site:amazon.in OR " + query + " site:flipkart.com OR " + query + " site:myntra.com OR " + query + " site:paytmmall.com OR " + query + " site:snapdeal.com OR " + query + " site:apple.com"
		gl = "in"
	case "UK":
		searchQuery = query + " site:amazon.co.uk OR " + query + " site:currys.co.uk OR " + query + " site:argos.co.uk OR " + query + " site:very.co.uk OR " + query + " site:apple.com OR " + query + " site:johnlewis.com"
		gl = "uk"
	case "CA":
		searchQuery = query + " site:amazon.ca OR " + query + " site:bestbuy.ca OR " + query + " site:walmart.ca OR " + query + " site:canadiantire.ca OR " + query + " site:apple.com"
		gl = "ca"
	case "AU":
		searchQuery = query + " site:amazon.com.au OR " + query + " site:jbhifi.com.au OR " + query + " site:officeworks.com.au OR " + query + " site:apple.com OR " + query + " site:bigw.com.au"
		gl = "au"
	default: // US and others
		searchQuery = query + " site:amazon.com OR " + query + " site:walmart.com OR " + query + " site:bestbuy.com OR " + query + " site:target.com OR " + query + " site:ebay.com OR " + query + " site:apple.com OR " + query + " site:bhphotovideo.com"
		gl = "us"
	}

	// Google Custom Search API endpoint with country-specific parameters
	apiURL := fmt.Sprintf("https://www.googleapis.com/customsearch/v1?key=%s&cx=%s&q=%s&num=10&gl=%s&hl=en",
		apiKey, cseID, url.QueryEscape(searchQuery), gl)

	fmt.Printf("🔍 Search Query: %s\n", searchQuery)
	fmt.Printf("🔍 API URL: %s\n", apiURL)

	fmt.Printf("Making API request to Google Custom Search...\n")

	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	resp, err := client.Get(apiURL)
	if err != nil {
		fmt.Printf("Error making API request: %v\n", err)
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		fmt.Printf("API request failed with status %d\n", resp.StatusCode)
		body, _ := io.ReadAll(resp.Body)
		fmt.Printf("Response body: %s\n", string(body))

		// Provide helpful error messages
		if resp.StatusCode == 403 {
			fmt.Println("❌ Error 403: Check that Custom Search API is enabled and API key is valid")
		} else if resp.StatusCode == 429 {
			fmt.Println("❌ Error 429: Daily quota exceeded (100 free searches per day)")
		}
		return nil
	}

	var searchResponse GoogleSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&searchResponse); err != nil {
		fmt.Printf("Error decoding API response: %v\n", err)
		return nil
	}

	var links []string

	// Country-specific retailer filtering
	var retailers []string
	switch country {
	case "IN":
		retailers = []string{"amazon.in", "flipkart.com", "myntra.com", "paytmmall.com", "snapdeal.com", "apple.com"}
	case "UK":
		retailers = []string{"amazon.co.uk", "currys.co.uk", "argos.co.uk", "very.co.uk", "apple.com", "johnlewis.com"}
	case "CA":
		retailers = []string{"amazon.ca", "bestbuy.ca", "walmart.ca", "canadiantire.ca", "apple.com"}
	case "AU":
		retailers = []string{"amazon.com.au", "jbhifi.com.au", "officeworks.com.au", "apple.com", "bigw.com.au"}
	default: // US and others
		retailers = []string{"amazon.com", "walmart.com", "bestbuy.com", "target.com", "ebay.com", "apple.com", "bhphotovideo.com"}
	}

	for _, item := range searchResponse.Items {
		fmt.Printf("📍 Google result: %s - %s\n", item.Title, item.Link)
		// Filter for known retailer URLs
		for _, retailer := range retailers {
			if strings.Contains(item.Link, retailer) {
				fmt.Printf("✅ Found %s link: %s\n", retailer, item.Link)
				links = append(links, item.Link)
				break
			}
		}
	}

	fmt.Printf("📊 Found %d retailer links from Google API\n", len(links))
	return links
}

// ScrapeProductPage scrapes individual product pages for price and title information

func ScrapeProductPage(link, country string) Product {
	req, err := http.NewRequest("GET", link, nil)
	if err != nil {
		fmt.Printf("Error creating request for %s: %v\n", link, err)
		return Product{}
	}

	req.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	res, err := client.Do(req)
	if err != nil {
		fmt.Printf("Error fetching %s: %v\n", link, err)
		return Product{}
	}
	if res.StatusCode != 200 {
		fmt.Printf("Non-200 status code %d for %s\n", res.StatusCode, link)
		return Product{}
	}
	defer res.Body.Close()

	doc, err := goquery.NewDocumentFromReader(res.Body)
	if err != nil {
		fmt.Printf("Error parsing HTML for %s: %v\n", link, err)
		return Product{}
	}

	title := strings.TrimSpace(doc.Find("title").First().Text())
	price := ""
	expectedCurrency := detectCurrency(country, link)

	// Try multiple selectors for price
	priceSelectors := []string{
		// Generic price selectors
		"span[class*='price']",
		"span[class*='Price']",
		"div[class*='price']",
		"span[data-testid*='price']",
		".a-price-whole",
		".notranslate",
		// Apple-specific selectors
		".price-current",
		".as-price-currentprice",
		".as-price-installments",
		".pricing-price",
		"[data-autom*='price']",
		".pd-pricing",
		// More generic patterns
		"[aria-label*='price']",
		"[aria-label*='$']",
		"[aria-label*='₹']",
		"[aria-label*='£']",
		"span",
	}

	for _, selector := range priceSelectors {
		if price != "" {
			break
		}
		doc.Find(selector).Each(func(i int, s *goquery.Selection) {
			if price != "" {
				return
			}
			t := strings.TrimSpace(s.Text())
			extractedPrice := extractPrice(t, expectedCurrency)
			if extractedPrice != "" {
				price = extractedPrice
			}
		})
	}

	// If we have a title but no price, still include it with a placeholder
	if title != "" && price == "" {
		price = "Price not available"
		fmt.Printf("⚠️  Found product but no price from %s (title: '%s')\n", link, title)
	} else if title == "" && price == "" {
		fmt.Printf("❌ Could not extract product info from %s\n", link)
		return Product{} // Return empty product only if we have neither title nor price
	} else if title == "" && price != "" {
		title = "Product name not available"
		fmt.Printf("⚠️  Found price but no title from %s (price: '%s')\n", link, price)
	} else {
		fmt.Printf("✅ Successfully extracted from %s (title: '%s', price: '%s')\n", link, title, price)
	}

	return Product{
		ProductName: title,
		Price:       price,
		Currency:    detectCurrency(country, link),
		Link:        link,
	}
}

func extractNumericPrice(priceStr string) float64 {
	// Handle special cases for missing prices
	if priceStr == "" || priceStr == "Price not available" {
		return 999999 // Put products without prices at the end
	}

	// Remove all non-numeric characters except decimal point
	re := regexp.MustCompile(`[^\d.]`)
	cleanPrice := re.ReplaceAllString(priceStr, "")

	// Convert to float
	price, err := strconv.ParseFloat(cleanPrice, 64)
	if err != nil {
		return 999999 // Put invalid prices at the end
	}
	return price
}

func startHTTPServer() {
	port := "8080"
	if envPort := os.Getenv("PORT"); envPort != "" {
		port = envPort
	}

	// Enable CORS middleware
	http.HandleFunc("/search", corsMiddleware(handleSearch))
	http.HandleFunc("/health", corsMiddleware(handleHealth))
	http.HandleFunc("/", corsMiddleware(handleRoot))

	fmt.Printf("🚀 Product Price Scraper API Server starting on port %s\n", port)
	fmt.Printf("📡 Health check: http://localhost:%s/health\n", port)
	fmt.Printf("🔍 Search endpoint: http://localhost:%s/search\n", port)
	fmt.Printf("📖 API docs: http://localhost:%s/\n", port)

	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Set CORS headers
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		// Handle preflight requests
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
		"service":   "price-scraper",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func handleSearch(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		errorResponse := map[string]string{
			"error": "Method not allowed. Use POST method.",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	var query Query
	if err := json.NewDecoder(r.Body).Decode(&query); err != nil {
		errorResponse := map[string]string{
			"error": "Invalid request body. Expected JSON with 'country' and 'query' fields.",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	if query.Query == "" {
		errorResponse := map[string]string{
			"error": "Query is required and cannot be empty.",
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}

	if query.Country == "" {
		query.Country = "US" // Default to US
	}

	fmt.Printf("🔍 API Search request: %s (Country: %s)\n", query.Query, query.Country)

	// Use both combined search and individual retailer searches for better coverage
	fmt.Println("🔍 Performing combined retailer search...")
	links := FetchGoogleLinksAPI(query.Query, query.Country)

	fmt.Println("🔍 Performing individual retailer searches...")
	additionalLinks := PerformMultipleSearches(query.Query, query.Country)

	// Combine and deduplicate links
	allLinks := append(links, additionalLinks...)
	seen := make(map[string]bool)
	var uniqueLinks []string
	for _, link := range allLinks {
		if !seen[link] {
			seen[link] = true
			uniqueLinks = append(uniqueLinks, link)
		}
	}

	links = uniqueLinks

	if len(links) == 0 {
		fmt.Println("❌ No products found from Google API searches across all retailers")
		// Return empty array instead of error
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode([]Product{})
		return
	}

	fmt.Printf("📋 Found %d total links from all searches\n", len(links))

	var results []Product

	// Scrape individual product pages
	for _, link := range links {
		fmt.Printf("Scraping product page: %s\n", link)
		product := ScrapeProductPage(link, query.Country)
		if product.ProductName != "" { // Only require a product name, not necessarily a price
			results = append(results, product)
			if product.Price != "" && product.Price != "Price not available" {
				fmt.Printf("Found product: %s - %s\n", product.ProductName, product.Price)
			} else {
				fmt.Printf("Found product (no price): %s\n", product.ProductName)
			}
		}
	}

	// Sort results by price
	sort.Slice(results, func(i, j int) bool {
		priceI := extractNumericPrice(results[i].Price)
		priceJ := extractNumericPrice(results[j].Price)
		return priceI < priceJ
	})

	fmt.Printf("📊 Returning %d results\n", len(results))

	// Return JSON response - always return an array, even if empty
	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(results); err != nil {
		errorResponse := map[string]string{
			"error": "Failed to encode response",
		}
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(errorResponse)
		return
	}
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	apiDocs := map[string]interface{}{
		"service":     "Product Price Scraper API",
		"version":     "1.0.0",
		"description": "Search for product prices using Google Custom Search API with automatic currency detection based on country and retailer",
		"endpoints": map[string]interface{}{
			"GET /health": "Health check endpoint",
			"POST /search": map[string]interface{}{
				"description": "Search for product prices using Google Custom Search API",
				"input": map[string]interface{}{
					"country": "Country code (US, IN, UK, CA, AU) - defaults to US",
					"query":   "Product search query (e.g., 'iPhone 16 Pro, 128GB')",
				},
				"example_request": map[string]string{
					"country": "US",
					"query":   "iPhone 16 Pro, 128GB",
				},
				"example_response": []map[string]string{
					{
						"link":        "https://amazon.com/...",
						"price":       "$999",
						"currency":    "USD",
						"productName": "Apple iPhone 16 Pro (US)",
					},
					{
						"link":        "https://amazon.in/...",
						"price":       "₹82,999",
						"currency":    "INR",
						"productName": "Apple iPhone 16 Pro (India)",
					},
					{
						"link":        "https://amazon.co.uk/...",
						"price":       "£849",
						"currency":    "GBP",
						"productName": "Apple iPhone 16 Pro (UK)",
					},
				},
			},
		},
		"supported_countries": []string{"US", "IN", "UK", "CA", "AU"},
		"data_source":         "Google Custom Search API",
		"note":                "Requires valid Google API credentials configured in the application",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(apiDocs)
}

// PerformMultipleSearches performs separate searches for each major retailer to ensure coverage
func PerformMultipleSearches(query string, country string) []string {
	var allLinks []string

	// Define retailer-specific searches based on country
	var retailerSearches []string

	switch country {
	case "IN":
		retailerSearches = []string{
			query + " site:amazon.in",
			query + " site:flipkart.com",
			query + " site:apple.com",
			query + " site:myntra.com",
		}
	case "UK":
		retailerSearches = []string{
			query + " site:amazon.co.uk",
			query + " site:apple.com",
			query + " site:currys.co.uk",
			query + " site:argos.co.uk",
		}
	case "CA":
		retailerSearches = []string{
			query + " site:amazon.ca",
			query + " site:apple.com",
			query + " site:bestbuy.ca",
			query + " site:walmart.ca",
		}
	case "AU":
		retailerSearches = []string{
			query + " site:amazon.com.au",
			query + " site:apple.com",
			query + " site:jbhifi.com.au",
			query + " site:officeworks.com.au",
		}
	default: // US and others
		retailerSearches = []string{
			query + " site:amazon.com",
			query + " site:apple.com",
			query + " site:walmart.com",
			query + " site:bestbuy.com",
			query + " site:target.com",
		}
	}

	// Perform individual searches
	for _, searchQuery := range retailerSearches {
		links := performSingleSearch(searchQuery, country)
		allLinks = append(allLinks, links...)

		// Add a small delay to avoid hitting rate limits
		time.Sleep(100 * time.Millisecond)
	}

	// Remove duplicates
	seen := make(map[string]bool)
	var uniqueLinks []string
	for _, link := range allLinks {
		if !seen[link] {
			seen[link] = true
			uniqueLinks = append(uniqueLinks, link)
		}
	}

	return uniqueLinks
}

// performSingleSearch performs a single Google search
func performSingleSearch(searchQuery string, country string) []string {
	apiKey := GOOGLE_API_KEY_ENV
	cseID := GOOGLE_CSE_ID_ENV

	if apiKey == "" || cseID == "" {
		return nil
	}

	var gl string
	switch country {
	case "IN":
		gl = "in"
	case "UK":
		gl = "uk"
	case "CA":
		gl = "ca"
	case "AU":
		gl = "au"
	default:
		gl = "us"
	}

	apiURL := fmt.Sprintf("https://www.googleapis.com/customsearch/v1?key=%s&cx=%s&q=%s&num=5&gl=%s&hl=en",
		apiKey, cseID, url.QueryEscape(searchQuery), gl)

	fmt.Printf("🔍 Individual search: %s\n", searchQuery)

	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	resp, err := client.Get(apiURL)
	if err != nil {
		fmt.Printf("Error in individual search: %v\n", err)
		return nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		fmt.Printf("Individual search failed with status %d\n", resp.StatusCode)
		return nil
	}

	var searchResponse GoogleSearchResponse
	if err := json.NewDecoder(resp.Body).Decode(&searchResponse); err != nil {
		fmt.Printf("Error decoding individual search response: %v\n", err)
		return nil
	}

	var links []string
	for _, item := range searchResponse.Items {
		fmt.Printf("📍 Found: %s - %s\n", item.Title, item.Link)
		links = append(links, item.Link)
	}

	return links
}
