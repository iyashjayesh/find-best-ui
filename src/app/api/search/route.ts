import { NextRequest, NextResponse } from 'next/server';

interface SearchRequest {
    query: string;
    country: string;
}

const GO_BACKEND_URL = process.env.GO_BACKEND_URL || 'http://localhost:8082';

export async function POST(request: NextRequest) {
    try {
        const body: SearchRequest = await request.json();

        if (!body.query) {
            return NextResponse.json(
                { error: 'Query is required' },
                { status: 400 }
            );
        }

        console.log(`Forwarding search request to Go backend: ${body.query}`);

        // Call the Go backend API
        const response = await fetch(`${GO_BACKEND_URL}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: body.query,
                country: body.country || 'US',
            }),
            // Add a reasonable timeout
            signal: AbortSignal.timeout(60000), // 60 seconds
        });

        if (!response.ok) {
            console.error(`Go backend returned ${response.status}: ${response.statusText}`);

            // Check if Go backend is running
            if (response.status === 0 || !response.status) {
                return NextResponse.json(
                    {
                        error: 'Backend service is not available. Please ensure the Go server is running on port 8080.',
                        details: 'Run the Go server with: cd golang/server && go run main.go --server'
                    },
                    { status: 503 }
                );
            }

            return NextResponse.json(
                { error: `Backend service error: ${response.statusText}` },
                { status: response.status }
            );
        }

        const results = await response.json();
        console.log(`Received ${results.length} results from Go backend`);

        return NextResponse.json(results);
    } catch (error) {
        console.error('Search API error:', error);

        // Check if it's a timeout or connection error
        if (error instanceof Error) {
            if (error.name === 'TimeoutError') {
                return NextResponse.json(
                    {
                        error: 'Search request timed out. The search is taking longer than expected.',
                        details: 'This usually happens when retailers are taking a long time to respond or are blocking requests.'
                    },
                    { status: 408 }
                );
            }

            if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch failed')) {
                return NextResponse.json(
                    {
                        error: 'Cannot connect to backend service. Please ensure the Go server is running.',
                        details: 'Start the Go server with: cd golang/server && go run main.go --server'
                    },
                    { status: 503 }
                );
            }
        }

        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
