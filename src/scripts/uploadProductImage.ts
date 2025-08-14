import { supabase } from '@/integrations/supabase/client';

export const uploadProductImage = async () => {
  try {
    // 1. Get product ID for ANT437
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id')
      .eq('sku', 'ANT437')
      .single();

    if (productError || !product) {
      console.error('Erro ao buscar produto:', productError);
      return;
    }

    console.log('Produto encontrado:', product.id);

    // 2. Upload image to storage
    const imageFile = await fetch('/src/assets/ant437-tungsten-ring.jpg');
    const imageBlob = await imageFile.blob();
    
    const fileName = `ant437-tungsten-ring-${Date.now()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Erro no upload:', uploadError);
      return;
    }

    console.log('Upload realizado:', uploadData);

    // 3. Get public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    const imageUrl = urlData.publicUrl;
    console.log('URL da imagem:', imageUrl);

    // 4. Insert into product_images table
    const { data: imageRecord, error: imageError } = await supabase
      .from('product_images')
      .insert({
        product_id: product.id,
        image_url: imageUrl,
        is_primary: true,
        display_order: 0,
        alt_text: 'Aliança A Certain Romance - Tungstênio com acabamento fosco e dourado'
      })
      .select()
      .single();

    if (imageError) {
      console.error('Erro ao inserir imagem no banco:', imageError);
      return;
    }

    console.log('Imagem inserida no banco:', imageRecord);
    console.log('✅ Upload da imagem do produto ANT437 concluído com sucesso!');
    
    return imageRecord;

  } catch (error) {
    console.error('Erro geral:', error);
  }
};

// Execute the function if running directly
if (typeof window !== 'undefined') {
  (window as any).uploadProductImage = uploadProductImage;
}