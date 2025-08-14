import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
}

interface APIKey {
  id: string;
  name: string;
  key_hash: string;
  permissions: string[];
  rate_limit: number;
  active: boolean;
  user_id: string;
}

interface RateLimitInfo {
  remaining: number;
  reset: number;
  limit: number;
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
    const apiKey = req.headers.get('x-api-key')
    const path = url.pathname.replace('/functions/v1/api-gateway', '')
    const method = req.method
    const startTime = performance.now()
    const userAgent = req.headers.get('user-agent') || 'unknown'
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown'

    console.log(`API Gateway: ${method} ${path} from ${ipAddress}`)

    // Validate API Key
    if (!apiKey) {
      await logRequest(supabaseClient, {
        api_key_id: null,
        endpoint: path,
        method,
        status_code: 401,
        response_time_ms: performance.now() - startTime,
        ip_address: ipAddress,
        user_agent: userAgent
      })

      return new Response(
        JSON.stringify({ error: 'API key required', code: 'MISSING_API_KEY' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Verify API Key
    const { data: keyData, error: keyError } = await supabaseClient
      .from('api_keys')
      .select('*')
      .eq('key_hash', btoa(apiKey))
      .eq('active', true)
      .single()

    if (keyError || !keyData) {
      await logRequest(supabaseClient, {
        api_key_id: null,
        endpoint: path,
        method,
        status_code: 401,
        response_time_ms: performance.now() - startTime,
        ip_address: ipAddress,
        user_agent: userAgent
      })

      return new Response(
        JSON.stringify({ error: 'Invalid API key', code: 'INVALID_API_KEY' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Check Rate Limiting
    const rateLimitCheck = await checkRateLimit(supabaseClient, keyData.id, keyData.rate_limit)
    if (!rateLimitCheck.allowed) {
      await logRequest(supabaseClient, {
        api_key_id: keyData.id,
        endpoint: path,
        method,
        status_code: 429,
        response_time_ms: performance.now() - startTime,
        ip_address: ipAddress,
        user_agent: userAgent
      })

      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded', 
          code: 'RATE_LIMIT_EXCEEDED',
          limit: rateLimitCheck.limit,
          remaining: rateLimitCheck.remaining,
          reset: rateLimitCheck.reset
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': rateLimitCheck.limit.toString(),
            'X-RateLimit-Remaining': rateLimitCheck.remaining.toString(),
            'X-RateLimit-Reset': rateLimitCheck.reset.toString()
          } 
        }
      )
    }

    // Check Permissions
    const requiredPermission = getRequiredPermission(method, path)
    if (requiredPermission && !keyData.permissions.includes(requiredPermission)) {
      await logRequest(supabaseClient, {
        api_key_id: keyData.id,
        endpoint: path,
        method,
        status_code: 403,
        response_time_ms: performance.now() - startTime,
        ip_address: ipAddress,
        user_agent: userAgent
      })

      return new Response(
        JSON.stringify({ 
          error: 'Insufficient permissions', 
          code: 'INSUFFICIENT_PERMISSIONS',
          required: requiredPermission,
          granted: keyData.permissions
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Route API request
    const response = await routeRequest(supabaseClient, path, method, req, keyData)
    const responseTime = performance.now() - startTime

    // Log successful request
    await logRequest(supabaseClient, {
      api_key_id: keyData.id,
      endpoint: path,
      method,
      status_code: response.status,
      response_time_ms: responseTime,
      ip_address: ipAddress,
      user_agent: userAgent
    })

    // Update API key last used
    await supabaseClient
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id)

    // Add rate limit headers to response
    const responseHeaders = new Headers(response.headers)
    responseHeaders.set('X-RateLimit-Limit', rateLimitCheck.limit.toString())
    responseHeaders.set('X-RateLimit-Remaining', (rateLimitCheck.remaining - 1).toString())
    responseHeaders.set('X-RateLimit-Reset', rateLimitCheck.reset.toString())
    responseHeaders.set('X-Response-Time', `${responseTime.toFixed(2)}ms`)

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders
    })

  } catch (error) {
    console.error('API Gateway error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', code: 'INTERNAL_ERROR' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function checkRateLimit(supabase: any, apiKeyId: string, limit: number): Promise<{
  allowed: boolean;
  remaining: number;
  reset: number;
  limit: number;
}> {
  const now = Date.now()
  const windowStart = Math.floor(now / (60 * 60 * 1000)) * (60 * 60 * 1000) // Hourly window

  const { data: requests } = await supabase
    .from('api_requests')
    .select('id')
    .eq('api_key_id', apiKeyId)
    .gte('created_at', new Date(windowStart).toISOString())

  const currentCount = requests?.length || 0
  const remaining = Math.max(0, limit - currentCount)
  const reset = windowStart + (60 * 60 * 1000) // Next hour

  return {
    allowed: currentCount < limit,
    remaining,
    reset: Math.floor(reset / 1000),
    limit
  }
}

function getRequiredPermission(method: string, path: string): string | null {
  if (method === 'GET' && path.startsWith('/api/v1/')) return 'read'
  if (['POST', 'PUT', 'DELETE'].includes(method) && path.startsWith('/api/v1/')) return 'write'
  if (path.startsWith('/api/admin/')) return 'admin'
  return null
}

async function routeRequest(supabase: any, path: string, method: string, req: Request, keyData: APIKey): Promise<Response> {
  try {
    // Parse the path to determine the resource
    const pathParts = path.split('/').filter(p => p)
    
    if (pathParts.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'API Gateway v1.0', 
          version: '1.0.0',
          endpoints: [
            'GET /api/v1/products',
            'GET /api/v1/orders', 
            'POST /api/v1/orders',
            'GET /api/v1/analytics'
          ]
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // API v1 routes
    if (pathParts[0] === 'api' && pathParts[1] === 'v1') {
      const resource = pathParts[2]
      const resourceId = pathParts[3]

      switch (resource) {
        case 'products':
          return await handleProductsAPI(supabase, method, resourceId, req)
        case 'orders':
          return await handleOrdersAPI(supabase, method, resourceId, req, keyData)
        case 'analytics':
          return await handleAnalyticsAPI(supabase, method, req, keyData)
        default:
          return new Response(
            JSON.stringify({ error: 'Resource not found', code: 'RESOURCE_NOT_FOUND' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
      }
    }

    return new Response(
      JSON.stringify({ error: 'Endpoint not found', code: 'ENDPOINT_NOT_FOUND' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Route error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal routing error', code: 'ROUTING_ERROR' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
}

async function handleProductsAPI(supabase: any, method: string, resourceId: string | undefined, req: Request): Promise<Response> {
  if (method === 'GET') {
    if (resourceId) {
      const { data, error } = await supabase
        .from('products')
        .select('*, product_images(*), product_variants(*)')
        .eq('id', resourceId)
        .eq('active', true)
        .single()

      if (error || !data) {
        return new Response(
          JSON.stringify({ error: 'Product not found', code: 'PRODUCT_NOT_FOUND' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      const url = new URL(req.url)
      const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
      const offset = parseInt(url.searchParams.get('offset') || '0')
      
      const { data, error, count } = await supabase
        .from('products')
        .select('*, product_images(image_url), product_variants(*)', { count: 'exact' })
        .eq('active', true)
        .range(offset, offset + limit - 1)
        .order('created_at', { ascending: false })

      if (error) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch products', code: 'FETCH_ERROR' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ 
          data, 
          meta: { 
            total: count, 
            limit, 
            offset,
            has_more: (offset + limit) < (count || 0)
          } 
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleOrdersAPI(supabase: any, method: string, resourceId: string | undefined, req: Request, keyData: APIKey): Promise<Response> {
  if (method === 'GET') {
    const url = new URL(req.url)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100)
    const offset = parseInt(url.searchParams.get('offset') || '0')
    
    const { data, error, count } = await supabase
      .from('orders')
      .select('*, order_items(*)', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch orders', code: 'FETCH_ERROR' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        data, 
        meta: { total: count, limit, offset, has_more: (offset + limit) < (count || 0) } 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (method === 'POST') {
    const body = await req.json()
    
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...body,
        user_id: keyData.user_id // Associate with API key owner
      }])
      .select()
      .single()

    if (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to create order', code: 'CREATE_ERROR', details: error.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ data }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function handleAnalyticsAPI(supabase: any, method: string, req: Request, keyData: APIKey): Promise<Response> {
  if (method === 'GET') {
    const url = new URL(req.url)
    const days = Math.min(parseInt(url.searchParams.get('days') || '30'), 365)
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    // Get analytics data
    const { data: orders } = await supabase
      .from('orders')
      .select('total, status, created_at')
      .gte('created_at', startDate)

    const analytics = {
      total_orders: orders?.length || 0,
      total_revenue: orders?.reduce((sum: number, order: any) => sum + (order.total || 0), 0) || 0,
      completed_orders: orders?.filter((order: any) => order.status === 'completed').length || 0,
      avg_order_value: orders?.length ? (orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0) / orders.length) : 0,
      period_days: days,
      generated_at: new Date().toISOString()
    }

    return new Response(
      JSON.stringify({ data: analytics }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed', code: 'METHOD_NOT_ALLOWED' }),
    { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

async function logRequest(supabase: any, requestData: {
  api_key_id: string | null;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  ip_address: string;
  user_agent: string;
}) {
  try {
    await supabase
      .from('api_requests')
      .insert([{
        ...requestData,
        request_size: 0, // Could be calculated from request body
        response_size: 0 // Could be calculated from response body
      }])
  } catch (error) {
    console.error('Failed to log request:', error)
  }
}