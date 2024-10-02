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
        <h3 class="mb-2 text-center text-xl capitalize text-gray-200">{selectedImage.value.alt}</h3>
        <CardBasic class="mx-auto w-fit">
          <img srcset={selectedImage.value.src} alt="image preview" class="h-[400px] rounded-lg" />
        </CardBasic>
      </div>

      {/* slider image */}
      <div class="flex h-20 gap-6">
        {/* left arrow */}
        <div class="grid">
          <Button class="h-11/12 hidden md:block" onClick$={() => indexChangeClick(-1)}>
            <span class="material-symbols-outlined">arrow_back_ios</span>
          </Button>
        </div>
        {/* images */}
        <div class="g-no-scrollbar flex flex-1 gap-x-3 overflow-x-scroll py-2">
          {props.images.map((image, index) => (
            <button key={index} type="button" onClick$={() => (selectedImageIndex.value = index)}>
              <img
                src={image.src}
                alt="image preview"
                loading="lazy"
                width={200}
                height={200}
                class={[
                  'h-full min-w-[200px] cursor-pointer rounded-lg object-cover transition-all duration-300 hover:scale-105 hover:brightness-100',
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
          <Button class="h-11/12 hidden md:block" onClick$={() => indexChangeClick(1)}>
            <span class="material-symbols-outlined">arrow_forward_ios</span>
          </Button>
        </div>
      </div>
    </div>
  );
});
