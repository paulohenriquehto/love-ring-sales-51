import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface APIEndpoint {
  path: string;
  method: string;
  description: string;
  parameters?: any[];
  responses?: any;
  examples?: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const url = new URL(req.url)
    const format = url.searchParams.get('format') || 'json'

    // Generate comprehensive API documentation
    const apiDocs = await generateAPIDocumentation(supabaseClient)

    if (format === 'openapi' || format === 'swagger') {
      const openApiSpec = generateOpenAPISpec(apiDocs)
      
      return new Response(
        JSON.stringify(openApiSpec, null, 2),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Content-Disposition': 'attachment; filename="api-spec.json"'
          } 
        }
      )
    }

    if (format === 'html') {
      const htmlDocs = generateHTMLDocs(apiDocs)
      
      return new Response(
        htmlDocs,
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'text/html'
          } 
        }
      )
    }

    // Default JSON format
    return new Response(
      JSON.stringify(apiDocs, null, 2),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('API docs generation error:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to generate documentation', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function generateAPIDocumentation(supabase: any) {
  const endpoints: APIEndpoint[] = [
    {
      path: '/api/v1/products',
      method: 'GET',
      description: 'Retrieve a list of products',
      parameters: [
        { name: 'limit', type: 'integer', description: 'Number of products to return (max 100)', default: 50 },
        { name: 'offset', type: 'integer', description: 'Number of products to skip', default: 0 },
        { name: 'search', type: 'string', description: 'Search products by name' }
      ],
      responses: {
        200: {
          description: 'Successful response',
          schema: {
            type: 'object',
            properties: {
              data: { type: 'array', items: { $ref: '#/components/schemas/Product' } },
              meta: { $ref: '#/components/schemas/PaginationMeta' }
            }
          }
        },
        401: { description: 'Unauthorized - Invalid API key' },
        429: { description: 'Rate limit exceeded' }
      },
      examples: {
        request: {
          headers: { 'X-API-Key': 'your-api-key' },
          url: '/api/v1/products?limit=10&offset=0'
        },
        response: {
          data: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Anel de Prata',
              base_price: 150.00,
              active: true,
              created_at: '2024-01-15T10:30:00Z'
            }
          ],
          meta: { total: 100, limit: 10, offset: 0, has_more: true }
        }
      }
    },
    {
      path: '/api/v1/products/{id}',
      method: 'GET',
      description: 'Retrieve a specific product by ID',
      parameters: [
        { name: 'id', type: 'string', description: 'Product ID (UUID)', required: true, in: 'path' }
      ],
      responses: {
        200: { description: 'Product found', schema: { $ref: '#/components/schemas/Product' } },
        404: { description: 'Product not found' },
        401: { description: 'Unauthorized' }
      }
    },
    {
      path: '/api/v1/orders',
      method: 'GET',
      description: 'Retrieve a list of orders',
      parameters: [
        { name: 'limit', type: 'integer', description: 'Number of orders to return (max 100)', default: 50 },
        { name: 'offset', type: 'integer', description: 'Number of orders to skip', default: 0 },
        { name: 'status', type: 'string', description: 'Filter by order status' }
      ],
      responses: {
        200: { description: 'Successful response' },
        401: { description: 'Unauthorized' }
      }
    },
    {
      path: '/api/v1/orders',
      method: 'POST',
      description: 'Create a new order',
      parameters: [
        { name: 'body', in: 'body', required: true, schema: { $ref: '#/components/schemas/CreateOrder' } }
      ],
      responses: {
        201: { description: 'Order created successfully' },
        400: { description: 'Invalid request data' },
        401: { description: 'Unauthorized' }
      }
    },
    {
      path: '/api/v1/analytics',
      method: 'GET',
      description: 'Get analytics data',
      parameters: [
        { name: 'days', type: 'integer', description: 'Number of days to include (max 365)', default: 30 }
      ],
      responses: {
        200: { description: 'Analytics data' },
        401: { description: 'Unauthorized' },
        403: { description: 'Insufficient permissions - requires admin access' }
      }
    }
  ]

  // Get real-time statistics
  const { data: apiKeys } = await supabase
    .from('api_keys')
    .select('id, active')
    .eq('active', true)

  const { data: recentRequests } = await supabase
    .from('api_requests')
    .select('status_code, created_at')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

  const stats = {
    active_api_keys: apiKeys?.length || 0,
    requests_24h: recentRequests?.length || 0,
    success_rate: recentRequests?.length ? 
      (recentRequests.filter(r => r.status_code < 400).length / recentRequests.length * 100).toFixed(2) + '%' : 
      '100%',
    last_updated: new Date().toISOString()
  }

  return {
    info: {
      title: 'Lovable API',
      version: '1.0.0',
      description: 'Comprehensive API for managing products, orders, and analytics',
      contact: {
        name: 'API Support',
        email: 'api@lovable.dev'
      }
    },
    servers: [
      {
        url: 'https://fvjowvxlqqmvwkqqqxsb.supabase.co/functions/v1/api-gateway',
        description: 'Production API Gateway'
      }
    ],
    statistics: stats,
    authentication: {
      type: 'API Key',
      header: 'X-API-Key',
      description: 'Include your API key in the X-API-Key header for all requests'
    },
    rate_limiting: {
      default_limit: '1000 requests per hour',
      headers: {
        'X-RateLimit-Limit': 'Total requests allowed per hour',
        'X-RateLimit-Remaining': 'Requests remaining in current window',
        'X-RateLimit-Reset': 'Unix timestamp when the rate limit resets'
      }
    },
    endpoints,
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          base_price: { type: 'number' },
          sku: { type: 'string' },
          active: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' }
        }
      },
      CreateOrder: {
        type: 'object',
        required: ['customer_name', 'customer_email', 'customer_cpf', 'customer_phone', 'items'],
        properties: {
          customer_name: { type: 'string' },
          customer_email: { type: 'string', format: 'email' },
          customer_cpf: { type: 'string' },
          customer_phone: { type: 'string' },
          delivery_method: { type: 'string', enum: ['pickup', 'delivery'] },
          payment_method: { type: 'string' },
          notes: { type: 'string' },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                product_id: { type: 'string', format: 'uuid' },
                quantity: { type: 'integer', minimum: 1 },
                unit_price: { type: 'number' }
              }
            }
          }
        }
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer' },
          limit: { type: 'integer' },
          offset: { type: 'integer' },
          has_more: { type: 'boolean' }
        }
      }
    }
  }
}

