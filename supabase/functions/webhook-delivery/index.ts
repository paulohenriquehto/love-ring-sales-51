import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WebhookEvent {
  event: string;
  data: any;
  timestamp: string;
  source: string;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  active: boolean;
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

    const { event, data, source } = await req.json()

    console.log(`Webhook delivery triggered: ${event} from ${source}`)

    // Get all active webhooks that listen to this event
    const { data: webhooks, error } = await supabaseClient
      .from('webhooks')
      .select('*')
      .eq('active', true)
      .contains('events', [event])

    if (error) {
      console.error('Error fetching webhooks:', error)
      throw error
    }

    if (!webhooks || webhooks.length === 0) {
      console.log(`No active webhooks found for event: ${event}`)
      return new Response(
        JSON.stringify({ message: 'No webhooks to deliver', event }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found ${webhooks.length} webhooks for event: ${event}`)

    // Prepare webhook payload
    const payload: WebhookEvent = {
      event,
      data,
      timestamp: new Date().toISOString(),
      source: source || 'api'
    }

    // Deliver to all matching webhooks
    const deliveryPromises = webhooks.map((webhook: WebhookEndpoint) => 
      deliverWebhook(webhook, payload, supabaseClient)
    )

    const results = await Promise.allSettled(deliveryPromises)
    
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    console.log(`Webhook delivery complete: ${successful} successful, ${failed} failed`)

    return new Response(
      JSON.stringify({ 
        message: 'Webhooks delivered',
        event,
        delivered: successful,
        failed,
        total: webhooks.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Webhook delivery error:', error)
    return new Response(
      JSON.stringify({ error: 'Webhook delivery failed', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function deliverWebhook(webhook: WebhookEndpoint, payload: WebhookEvent, supabase: any): Promise<void> {
  const startTime = performance.now()
  let success = false
  let statusCode = 0
  let errorMessage = ''

  try {
    console.log(`Delivering webhook to: ${webhook.url}`)

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Lovable-Webhooks/1.0',
      'X-Webhook-Event': payload.event,
      'X-Webhook-Timestamp': payload.timestamp,
      'X-Webhook-Source': payload.source
    }

    // Add signature if webhook has a secret
    if (webhook.secret) {
      const signature = await generateSignature(JSON.stringify(payload), webhook.secret)
      headers['X-Webhook-Signature'] = signature
    }

    // Make the webhook request with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const response = await fetch(webhook.url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeoutId)
    statusCode = response.status
    success = response.ok

    if (!response.ok) {
      const responseText = await response.text()
      errorMessage = `HTTP ${response.status}: ${responseText}`
      console.error(`Webhook delivery failed: ${errorMessage}`)
    } else {
      console.log(`Webhook delivered successfully to ${webhook.url}`)
    }

  } catch (error) {
    console.error(`Webhook delivery error for ${webhook.url}:`, error)
    errorMessage = error.message
    if (error.name === 'AbortError') {
      statusCode = 408 // Request Timeout
      errorMessage = 'Request timeout'
    } else if (error.name === 'TypeError') {
      statusCode = 0 // Network error
      errorMessage = 'Network error'
    } else {
      statusCode = 500
    }
  }

  const responseTime = performance.now() - startTime

  // Log the delivery attempt
  try {
    await supabase
      .from('webhook_deliveries')
      .insert([{
        webhook_id: webhook.id,
        event: payload.event,
        status_code: statusCode,
        response_time_ms: Math.round(responseTime),
        success,
        error_message: errorMessage || null,
        payload: payload,
        delivered_at: new Date().toISOString()
      }])
  } catch (logError) {
    console.error('Failed to log webhook delivery:', logError)
  }

  if (!success) {
    throw new Error(`Webhook delivery failed: ${errorMessage}`)
  }
}

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const payloadData = encoder.encode(payload)

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, payloadData)
  const hashArray = Array.from(new Uint8Array(signature))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  
  return `sha256=${hashHex}`
}