import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImportRequest {
  importId: string;
  csvData: {
    headers: string[];
    rows: string[][];
    fileName: string;
    totalRows: number;
  };
  config: {
    mapping: { [csvColumn: string]: string | null };
    duplicateHandling: 'skip' | 'update' | 'error';
    categoryCreation: boolean;
    materialCreation: boolean;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { importId, csvData, config }: ImportRequest = await req.json();

    console.log(`Starting import for ${importId} with ${csvData.totalRows} products`);

    // Update status to processing
    await supabase
      .from('import_logs')
      .update({ status: 'processing' })
      .eq('id', importId);

    // Start background processing
    EdgeRuntime.waitUntil(processImport(supabase, importId, csvData, config));

    return new Response(
      JSON.stringify({ success: true, importId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processImport(
  supabase: any,
  importId: string,
  csvData: any,
  config: any
) {
  const errorLog: any[] = [];
  const successLog: any[] = [];
  let processedCount = 0;

  try {
    // Process products in batches of 10
    const batchSize = 10;
    const totalBatches = Math.ceil(csvData.rows.length / batchSize);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, csvData.rows.length);
      const batch = csvData.rows.slice(startIndex, endIndex);

      console.log(`Processing batch ${batchIndex + 1}/${totalBatches}`);

      // Process each product in the batch
      for (let i = 0; i < batch.length; i++) {
        const rowIndex = startIndex + i;
        const row = batch[i];

        try {
          await processProduct(supabase, csvData.headers, row, config, rowIndex, successLog, errorLog);
          processedCount++;
        } catch (error) {
          console.error(`Error processing row ${rowIndex}:`, error);
          errorLog.push({
            row: rowIndex + 2, // +2 because row 1 is headers and arrays are 0-indexed
            product: getProductName(csvData.headers, row, config.mapping),
            error: 'Erro no processamento',
            details: error.message,
          });
          processedCount++;
        }

        // Update progress every 5 products
        if (processedCount % 5 === 0) {
          await updateProgress(supabase, importId, processedCount, successLog.length, errorLog.length, csvData.totalRows, errorLog, successLog);
        }
      }

      // Small delay between batches to prevent overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final update
    await updateProgress(supabase, importId, processedCount, successLog.length, errorLog.length, csvData.totalRows, errorLog, successLog);

    // Mark as completed
    await supabase
      .from('import_logs')
      .update({ 
        status: 'completed',
        processed_products: processedCount,
        success_count: successLog.length,
        error_count: errorLog.length,
        error_log: errorLog,
        success_log: successLog
      })
      .eq('id', importId);

    console.log(`Import ${importId} completed. Success: ${successLog.length}, Errors: ${errorLog.length}`);

  } catch (error) {
    console.error('Import failed:', error);
    
    await supabase
      .from('import_logs')
      .update({ 
        status: 'failed',
        processed_products: processedCount,
        success_count: successLog.length,
        error_count: errorLog.length,
        error_log: [...errorLog, {
          row: 'N/A',
          product: 'Sistema',
          error: 'Falha geral na importação',
          details: error.message,
        }],
        success_log: successLog
      })
      .eq('id', importId);
  }
}

async function processProduct(
  supabase: any,
  headers: string[],
  row: string[],
  config: any,
  rowIndex: number,
  successLog: any[],
  errorLog: any[]
) {
  const mapping = config.mapping;
  
  // Extract mapped values
  const productData: any = {};
  headers.forEach((header, index) => {
    const mappedField = mapping[header];
    if (mappedField && mappedField !== 'ignore') {
      productData[mappedField] = row[index]?.trim() || null;
    }
  });

  // Validate required fields
  if (!productData.name) {
    throw new Error('Nome do produto é obrigatório');
  }

  if (!productData.base_price) {
    throw new Error('Preço base é obrigatório');
  }

  // Parse numeric fields
  if (productData.base_price) {
    const price = parseFloat(productData.base_price.replace(/[^0-9.,]/g, '').replace(',', '.'));
    if (isNaN(price)) {
      throw new Error('Preço inválido');
    }
    productData.base_price = price;
  }

  if (productData.weight) {
    const weight = parseFloat(productData.weight.replace(',', '.'));
    if (!isNaN(weight)) {
      productData.weight = weight;
    } else {
      delete productData.weight;
    }
  }

  // Handle category
  let categoryId = null;
  if (productData.category && config.categoryCreation) {
    categoryId = await getOrCreateCategory(supabase, productData.category);
  }

  // Handle material
  let materialId = null;
  if (productData.material && config.materialCreation) {
    materialId = await getOrCreateMaterial(supabase, productData.material);
  }

  // Check for existing product by SKU
  let existingProduct = null;
  if (productData.sku) {
    const { data } = await supabase
      .from('products')
      .select('id')
      .eq('sku', productData.sku)
      .maybeSingle();
    existingProduct = data;
  }

  if (existingProduct) {
    if (config.duplicateHandling === 'skip') {
      successLog.push({
        product: productData.name,
        sku: productData.sku,
        id: existingProduct.id,
        status: 'Pulado (duplicata)',
      });
      return;
    } else if (config.duplicateHandling === 'error') {
      throw new Error(`Produto com SKU ${productData.sku} já existe`);
    }
    // Update mode will be handled below
  }

  // Prepare product insert/update data
  const productInsertData = {
    name: productData.name,
    description: productData.description || null,
    sku: productData.sku || null,
    base_price: productData.base_price,
    weight: productData.weight || null,
    category_id: categoryId,
    active: true,
  };

  let productId;

  if (existingProduct && config.duplicateHandling === 'update') {
    // Update existing product
    const { error: updateError } = await supabase
      .from('products')
      .update(productInsertData)
      .eq('id', existingProduct.id);

    if (updateError) throw updateError;
    productId = existingProduct.id;

    successLog.push({
      product: productData.name,
      sku: productData.sku,
      id: productId,
      status: 'Atualizado',
    });
  } else {
    // Create new product
    const { data: product, error: productError } = await supabase
      .from('products')
      .insert(productInsertData)
      .select('id')
      .single();

    if (productError) throw productError;
    productId = product.id;

    successLog.push({
      product: productData.name,
      sku: productData.sku,
      id: productId,
      status: 'Criado',
    });
  }

  // Handle product images
  if (productData.images) {
    await processProductImages(supabase, productId, productData.images);
  }

  // Handle variants (if we have size, color, or material data)
  if (productData.size || productData.color || materialId || productData.width) {
    await createProductVariant(supabase, productId, {
      size: productData.size,
      color: productData.color,
      material_id: materialId,
      width: productData.width,
    });
  }

  // Handle stock
  if (productData.stock_quantity) {
    await updateInventory(supabase, productId, parseInt(productData.stock_quantity) || 0);
  }
}

async function getOrCreateCategory(supabase: any, categoryName: string): Promise<string | null> {
  if (!categoryName) return null;

  // Check if category exists
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('name', categoryName)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  // Create new category
  const { data: newCategory, error } = await supabase
    .from('categories')
    .insert({
      name: categoryName,
      active: true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return newCategory.id;
}

async function getOrCreateMaterial(supabase: any, materialName: string): Promise<string | null> {
  if (!materialName) return null;

  // Check if material exists
  const { data: existing } = await supabase
    .from('materials')
    .select('id')
    .eq('name', materialName)
    .maybeSingle();

  if (existing) {
    return existing.id;
  }

  // Create new material
  const { data: newMaterial, error } = await supabase
    .from('materials')
    .insert({
      name: materialName,
      active: true,
    })
    .select('id')
    .single();

  if (error) throw error;
  return newMaterial.id;
}

async function processProductImages(supabase: any, productId: string, imageUrls: string) {
  if (!imageUrls) return;

  // Split multiple URLs (comma or semicolon separated)
  const urls = imageUrls.split(/[,;]/).map(url => url.trim()).filter(url => url);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    if (!isValidUrl(url)) continue;

    try {
      // For now, just store the URL directly
      // In a production system, you might want to download and store the images
      await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: url,
          is_primary: i === 0,
          display_order: i,
        });
    } catch (error) {
      console.error(`Error adding image ${url}:`, error);
      // Continue with other images
    }
  }
}

async function createProductVariant(supabase: any, productId: string, variantData: any) {
  const { error } = await supabase
    .from('product_variants')
    .insert({
      product_id: productId,
      size: variantData.size || null,
      color: variantData.color || null,
      material_id: variantData.material_id || null,
      width: variantData.width || null,
      active: true,
    });

  if (error) throw error;
}

async function updateInventory(supabase: any, productId: string, quantity: number) {
  // Get default warehouse
  const { data: warehouse } = await supabase
    .from('warehouses')
    .select('id')
    .eq('active', true)
    .limit(1)
    .maybeSingle();

  if (!warehouse) return;

  // Update or insert inventory
  await supabase
    .from('inventory')
    .upsert({
      product_id: productId,
      warehouse_id: warehouse.id,
      quantity_available: quantity,
      quantity_reserved: 0,
      minimum_stock: 5,
    }, {
      onConflict: 'product_id,warehouse_id',
    });
}

async function updateProgress(
  supabase: any,
  importId: string,
  processed: number,
  success: number,
  errors: number,
  total: number,
  errorLog: any[],
  successLog: any[]
) {
  await supabase
    .from('import_logs')
    .update({
      processed_products: processed,
      success_count: success,
      error_count: errors,
      error_log: errorLog,
      success_log: successLog,
    })
    .eq('id', importId);
}

function getProductName(headers: string[], row: string[], mapping: any): string {
  const nameIndex = headers.findIndex(header => mapping[header] === 'name');
  return nameIndex >= 0 ? row[nameIndex] || 'Produto sem nome' : 'Produto sem nome';
}

function isValidUrl(string: string): boolean {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}