function generateOpenAPISpec(apiDocs: any) {
  return {
    openapi: '3.0.0',
    info: apiDocs.info,
    servers: apiDocs.servers,
    security: [{ ApiKeyAuth: [] }],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key'
        }
      },
      schemas: apiDocs.schemas
    },
    paths: apiDocs.endpoints.reduce((paths: any, endpoint: APIEndpoint) => {
      const pathKey = endpoint.path.replace(/{([^}]+)}/g, '{$1}')
      
      if (!paths[pathKey]) {
        paths[pathKey] = {}
      }
      
      paths[pathKey][endpoint.method.toLowerCase()] = {
        summary: endpoint.description,
        parameters: endpoint.parameters?.map((param: any) => ({
          name: param.name,
          in: param.in || 'query',
          required: param.required || false,
          schema: { type: param.type },
          description: param.description
        })) || [],
        responses: endpoint.responses || {}
      }
      
      return paths
    }, {})
  }
}

function generateHTMLDocs(apiDocs: any): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${apiDocs.info.title} - API Documentation</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .endpoint { background: white; margin-bottom: 20px; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .endpoint-header { padding: 20px; border-left: 4px solid #3b82f6; }
        .method { display: inline-block; padding: 4px 8px; border-radius: 4px; font-weight: bold; color: white; margin-right: 10px; }
        .method.get { background-color: #10b981; }
        .method.post { background-color: #f59e0b; }
        .method.put { background-color: #8b5cf6; }
        .method.delete { background-color: #ef4444; }
        .endpoint-body { padding: 20px; border-top: 1px solid #e5e7eb; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-value { font-size: 2em; font-weight: bold; color: #3b82f6; }
        .stat-label { color: #6b7280; margin-top: 5px; }
        code { background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-family: 'Monaco', 'Courier New', monospace; }
        pre { background: #1f2937; color: #f9fafb; padding: 15px; border-radius: 6px; overflow-x: auto; }
        .auth-info { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 6px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${apiDocs.info.title}</h1>
            <p>${apiDocs.info.description}</p>
            <p><strong>Version:</strong> ${apiDocs.info.version}</p>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${apiDocs.statistics.active_api_keys}</div>
                <div class="stat-label">Active API Keys</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${apiDocs.statistics.requests_24h}</div>
                <div class="stat-label">Requests (24h)</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${apiDocs.statistics.success_rate}</div>
                <div class="stat-label">Success Rate</div>
            </div>
        </div>

        <div class="auth-info">
            <strong>Authentication:</strong> Include your API key in the <code>X-API-Key</code> header for all requests.
            <br><strong>Rate Limiting:</strong> ${apiDocs.rate_limiting.default_limit}
        </div>

        ${apiDocs.endpoints.map((endpoint: APIEndpoint) => `
            <div class="endpoint">
                <div class="endpoint-header">
                    <span class="method ${endpoint.method.toLowerCase()}">${endpoint.method}</span>
                    <code>${endpoint.path}</code>
                    <p>${endpoint.description}</p>
                </div>
                <div class="endpoint-body">
                    ${endpoint.parameters && endpoint.parameters.length > 0 ? `
                        <h4>Parameters:</h4>
                        <ul>
                            ${endpoint.parameters.map((param: any) => `
                                <li><code>${param.name}</code> (${param.type}) - ${param.description} ${param.required ? '<strong>(required)</strong>' : ''}</li>
                            `).join('')}
                        </ul>
                    ` : ''}
                    
                    ${endpoint.examples ? `
                        <h4>Example Request:</h4>
                        <pre>${endpoint.examples.request.url}</pre>
                        
                        <h4>Example Response:</h4>
                        <pre>${JSON.stringify(endpoint.examples.response, null, 2)}</pre>
                    ` : ''}
                </div>
            </div>
        `).join('')}
    </div>
</body>
</html>
  `
}