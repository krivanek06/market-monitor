import { $, component$, useComputed$, useSignal } from '@builder.io/qwik';
import { Button } from './Button';
import { CardBasic } from './Card-basic';

export type ImagePreviewProps = {
  images: { src: string; alt: string }[];
};

export const ImagePreview = component$<ImagePreviewProps>((props) => {
  const selectedImageIndex = useSignal(0);

  const indexChangeClick = $((changeValue: number) => {
    const oldIndex = selectedImageIndex.value;
    // prevent overflow
    const newValue = (oldIndex + changeValue) % props.images.length;
    selectedImageIndex.value = newValue < 0 ? props.images.length - 1 : newValue;
  });

  const selectedImage = useComputed$(() => props.images[selectedImageIndex.value]);

  return (
    <div>
      {/* preview selected image */}
      <div class="mb-10">
        <h3 class="text-center mb-2 text-2xl capitalize">{selectedImage.value.alt}</h3>
        <CardBasic class="w-fit mx-auto">
          <img src={selectedImage.value.src} alt="image preview" class="h-[340px] rounded-lg" />
        </CardBasic>
      </div>

      {/* slider image */}
      <div class="flex gap-6 h-20">
        {/* left arrow */}
        <div class="grid">
          <Button class="w-11/12" onClick$={() => indexChangeClick(-1)}>
            <span class="material-symbols-outlined">arrow_back_ios</span>
          </Button>
        </div>
        {/* images */}
        <div class="flex overflow-x-scroll flex-1 gap-x-3 py-2 g-no-scrollbar">
          {props.images.map((image, index) => (
            <button type="button" onClick$={() => (selectedImageIndex.value = index)}>
              <img
                src={image.src}
                alt="image preview"
                class={[
                  'min-w-[200px] h-full w-full object-cover rounded-lg hover:scale-105 transition-all duration-300 cursor-pointer hover:brightness-100',
                  index === selectedImageIndex.value
                    ? 'outline outline-4 outline-cyan-700 brightness-100'
                    : 'brightness-50',
                ]}
              />
            </button>
          ))}
        </div>
        {/* right arrow */}
        <div class="grid">
          <Button class="w-11/12" onClick$={() => indexChangeClick(1)}>
            <span class="material-symbols-outlined">arrow_forward_ios</span>
          </Button>
        </div>
      </div>
    </div>
  );
});
