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

    // Start background processing with proper async handling
    processImport(supabase, importId, csvData, config).catch(error => {
      console.error('Background import process failed:', error);
    });

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
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  try {
    // Optimized batch size based on data volume
    const batchSize = csvData.rows.length > 500 ? 25 : csvData.rows.length > 100 ? 15 : 10;
    const totalBatches = Math.ceil(csvData.rows.length / batchSize);

    console.log(`Starting optimized import: ${csvData.rows.length} products in ${totalBatches} batches of ${batchSize}`);

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const startIndex = batchIndex * batchSize;
      const endIndex = Math.min(startIndex + batchSize, csvData.rows.length);
      const batch = csvData.rows.slice(startIndex, endIndex);

      console.log(`Processing batch ${batchIndex + 1}/${totalBatches} (${batch.length} products)`);

      // Process batch with retry logic
      let batchSuccess = false;
      let retryCount = 0;

      while (!batchSuccess && retryCount < maxRetries) {
        try {
          // Process each product in the batch with parallel processing for non-conflicting operations
          const batchPromises = batch.map(async (row, i) => {
            const rowIndex = startIndex + i;
            try {
              await processProduct(supabase, csvData.headers, row, config, rowIndex, successLog, errorLog);
              return { success: true, rowIndex };
            } catch (error) {
              console.error(`Error processing row ${rowIndex}:`, error);
              errorLog.push({
                row: rowIndex + 2,
                product: getProductName(csvData.headers, row, config.mapping),
                error: 'Erro no processamento',
                details: error.message,
                retry_attempt: retryCount + 1,
              });
              return { success: false, rowIndex };
            }
          });

          const results = await Promise.allSettled(batchPromises);
          processedCount += results.length;
          batchSuccess = true;

          // Update progress more frequently for better UX
          if (processedCount % 3 === 0 || batchIndex === totalBatches - 1) {
            await updateProgress(supabase, importId, processedCount, successLog.length, errorLog.length, csvData.totalRows, errorLog, successLog);
          }

        } catch (batchError) {
          retryCount++;
          console.error(`Batch ${batchIndex + 1} failed (attempt ${retryCount}):`, batchError);
          
          if (retryCount < maxRetries) {
            console.log(`Retrying batch ${batchIndex + 1} in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay * retryCount));
          } else {
            // Mark all products in batch as failed
            batch.forEach((row, i) => {
              const rowIndex = startIndex + i;
              errorLog.push({
                row: rowIndex + 2,
                product: getProductName(csvData.headers, row, config.mapping),
                error: 'Falha no lote após múltiplas tentativas',
                details: batchError.message,
                retry_attempt: retryCount,
              });
            });
            processedCount += batch.length;
            batchSuccess = true; // Continue to next batch
          }
        }
      }

      // Adaptive delay between batches based on performance
      const delayTime = csvData.rows.length > 1000 ? 200 : csvData.rows.length > 500 ? 150 : 100;
      await new Promise(resolve => setTimeout(resolve, delayTime));

      // Check for cancellation every batch
      const { data: currentStatus } = await supabase
        .from('import_logs')
        .select('status')
        .eq('id', importId)
        .single();

      if (currentStatus?.status === 'cancelled') {
        console.log('Import cancelled by user');
        return;
      }
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
    
    const systemError = {
      row: 'Sistema',
      product: 'Falha Geral',
      error: 'Erro crítico na importação',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    };
    
    try {
      await supabase
        .from('import_logs')
        .update({ 
          status: 'failed',
          processed_products: processedCount,
          success_count: successLog.length,
          error_count: errorLog.length + 1,
          error_log: [...errorLog, systemError],
          success_log: successLog
        })
        .eq('id', importId);
    } catch (updateError) {
      console.error('Failed to update import status after error:', updateError);
    }
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
  
  // Validate input data
  if (!headers || !Array.isArray(headers)) {
    throw new Error('Headers inválidos');
  }
  
  if (!row || !Array.isArray(row)) {
    throw new Error('Dados da linha inválidos');
  }
  
  // Extract mapped values with validation
  const productData: any = {};
  headers.forEach((header, index) => {
    const mappedField = mapping[header];
    if (mappedField && mappedField !== 'ignore') {
      const value = row[index];
      productData[mappedField] = (value && typeof value === 'string') ? value.trim() : null;
    }
  });

  // Validate required fields with detailed messages
  if (!productData.name || productData.name === '') {
    throw new Error('Nome do produto é obrigatório e não pode estar vazio');
  }

  if (!productData.base_price || productData.base_price === '') {
    throw new Error('Preço base é obrigatório e não pode estar vazio');
  }

  // Validate name length
  if (productData.name.length > 255) {
    throw new Error('Nome do produto deve ter no máximo 255 caracteres');
  }

  // Parse and validate numeric fields
  if (productData.base_price) {
    // Clean price string and convert to number
    const cleanPrice = productData.base_price.replace(/[^0-9.,]/g, '').replace(',', '.');
    const price = parseFloat(cleanPrice);
    
    if (isNaN(price) || price < 0) {
      throw new Error(`Preço inválido: "${productData.base_price}". Use formato numérico válido (ex: 10.50)`);
    }
    
    if (price > 999999.99) {
      throw new Error('Preço deve ser menor que R$ 999.999,99');
    }
    
    productData.base_price = price;
  }

  if (productData.weight) {
    const cleanWeight = productData.weight.toString().replace(',', '.');
    const weight = parseFloat(cleanWeight);
    
    if (!isNaN(weight) && weight >= 0) {
      if (weight > 9999.99) {
        throw new Error('Peso deve ser menor que 9999.99 kg');
      }
      productData.weight = weight;
    } else {
      delete productData.weight;
    }
  }

  // Validate SKU format if provided
  if (productData.sku && productData.sku.length > 100) {
    throw new Error('SKU deve ter no máximo 100 caracteres');
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